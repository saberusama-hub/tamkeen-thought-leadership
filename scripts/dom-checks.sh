#!/usr/bin/env bash
# scripts/dom-checks.sh
#
# Verifies that the rendered DOM on a local production server (pnpm start)
# is free of the failure modes that have hit this project in the past.
# Exits non-zero on any failure.
#
# Run by: pnpm dom-checks    (assumes pnpm start is already running on :3000)
# CI-safe.

set -uo pipefail

URL="${URL:-http://localhost:3000}"
FAIL=0

echo "================ DOM CHECKS ================"
echo "  base URL: $URL"
echo

declare -A PAGES=(
  [home]=/
  [about]=/about
  [article]=/articles/decade-that-reshaped-higher-education
  [notfound]=/articles/this-does-not-exist
)

# Step 1: every named page returns the expected status (200 for first three; 404 for not-found).
for name in home about article; do
  path="${PAGES[$name]}"
  status=$(curl -s -o /tmp/${name}.html -w "%{http_code}" "$URL$path")
  if [[ "$status" != "200" ]]; then
    echo "  FAIL  $name ($path) returned $status (expected 200)"
    FAIL=$((FAIL + 1))
  else
    echo "  PASS  $name ($path) returned 200"
  fi
done
status=$(curl -s -L -o /tmp/notfound.html -w "%{http_code}" "$URL${PAGES[notfound]}")
if [[ "$status" != "404" ]]; then
  echo "  FAIL  notfound returned $status (expected 404)"
  FAIL=$((FAIL + 1))
else
  echo "  PASS  notfound returned 404"
fi

# Step 2: /category/* must 301 to /
for tail in research rankings teaching policy global industry students overall anything-goes; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$URL/category/$tail")
  if [[ "$status" != "301" ]]; then
    echo "  FAIL  /category/$tail returned $status (expected 301)"
    FAIL=$((FAIL + 1))
  fi
done
echo "  PASS  /category/* all return 301"

# Step 3: frontmatter leak. The MDX frontmatter must NOT appear in the rendered article body.
for token in 'categoryNumber' 'heroExhibit' '"filedFrom"' 'slug:'; do
  count=$(grep -c "$token" /tmp/article.html || true)
  if [[ "$count" != "0" ]]; then
    echo "  FAIL  frontmatter token '$token' appears $count times in rendered article HTML"
    FAIL=$((FAIL + 1))
  else
    echo "  PASS  '$token' absent from rendered article HTML"
  fi
done

# Step 4: em dashes in DOM. None should be present after the punctuation cleanup.
for name in home about article notfound; do
  count=$(grep -o "—" /tmp/${name}.html | wc -l | tr -d ' ')
  if [[ "$count" != "0" ]]; then
    echo "  FAIL  em-dashes in $name DOM: $count (expected 0)"
    FAIL=$((FAIL + 1))
  else
    echo "  PASS  em-dashes in $name DOM: 0"
  fi
done

# Step 5: every article anchor (#brief, #systems, ...) is present in the article HTML.
for anchor in brief systems landscape break pillars uae movers implications outlook methodology; do
  if grep -q "id=\"$anchor\"" /tmp/article.html; then
    : # OK
  else
    echo "  FAIL  article missing id=\"$anchor\""
    FAIL=$((FAIL + 1))
  fi
done
echo "  PASS  every expected article anchor present"

# Step 6: the centred wordmark renders on every page.
for name in home about article; do
  if grep -q "The Index" /tmp/${name}.html; then
    : # OK
  else
    echo "  FAIL  $name does not contain 'The Index' wordmark"
    FAIL=$((FAIL + 1))
  fi
done
echo "  PASS  'The Index' wordmark on every page"

# Step 7: sitemap excludes /category/*.
status=$(curl -s -o /tmp/sitemap.xml -w "%{http_code}" "$URL/sitemap.xml")
if [[ "$status" != "200" ]]; then
  echo "  FAIL  sitemap.xml status $status"
  FAIL=$((FAIL + 1))
else
  cat_count=$(grep -c "/category/" /tmp/sitemap.xml || true)
  if [[ "$cat_count" != "0" ]]; then
    echo "  FAIL  sitemap.xml contains $cat_count /category/ URLs (expected 0)"
    FAIL=$((FAIL + 1))
  else
    echo "  PASS  sitemap.xml contains no /category/ URLs"
  fi
fi

# Step 8: the dark green Folio strip is rendered on every page.
for name in home about article; do
  if grep -q "bg-green text-paper" /tmp/${name}.html || grep -q "Tamkeen Thought Leadership" /tmp/${name}.html; then
    : # OK
  else
    echo "  FAIL  $name does not include the Folio strip"
    FAIL=$((FAIL + 1))
  fi
done
echo "  PASS  Folio strip on every page"

# Cleanup
rm -f /tmp/home.html /tmp/about.html /tmp/article.html /tmp/notfound.html /tmp/sitemap.xml

echo
if [[ "$FAIL" == "0" ]]; then
  echo "================ ALL DOM CHECKS PASS ================"
  exit 0
else
  echo "================ $FAIL DOM CHECK(S) FAILED ================"
  exit 1
fi
