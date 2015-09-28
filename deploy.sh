#!/bin/bash

set -o errexit -o nounset

rev=$(git rev-parse --short HEAD)

grunt jsdoc
cd _build/
git init
git config user.name "John Riviello"
git config user.email "github@riviello.net"

git remote add upstream "https://$GH_TOKEN@github.com/JohnRiv/Surf-N-Perf.git"
git fetch upstream
git reset upstream/gh-pages

git add -A docs/
git commit -m "Automated documentation update from ${rev}"
git push upstream HEAD:gh-pages