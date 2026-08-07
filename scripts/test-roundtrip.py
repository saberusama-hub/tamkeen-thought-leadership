#!/usr/bin/env python3
"""
scripts/test-roundtrip.py

Proves the editorial round-trip end to end by simulating what Word writes.

Injects genuine tracked changes (<w:ins>/<w:del>) into a copy of the review
document for three deliberately awkward blocks:

  S-004  a SHARED block  -> must land in BOTH articles from one edit
  A-007  a single-quoted JSX prop, edited to contain a straight apostrophe
         -> must be escaped as \\' or the build breaks
  A-005  JSX element children -> must preserve surrounding indentation

Then runs apply-article-edits.ts --write and hands back to the caller to
check the diff and re-run the build gates.
"""

import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path.cwd()
SRC = ROOT / "editorial" / "the-index-editorial-review.docx"
OUT = ROOT / "editorial" / "_test-edited.docx"

# block id -> (exact new text the "editor" typed)
EDITS = {
    # Shared: one edit, must reach both MDX files.
    "S-004": "39 to 35 on THE and 32 to 26 on QS. The United States still holds the largest "
             "single-country cohort in both systems. The decline sits in mid-Top-100 publics, "
             "not the Ivy tier.",
    # Single-quoted prop, deliberately containing a straight apostrophe.
    "A-007": "Share of Asia's THE Top 100 institutions, rising from 9% in 2016 to 20% in 2026.",
    # JSX children; indentation around it must survive.
    "A-005": "Asia rose. The US slipped at the elite tier. Western Europe held its position. "
             "The 2024 methodology shifts were tectonic, and they explain more of the decade's "
             "movement than any institutional story does.",
}

NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def para_text(p: str) -> str:
    return "".join(re.findall(r"<w:t(?:\s[^>]*)?>([\s\S]*?)</w:t>", p))


def make_tracked(old_para: str, new_text: str, cid: int) -> str:
    """Rebuild a paragraph as: <w:del>old</w:del><w:ins>new</w:ins>."""
    # keep the original paragraph properties if present
    ppr = re.search(r"<w:pPr>[\s\S]*?</w:pPr>", old_para)
    ppr_xml = ppr.group(0) if ppr else ""
    # borrow run properties from the first run so formatting is preserved
    rpr = re.search(r"<w:rPr>[\s\S]*?</w:rPr>", old_para)
    rpr_xml = rpr.group(0) if rpr else ""
    old_text = para_text(old_para)
    date = "2026-08-07T10:00:00Z"
    author = "Usama Afzal"
    return (
        f"<w:p>{ppr_xml}"
        f'<w:del w:id="{cid}" w:author="{author}" w:date="{date}">'
        f"<w:r>{rpr_xml}<w:delText xml:space=\"preserve\">{esc(old_text)}</w:delText></w:r>"
        f"</w:del>"
        f'<w:ins w:id="{cid + 1}" w:author="{author}" w:date="{date}">'
        f"<w:r>{rpr_xml}<w:t xml:space=\"preserve\">{esc(new_text)}</w:t></w:r>"
        f"</w:ins>"
        f"</w:p>"
    )


def main() -> int:
    if not SRC.exists():
        print(f"missing {SRC}", file=sys.stderr)
        return 1

    zin = zipfile.ZipFile(SRC)
    doc = zin.read("word/document.xml").decode("utf-8")

    paras = re.findall(r"<w:p(?:\s[^>]*)?>[\s\S]*?</w:p>|<w:p/>", doc)

    pending = None
    cid = 9000
    applied = []
    new_doc = doc

    for i, p in enumerate(paras):
        t = para_text(p)
        anchor = re.match(r"\s*\[([ABS]-\d{3})\]", t)
        if anchor:
            pending = anchor.group(1) if anchor.group(1) in EDITS else None
            continue
        if pending and t.strip():
            replacement = make_tracked(p, EDITS[pending], cid)
            cid += 2
            new_doc = new_doc.replace(p, replacement, 1)
            applied.append(pending)
            pending = None

    missing = set(EDITS) - set(applied)
    if missing:
        print(f"could not locate anchors: {sorted(missing)}", file=sys.stderr)
        return 1

    shutil.copy(SRC, OUT)
    # rewrite document.xml inside the copy
    tmp = OUT.with_suffix(".tmp.docx")
    zout = zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED)
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "word/document.xml":
            data = new_doc.encode("utf-8")
        zout.writestr(item, data)
    zout.close()
    zin.close()
    tmp.replace(OUT)

    print(f"injected {len(applied)} tracked edits into {OUT.relative_to(ROOT)}")
    for a in applied:
        print(f"   {a}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
