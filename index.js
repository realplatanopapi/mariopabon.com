const path = require('path');
const ghost = require('ghost');

ghost({
  config: path.join(__dirname, 'config.js')
}).then(ghostServer => {
  ghostServer.start();
});
