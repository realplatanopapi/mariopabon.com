#!/usr/bin/env bash
set -e
set -x

TAG=`date +%Y-%m-%d.%H-%M-%S`
git tag "$TAG"
git push origin $TAG

npm run build
npm run compress

cd ./dist
git init
git add .
git commit -m "Release $TAG"
git remote add origin git@github.com:restlessbit/mariopabon.com.git
git push -uf origin master:gh-pages
