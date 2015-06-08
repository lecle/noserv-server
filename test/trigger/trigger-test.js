var assert = require('assert');
var container = require('../../lib/container').getInstance();
var restify = require('restify');

describe('trigger-route', function() {

    var client = null;
    var testTriggerId = null;

    before(function (done) {

        client = restify.createJsonClient({
            url: 'http://localhost:3337',
            version: '~1.0',
            headers: {
                'X-Noserv-Session-Token': 'supertoken',
                'X-Noserv-Application-Id': 'supertoken'
            },
            connectTimeout: 100000
        });

        container.init('', '', function (err) {

            setTimeout(function() {

                client.del('/1/functions', function (err, req, res, obj) {

                    done(err);
                });
            }, 1000);
        });
    });

    after(function (done) {
        container.close(function () {

            setTimeout(done, 2000);
        });
    });

    describe('create', function() {
        it('should create without error', function(done) {

            client.post('/1/functions', {name:'before_insert', type:'function', triggerTypes:['testTrigger_before_insert'], function:'req.data.data.b += 10; res.send(req.data);'}, function (err, req, res, obj) {

                assert.equal(201, res.statusCode);

                client.post('/1/functions', {name:'after_insert', type:'function', triggerTypes:['testTrigger_after_insert'], function:'if(req.data.b === 12) req.data.createdAt = "OK"; res.send(req.data);' }, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);

                    client.post('/1/classes/testTrigger', {a : 1, b : 2, c : 3}, function (err, req, res, obj) {

                        assert.equal(201, res.statusCode);
                        assert.equal('OK', obj.createdAt);

                        testTriggerId = obj.objectId;

                        done(err);
                    });
                });
            });

        });
    });

    describe('findone', function() {
        it('should create without error', function(done) {

            client.post('/1/functions', {name:'before_findone', type:'function', triggerTypes:['testTrigger_before_findone'], function:'req.data.query.where.objectId = "' + testTriggerId + '"; res.send(req.data);'}, function (err, req, res, obj) {

                assert.equal(201, res.statusCode);

                client.post('/1/functions', {name:'after_findone', type:'function', triggerTypes:['testTrigger_after_findone'], function:'req.data.test = "OK"; res.send(req.data);' }, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);

                    client.get('/1/classes/testTrigger/test', function (err, req, res, obj) {

                        assert.equal(200, res.statusCode);
                        assert.equal('OK', obj.test);
                        assert.equal(1, obj.a);

                        done(err);
                    });
                });
            });
        });
    });

    describe('find', function() {
        it('should create without error', function(done) {

            client.post('/1/functions', {name:'before_find', type:'function', triggerTypes:['testTrigger_before_find'], function:'req.data.query.where.a = req.data.query.where.test; res.send(req.data);'}, function (err, req, res, obj) {

                assert.equal(201, res.statusCode);

                client.post('/1/functions', {name:'after_find', type:'function', triggerTypes:['testTrigger_after_find'], function:'req.data[0].test = "OK"; res.send(req.data);' }, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);

                    client.get('/1/classes/testTrigger?test=1', function (err, req, res, obj) {

                        assert.equal(200, res.statusCode);
                        assert.equal('OK', obj.results[0].test);
                        assert.equal(1, obj.results[0].a);

                        done(err);
                    });
                });
            });
        });
    });

    describe('update', function() {
        it('should create without error', function(done) {

            client.post('/1/functions', {name:'before_update', type:'function', triggerTypes:['testTrigger_before_update'], function:'req.data.query.where.objectId = req.data.data.objId; res.send(req.data);'}, function (err, req, res, obj) {

                assert.equal(201, res.statusCode);

                client.post('/1/functions', {name:'after_update', type:'function', triggerTypes:['testTrigger_after_update'], function:'if(req.data.updatedAt) req.data.updatedAt = "OK"; res.send(req.data);' }, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);

                    client.put('/1/classes/testTrigger/test', {objId : testTriggerId}, function (err, req, res, obj) {

                        assert.equal(200, res.statusCode);
                        assert.equal('OK', obj.updatedAt);

                        done(err);
                    });
                });
            });
        });
    });

    describe('delete', function() {
        it('should create without error', function(done) {

            client.post('/1/functions', {name:'before_remove', type:'function', triggerTypes:['testTrigger_before_remove'], function:'req.data.query.where.objectId = "' + testTriggerId + '"; res.send(req.data);'}, function (err, req, res, obj) {

                assert.equal(201, res.statusCode);

                client.post('/1/functions', {name:'after_remove', type:'function', triggerTypes:['testTrigger_after_remove'], function:'if(req.data !== 1) res.error(new Error("test fail"); res.send({});' }, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);

                    client.del('/1/classes/testTrigger/test', function (err, req, res, obj) {

                        assert.equal(200, res.statusCode);

                        done(err);
                    });
                });
            });
        });
    });
});
