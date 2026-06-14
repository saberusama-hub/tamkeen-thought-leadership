#!/usr/bin/env python3
"""
scripts/check-qs-2027-rankings.py

Detects whether the QS World University Rankings 2027 (overall table) have
gone live, for the qs-2027-rankings-monitor GitHub Actions workflow.

Dependency-free (Python 3 stdlib only) so it runs on a clean CI runner with
no `pip install` step.

Why multi-source: topuniversities.com is Cloudflare-protected and frequently
returns HTTP 403 to datacenter/CI traffic, so it cannot be the only signal.
We combine three independent sources and declare "released" if ANY confident
signal fires:

  1. topuniversities.com (AUTHORITATIVE, but may be blocked on CI)
       - the canonical /world-university-rankings page reflects the latest
         *released* edition in its <title>/<h1>; year >= 2027 ⇒ released.
       - the /world-university-rankings/2027 results URL returning HTTP 200
         with live results markers (and no "coming soon") ⇒ released.

  2. Wikipedia (robust, automation-friendly, updated fast by editors)
       - the "QS World University Rankings" article plaintext extract
         mentions 2027 in a release/results context (not "to be released").

  3. Google News RSS (near-real-time early warning)
       - >= 2 recent items (last 14 days) whose headlines use release
         language ("released/published/announced/tops/...") and are NOT
         data-submission/registration articles.

Each source is independent: if one is blocked or down, the others still work.
The notification email always includes the triggering source + URL so a human
can confirm in one click.

Usage:
  python3 scripts/check-qs-2027-rankings.py            # run the live check
  python3 scripts/check-qs-2027-rankings.py --selftest # offline logic tests

Exit code is 0 for a successful check (released or not) and for --selftest
success; transient network failures count as "not released" so the next
scheduled run simply retries.
"""

from __future__ import annotations

import datetime as dt
import email.utils
import json
import os
import re
import sys
import urllib.error
import urllib.request

TARGET_YEAR = 2027

MAIN_URL = "https://www.topuniversities.com/world-university-rankings"
YEAR_URL = f"https://www.topuniversities.com/world-university-rankings/{TARGET_YEAR}"
WIKI_URL = (
    "https://en.wikipedia.org/w/api.php?action=query&prop=extracts"
    "&explaintext=1&redirects=1&format=json&titles=QS_World_University_Rankings"
)
NEWS_URL = (
    "https://news.google.com/rss/search?q=%22QS+World+University+Rankings"
    "+2027%22&hl=en-US&gl=US&ceid=US:en"
)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

NEWS_RECENCY_DAYS = 14
NEWS_MIN_ITEMS = 2

# A page/headline is showing real, live results.
RESULTS_MARKERS = [
    r"overall\s+score",
    r'"@type"\s*:\s*"ItemList"',
    r'"itemListElement"',
    r"data-rank=",
    r"indicator[-_]overall",
]
RELEASE_WORDS = [
    r"\breleased\b",
    r"\bpublished\b",
    r"\bannounced\b",
    r"\bunveiled\b",
    r"\bout\s+now\b",
    r"\btops?\b",
    r"\btopped\b",
    r"\brevealed\b",
    r"\bresults\b",
]
# Language that means "not the live overall table" (teaser / data collection).
EXCLUDE_WORDS = [
    r"coming\s+soon",
    r"will\s+be\s+released",
    r"to\s+be\s+released",
    r"results\s+will\s+be",
    r"register\s+your\s+interest",
    r"submit\s+your\s+data",
    r"data\s+submission",
    r"submission\s+deadline",
    r"\bdeadline\b",
    r"\bregister\b",
    r"participate",
    r"data\s+collection",
    r"sign\s+up\s+to\s+be\s+notified",
]


