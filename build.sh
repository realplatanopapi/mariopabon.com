composer update
cd public/wp-content/themes/restlessbit
npm install
./node_modules/.bin/bower install
./node_modules/.bin/gulp build:prod
rm -rf node_modules
rm -rf bower_components
