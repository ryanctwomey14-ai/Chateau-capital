#!/usr/bin/env bash
# Splices the shared header/footer partials into pages that contain the
# <!--@HEADER--> / <!--@FOOTER--> markers, and sets aria-current on the
# matching nav link. Run from the `site/` directory:  bash _partials/build.sh
set -euo pipefail
cd "$(dirname "$0")/.."

for f in *.html; do
  grep -q '<!--@HEADER-->' "$f" || continue
  sed -i \
    -e '/<!--@HEADER-->/r _partials/header.html' -e '/<!--@HEADER-->/d' \
    -e '/<!--@FOOTER-->/r _partials/footer.html' -e '/<!--@FOOTER-->/d' \
    "$f"
  # Mark the current page in the primary navigation (accessibility + CSS underline)
  sed -i "s|<a href=\"$f\">|<a href=\"$f\" aria-current=\"page\">|" "$f"
  echo "built  $f"
done
