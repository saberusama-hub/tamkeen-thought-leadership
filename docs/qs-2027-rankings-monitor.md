# QS 2027 Rankings Monitor

Automatically watches for the release of the **QS World University Rankings
2027** (overall table) and emails **usama.afzal@nyu.edu** the moment it goes
live.

QS publishes mid-June each year (the 2026 edition came out 19 Jun 2025), and
the 2027 edition is expected around **18 June 2026**.

## How it works

- **`.github/workflows/qs-2027-rankings-monitor.yml`** — runs on GitHub's
  infrastructure every 30 minutes (and on manual dispatch), independent of any
  local machine or Claude session.
- **`scripts/check-qs-2027-rankings.py`** — dependency-free (Python stdlib)
  detector that checks three independent sources, so no single block/outage
  hides the release:
  1. **topuniversities.com** — authoritative, but Cloudflare-protected and may
     reject CI traffic, so it can't be the only signal.
  2. **Wikipedia** — the "QS World University Rankings" article, updated quickly
     by editors when a new edition drops.
  3. **Google News RSS** — needs ≥2 recent headlines that report a *release*
     (filtering out the earlier "submit your data" / deadline articles).

  Release is declared if **any** source is confident. Run the offline logic
  tests with `python3 scripts/check-qs-2027-rankings.py --selftest`.

- **Exactly-once email:** on first detection the workflow opens a tracking
  issue labelled `qs-2027-monitor`. While that issue exists, no further emails
  are sent. Delete it to re-arm.

## Required setup — add SMTP secrets

In **Settings → Secrets and variables → Actions**, add:

| Secret | Example | Notes |
| --- | --- | --- |
| `MAIL_SERVER` | `smtp.gmail.com` | SMTP host |
| `MAIL_PORT` | `465` | `465` (SSL) or `587` (STARTTLS) |
| `MAIL_USERNAME` | `you@gmail.com` | also used as the From address |
| `MAIL_PASSWORD` | *app password* | for Gmail, create an [App Password](https://myaccount.google.com/apppasswords) (normal passwords won't work with 2FA) |

If these are not set, the workflow still records detection by opening the
tracking issue and logs a warning that email was skipped — nothing is lost.

> NYU Google Workspace may restrict app passwords/SMTP. A personal Gmail (or
> any SMTP provider / SendGrid-style relay) works fine as the *sender*; the
> email is still delivered to your NYU inbox.

## Verify it works

Trigger the workflow manually with **Run workflow → send_test_email = true**
(Actions tab) to send a test email immediately without waiting for a release.

## Tuning

- **Frequency:** edit the `cron` in the workflow (`*/30 * * * *`). Hourly
  (`0 * * * *`) cuts Actions-minutes usage if the repo is private.
- **Recipient:** change the `RECIPIENT` env value in the workflow.
- **Next year:** bump `TARGET_YEAR` in the script and the workflow file.