def fetch(url: str, timeout: int = 30) -> tuple[int, str]:
    """Return (status_code, body); status 0 means the request failed."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.getcode(), resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        return exc.code, ""
    except Exception as exc:  # noqa: BLE001 - network flakiness must not crash
        print(f"  ! request to {url} failed: {exc}", file=sys.stderr)
        return 0, ""


def has_any(text: str, patterns: list[str]) -> bool:
    return any(re.search(p, text, re.I) for p in patterns)


# --------------------------------------------------------------------------
# Pure detection helpers (unit-tested by --selftest)
# --------------------------------------------------------------------------
def edition_year_from(body: str) -> int | None:
    """Largest 'World University Rankings <year>' year in title/og/h1 text."""
    scopes: list[str] = []
    m = re.search(r"<title[^>]*>(.*?)</title>", body, re.I | re.S)
    if m:
        scopes.append(m.group(1))
    for m in re.finditer(
        r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)', body, re.I
    ):
        scopes.append(m.group(1))
    for m in re.finditer(r"<h1[^>]*>(.*?)</h1>", body, re.I | re.S):
        scopes.append(m.group(1))
    if not scopes:
        scopes.append(body)
    years = [
        int(ym.group(1))
        for scope in scopes
        for ym in re.finditer(
            r"world\s+university\s+rankings[^0-9]{0,20}(20\d{2})", scope, re.I
        )
    ]
    return max(years) if years else None


def topuniversities_year_page_is_live(body: str) -> bool:
    """A 200 results page that looks live and is not a teaser."""
    return has_any(body, RESULTS_MARKERS) and not has_any(body, EXCLUDE_WORDS)


def wikipedia_says_released(extract: str) -> bool:
    """True if the article mentions 2027 in a release/results context."""
    for m in re.finditer(str(TARGET_YEAR), extract):
        lo = max(0, m.start() - 90)
        hi = min(len(extract), m.end() + 90)
        window = extract[lo:hi]
        if has_any(window, RELEASE_WORDS) and not has_any(window, EXCLUDE_WORDS):
            return True
    return False


def news_release_items(rss_xml: str, now: dt.datetime) -> list[str]:
    """Headlines that announce a 2027 *release* within the recency window."""
    hits: list[str] = []
    cutoff = now - dt.timedelta(days=NEWS_RECENCY_DAYS)
    items = re.findall(r"<item>(.*?)</item>", rss_xml, re.I | re.S)
    for item in items:
        tm = re.search(r"<title>(.*?)</title>", item, re.I | re.S)
        if not tm:
            continue
        title = re.sub(r"<!\[CDATA\[(.*?)\]\]>", r"\1", tm.group(1), flags=re.S).strip()
        if str(TARGET_YEAR) not in title:
            continue
        if not has_any(title, RELEASE_WORDS) or has_any(title, EXCLUDE_WORDS):
            continue
        dm = re.search(r"<pubDate>(.*?)</pubDate>", item, re.I | re.S)
        if dm:
            try:
                pub = email.utils.parsedate_to_datetime(dm.group(1).strip())
                if pub.tzinfo is None:
                    pub = pub.replace(tzinfo=dt.timezone.utc)
                if pub < cutoff:
                    continue
            except (TypeError, ValueError):
                pass  # undated -> keep, recency simply not enforced
        hits.append(title)
    return hits


# --------------------------------------------------------------------------
# Live check
# --------------------------------------------------------------------------
def run_check() -> dict:
    released = False
    edition_year: int | None = None
    evidence_parts: list[str] = []
    source_url = ""

    print(f"Checking for QS World University Rankings {TARGET_YEAR} ...\n")

    # 1) topuniversities -----------------------------------------------------
    status, body = fetch(MAIN_URL)
    print(f"  [topuni main]  {MAIN_URL} -> HTTP {status}, {len(body)} bytes")
    if status == 200 and body:
        edition_year = edition_year_from(body)
        print(f"  [topuni main]  latest edition year detected: {edition_year}")
        if edition_year and edition_year >= TARGET_YEAR:
            released = True
            source_url = MAIN_URL
            evidence_parts.append(
                f"topuniversities.com now presents edition {edition_year}"
            )

    status2, body2 = fetch(YEAR_URL)
    print(f"  [topuni year]  {YEAR_URL} -> HTTP {status2}, {len(body2)} bytes")
    if status2 == 200 and body2 and topuniversities_year_page_is_live(body2):
        released = True
        edition_year = edition_year or TARGET_YEAR
        source_url = source_url or YEAR_URL
        evidence_parts.append(f"the {TARGET_YEAR} results page is live")

    # 2) Wikipedia -----------------------------------------------------------
    wstatus, wbody = fetch(WIKI_URL)
    print(f"  [wikipedia]    HTTP {wstatus}, {len(wbody)} bytes")
    if wstatus == 200 and wbody:
        try:
            pages = json.loads(wbody)["query"]["pages"]
            extract = " ".join(p.get("extract", "") for p in pages.values())
        except (ValueError, KeyError):
            extract = ""
        if extract and wikipedia_says_released(extract):
            released = True
            source_url = source_url or "https://en.wikipedia.org/wiki/QS_World_University_Rankings"
            evidence_parts.append("Wikipedia describes the 2027 edition as released")

    # 3) Google News RSS -----------------------------------------------------
    nstatus, nbody = fetch(NEWS_URL)
    print(f"  [news rss]     HTTP {nstatus}, {len(nbody)} bytes")
    if nstatus == 200 and nbody:
        hits = news_release_items(nbody, dt.datetime.now(dt.timezone.utc))
        print(f"  [news rss]     {len(hits)} release-style headline(s) found")
        if len(hits) >= NEWS_MIN_ITEMS:
            released = True
            source_url = source_url or "https://news.google.com/search?q=QS%20World%20University%20Rankings%202027"
            evidence_parts.append(
                f"{len(hits)} recent news headlines report the {TARGET_YEAR} "
                f"rankings are out (e.g. \"{hits[0]}\")"
            )

    evidence = "; ".join(evidence_parts) if evidence_parts else ""
    print()
    if released:
        print(f"RELEASED ✅  {evidence}")
        print(f"Source: {source_url}")
    else:
        print(f"Not released yet (latest seen edition: {edition_year}).")

    return {
        "released": released,
        "edition_year": edition_year,
        "evidence": evidence,
        "source_url": source_url or MAIN_URL,
    }


def write_github_output(result: dict) -> None:
    gh_out = os.environ.get("GITHUB_OUTPUT")
    if not gh_out:
        return
    with open(gh_out, "a", encoding="utf-8") as fh:
        fh.write(f"released={'true' if result['released'] else 'false'}\n")
        fh.write(f"edition_year={result['edition_year'] or ''}\n")
        fh.write(f"evidence={result['evidence']}\n")
        fh.write(f"source_url={result['source_url']}\n")


# --------------------------------------------------------------------------
# Offline self-test of the pure detection logic
# --------------------------------------------------------------------------
def selftest() -> int:
    now = dt.datetime(2026, 6, 18, tzinfo=dt.timezone.utc)
    recent = email.utils.format_datetime(now - dt.timedelta(hours=3))
    old = email.utils.format_datetime(now - dt.timedelta(days=60))
    failures = 0

    def check(name: str, cond: bool) -> None:
        nonlocal failures
        print(f"  {'PASS' if cond else 'FAIL'}  {name}")
        if not cond:
            failures += 1

    # edition_year_from
    check(
        "main page showing 2026 -> 2026",
        edition_year_from("<title>QS World University Rankings 2026 | Top Universities</title>") == 2026,
    )
    check(
        "main page showing 2027 -> 2027",
        edition_year_from("<h1>QS World University Rankings 2027</h1>") == 2027,
    )
    check("no edition mentioned -> None", edition_year_from("<title>Home</title>") is None)

    # topuniversities_year_page_is_live
    check(
        "live results page detected",
        topuniversities_year_page_is_live('<div data-rank="1">MIT</div> Overall Score 100'),
    )
    check(
        "coming-soon teaser rejected",
        not topuniversities_year_page_is_live(
            "QS WUR 2027 coming soon — submit your data. Overall Score preview."
        ),
    )

    # wikipedia_says_released
    check(
        "wiki: 'released in June 2026, the 2027 edition' -> True",
        wikipedia_says_released(
            "The 2027 edition was released in June 2026, with MIT ranked first."
        ),
    )
    check(
        "wiki: 'the 2027 edition is to be released' -> False",
        not wikipedia_says_released(
            "The 2027 edition is to be released in June 2026; data submission closed in April."
        ),
    )

    # news_release_items
    good_rss = f"""
      <rss><channel>
        <item><title>QS World University Rankings 2027 released: MIT tops list</title>
          <pubDate>{recent}</pubDate></item>
        <item><title>QS World University Rankings 2027 published, see top 100</title>
          <pubDate>{recent}</pubDate></item>
        <item><title>UGC begins data submission for QS World University Rankings 2027</title>
          <pubDate>{recent}</pubDate></item>
      </channel></rss>"""
    check("news: 2 release + 1 submission -> 2 hits", len(news_release_items(good_rss, now)) == 2)

    stale_rss = f"""
      <rss><channel>
        <item><title>QS World University Rankings 2027 released</title>
          <pubDate>{old}</pubDate></item>
      </channel></rss>"""
    check("news: stale release headline ignored", len(news_release_items(stale_rss, now)) == 0)

    submission_rss = f"""
      <rss><channel>
        <item><title>Submit your data for QS World University Rankings 2027 before deadline</title>
          <pubDate>{recent}</pubDate></item>
      </channel></rss>"""
    check("news: submission headline ignored", len(news_release_items(submission_rss, now)) == 0)

    print()
    print("SELFTEST OK" if failures == 0 else f"SELFTEST FAILED ({failures})")
    return 1 if failures else 0


def main(argv: list[str]) -> int:
    if "--selftest" in argv:
        return selftest()
    result = run_check()
    write_github_output(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
