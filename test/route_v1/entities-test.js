var assert = require('assert');
var container = require('../../lib/container').getInstance();
var restify = require('restify');

describe('entities-route', function() {

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

    describe('create', function() {
        it('should create without error', function(done) {

            client.post('/v1/entities/test', {test:'data'}, function (err, req, res, obj) {

                assert.equal(200, res.statusCode, JSON.stringify(obj));
                assert(obj.createdAt);
                assert(obj.id);

                done(err);
            });
        });
    });

    describe('update', function() {
        it('should update without error', function(done) {

            client.post('/v1/entities/test', {test:'data', _test:'data'}, function (err, req, res, obj) {

                var objId = obj.id;

                client.patch('/v1/entities/test/' + objId, {test:'updatedata', _test:'updatedata'}, function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    assert(obj.updatedAt);

                    client.get('/v1/entities/test/' + objId, function (err, req, res, obj) {

                        assert.equal(200, res.statusCode);
                        assert.equal('updatedata', obj.test);
                        assert.equal('updatedata', obj._test);
                        done(err);
                    });
                });
            });
        });

        it('should update without _test column', function(done) {

            var client = restify.createJsonClient({
                url: 'http://localhost:3337',
                version: '~1.0',
                headers: {
                    'X-Noserv-Session-Token' : 'usertoken',
                    'X-Noserv-Application-Id' : 'usertoken'
                }
            });

            client.post('/v1/entities/test', {test:'data', _test:'data'}, function (err, req, res, obj) {

                var objId = obj.id;

                client.patch('/v1/entities/test/' + objId, {test:'updatedata', _test:'updatedata'}, function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    assert(obj.updatedAt);

                    client.get('/1/classes/test/' + objId, function (err, req, res, obj) {

                        assert.equal(200, res.statusCode);
                        assert.equal('updatedata', obj.test);
                        assert.equal('data', obj._test);
                        done(err);
                    });
                });
            });
        });
    });

    describe('read', function() {
        it('should read without error', function(done) {

            client.post('/v1/entities/test', {test:'data'}, function (err, req, res, obj) {

                client.get('/v1/entities/test/'+ obj.id, function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    assert.equal(obj.test, 'data');
                    done(err);
                });
            });
        });
    });

    describe('find', function() {
        it('should find without error', function(done) {

            client.post('/v1/entities/test', {test:'data'}, function (err, req, res, obj) {

                client.get('/v1/entities/test?where={"test":"data"}', function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    assert(obj.results);
                    assert(obj.results.length > 0);
                    assert.equal(obj.results[0].test, 'data');
                    done(err);
                });
            });
        });
    });

    describe('destroy', function() {
        it('should destroy without error', function(done) {

            client.post('/v1/entities/test', {test:'deletedata'}, function (err, req, res, obj) {

                client.del('/v1/entities/test/'+ obj.id, function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    done(err);
                });
            });
        });
    });
});
