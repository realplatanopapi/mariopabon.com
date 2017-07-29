#!/usr/bin/env bash
set -e
set -x

npm run build
npm run compress

cd ./dist
git init
git add .
git commit -m "Release"
git remote add origin git@github.com:restlessbit/mariopabon.com.git
git push -u origin master:gh-pages


