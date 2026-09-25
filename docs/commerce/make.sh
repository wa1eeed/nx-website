#!/bin/sh
# Build the commerce pages, then stamp the asset version the site is serving.
#
# build.py copies the ?v= it finds in the chrome it borrows, which lags behind
# while nx-commerce.css is still changing, so the stamp is applied afterwards.
#
# Usage: docs/commerce/make.sh 135
set -e

# Resolve both directories once, before anything changes the working directory.
# An earlier version re-evaluated `dirname "$0"` after a cd, which resolved
# against the new directory: the loop below then matched nothing, the stamp was
# silently skipped, and 22 pages went out pointing at a stale asset version.
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../.." && pwd)

V=${1:?usage: make.sh <asset-version>}

python3 "$HERE/build.py" '' ar
python3 "$HERE/build.py" '' en

cd "$ROOT"
stamped=0
for f in ar/solutions/commerce/index.html ar/solutions/commerce/*/index.html \
         en/solutions/commerce/index.html en/solutions/commerce/*/index.html; do
  [ -f "$f" ] || continue
  sed -i '' "s|nx-commerce\.css?v=[0-9]*|nx-commerce.css?v=$V|; s|nx-commerce\.js?v=[0-9]*|nx-commerce.js?v=$V|" "$f"
  stamped=$((stamped + 1))
done
[ "$stamped" -eq 22 ] || { echo "stamped $stamped of 22 pages — aborting" >&2; exit 1; }
echo "assets stamped v=$V on $stamped pages"
