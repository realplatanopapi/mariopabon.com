echo "Deployment started."
echo "Starting build..."

rm -rf _site/
jekyll build
cp .env _site/
touch .static
mv .static _site/
cd _site

echo "Build successful. Starting deploy..."

git init
git add .
git commit -m "Deploy"
git remote add production dokku@107.170.7.142:mariopabon.com
git push -f production master
echo "Deploy successful 🎉!"
