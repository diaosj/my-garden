#!/usr/bin/env bash
# Build the site and assert on the output. Usage: npm run check
set -euo pipefail
cd "$(dirname "$0")/.."
LOG=$(mktemp)
npm run build > "$LOG" 2>&1 || { tail -40 "$LOG"; echo "BUILD FAILED"; exit 1; }
fail=0
check() { # check <description> <command...>
  local desc=$1; shift
  if "$@" >/dev/null 2>&1; then echo "ok   $desc"; else echo "FAIL $desc"; fail=1; fi
}
check "no KaTeX warnings"        bash -c "! grep -q 'LaTeX-incompatible' '$LOG'"
check "home canonical"           grep -q 'rel="canonical" href="https://diaosj.info/"' dist/index.html
check "sitemap present"          test -s dist/sitemap-0.xml
check "llms.txt present"         test -s dist/llms.txt
check "robots present"           test -s dist/robots.txt
check "blog posts built (>170)"  bash -c "[ \$(ls dist/blog | wc -l) -gt 170 ]"
check "zh-CN posts tagged"       grep -q '<html lang="zh-CN"' dist/blog/sorting-algorithms-summary/index.html
check "JSON-LD on home"          grep -q 'application/ld+json' dist/index.html
# --- redesign assertions are appended below by later tasks ---
exit $fail
