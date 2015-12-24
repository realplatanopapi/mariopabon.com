composer update
npm install -g bower
cd public/wp-content/themes/restlessbit
bower install
npm install
gulp build:prod
rm -rf node_modules
rm -rf bower_components
