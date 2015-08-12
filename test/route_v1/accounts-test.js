var assert = require('assert');
var container = require('../../lib/container').getInstance();
var restify = require('restify');

describe('accounts-route', function() {

    var client = null;
    var userId = null;

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

    beforeEach(function(done) {

        client.del('/v1/accounts', function(err, req, res, obj) {

            client.post('/v1/accounts', {username:'test', password:'pass', phone:'010-1111-2222'}, function (err, req, res, obj) {

                if(obj) {

                    userId = obj.id;
                }
                done();
            });
        });
    });

    describe('create', function() {
        it('should create without error', function(done) {

            client.post('/v1/accounts', {username:'test2', password:'pass', phone:'010-1111-2222'}, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                assert(obj.createdAt);
                assert(obj.id);
                assert(obj.sessionToken);

                done(err);
            });
        });
    });

    describe('login', function() {
        it('should login without error', function(done) {

            client.get('/v1/login?username=test&password=pass', function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('read', function() {
        it('should read without error', function(done) {

            client.get('/v1/accounts/' + userId, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('readMe', function() {
        it('should readMe without error', function(done) {

            client.get('/v1/accounts/me', function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('update', function() {
        it('should update without error', function(done) {

            client.patch('/v1/accounts/' + userId, {username:'test', password:'pass', phone:'010-1111-2222'}, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('find', function() {
        it('should find without error', function(done) {

            client.get('/v1/accounts?username=test', function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('destroy', function() {
        it('should destroy without error', function(done) {

            client.del('/v1/accounts/' + userId, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('resetPassword', function() {
        it('should resetPassword without error', function(done) {

            client.post('/v1/requestPasswordReset', {email:'test@test.com'}, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });
});
