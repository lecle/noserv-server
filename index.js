process.env.NODE_ENV = 'deploy';

var container = require('./lib/container').getInstance();
container.init('', '', function() {});

process.on('exit', container.close);