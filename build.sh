cd public/wp-content/themes/restlessbit
composer update
npm install
bower install
gulp build:prod
rm -rf node_modules
rm -rf bower_components
