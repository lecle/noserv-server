var Container = require('mscontainer');

module.exports.getInstance = function() {

    return new Container(require('../conf/config'));
};
