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


    describe('add', function() {
        it('should add without error', function(done) {

            // object를 하나 추가해보고 뒤에 find가 오류 없으면 정상 등록 된것으로 본다.
            client.post('/1/classes/test', {appname:'test3'}, function (err, req, res, obj) {

                assert.equal(201, res.statusCode);
                done(err);
            });
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