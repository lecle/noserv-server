process.env.NODE_ENV = 'local';

var container = require('./lib/container');
container.init('', '', function() {});