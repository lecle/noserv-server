var assert = require('assert');
var container = require('../../lib/container').getInstance();
var restify = require('restify');

describe('analytics-route', function() {

    var client = null;

    before(function(done) {
        container.init('', '', function(err) {

            setTimeout(done, 1000);
        });

        client = restify.createJsonClient({
            url: 'http://localhost:3337',
            version: '~1.0',
            headers: {
                'X-Noserv-Session-Token' : 'supertoken',
                'X-Noserv-Application-Id' : 'supertoken'
            }
        });
    });

    after(function(done) {
        container.close(function() {

            setTimeout(done, 2000);
        });
    });


    describe('find', function() {
        it('should find without error', function(done) {

            client.get('/1/analytics', function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });
});