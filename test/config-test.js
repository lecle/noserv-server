describe('config', function() {
    describe('#getConfig()', function () {
        it('should getConfig without error', function (done) {

            process.env.NODE_ENV = 'local';
            var config = require('../conf/config');

            process.env.NODE_ENV = 'deploy';
            config = require('../conf/config');

            process.env.NODE_ENV = 'test';
            config = require('../conf/config');

            done();
        });
    });
});