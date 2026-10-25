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
check "title is Shoujun Diao"      grep -q '<title>Home | Shoujun Diao' dist/index.html
check "no italic utility"          bash -c "! grep -rlE 'font-serif|\bitalic\b' dist --include=index.html | grep -q ."
check "font files <= 10"           bash -c "[ \$(ls dist/_astro | grep -c -E 'geist-(sans|mono).*\\.woff2') -le 10 ]"
check "favicon is svg stone"       grep -q 'rel="icon" href="/favicon.svg"' dist/index.html
check "footer has Chinese name"    grep -q '刁寿钧' dist/index.html
check "ArrowCard removed"          bash -c "! test -f src/components/ArrowCard.astro"
check "Entry used on projects"     grep -q 'data-entry' dist/projects/index.html
check "blog grouped: cycling anchor"   grep -q 'id="cycling"' dist/blog/index.html
check "blog grouped: 6 groups"         bash -c "[ \$(grep -o 'data-group=' dist/blog/index.html | wc -l) -eq 6 ]"
check "archive badge on 2014 post"     grep -q 'written in 2014' dist/blog/sorting-algorithms-summary/index.html
check "welcome post not built"         bash -c "! test -d dist/blog/welcome"
check "blog title Writing"             grep -q '<title>Writing | Shoujun Diao' dist/blog/index.html
check "home has 5 sections"        bash -c "[ \$(grep -o '§ 0[1-5]' dist/index.html | sort -u | wc -l) -eq 5 ]"
check "home writing in progress"   grep -q 'in progress' dist/index.html
check "home work lists token demo" grep -q 'token-console-demo' dist/index.html
check "home archive links"         grep -q 'href="/blog#cycling"' dist/index.html
check "hero grid present"          grep -q 'grid-bg' dist/index.html
exit $fail
