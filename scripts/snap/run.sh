#!/bin/zsh
# scripts/snap/run.sh <path> <page> [W H] — the snap check on one page (scripts/snapprobe.mjs), with this repo's files
# in place of every tag the heads pin and dist/snap.js preloaded (PRE= to skip that once the live head carries it)
cd "$(dirname "$0")/../.."
TAGS=$(grep -oh "website-css@v[0-9]*" head/*.html | sort -u | sed 's/website-css@//' | paste -sd, -)
SCEN="$(cat scripts/snap/$2.json)" W=${3:-1440} H=${4:-900} PRELOAD=${PRE-dist/snap.js} \
  node --experimental-websocket scripts/livecheck.mjs "https://encapsulate.xyz$1?x=$RANDOM" $TAGS scripts/snap/none.js \
  --steps scripts/snapprobe.mjs 2>&1 | grep -E "^(ok|FAIL|[0-9]+/| +\(the)"
