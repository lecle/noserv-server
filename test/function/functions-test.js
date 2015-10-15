var assert = require('assert');
var container = require('../../lib/container').getInstance();
var restify = require('restify');

describe('functions-route', function() {

    var client = null;
    var functionId = null;

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

        client.del('/1/functions', function(err, req, res, obj) {

            client.post('/1/functions', {name:'test', type:'function', function:'res.send({test:"data", testdata:req.data.testdata});'}, function (err, req, res, obj) {

                if(obj) {

                    functionId = obj.objectId;
                }
                done();
            });
        });
    });

    describe('create', function() {
        it('should create without error', function(done) {

            client.post('/1/functions', {name:'test2', type:'function', function:'res.send({test:"data"});'}, function (err, req, res, obj) {

                if(res.statusCode === 409) {

                    // todo: 지우고 다시 만드는 코드 추가
                    done();
                    return;
                }
                assert.equal(201, res.statusCode);
                assert(obj.createdAt);
                assert(obj.objectId);

                done(err);
            });
        });
    });

    describe('read', function() {
        it('should read without error', function(done) {

            client.get('/1/functions/' + functionId, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('update', function() {
        it('should update without error', function(done) {

            client.put('/1/functions/' + functionId, {name:'test2'}, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('find', function() {
        it('should find without error', function(done) {

            client.get('/1/functions', function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('destroy', function() {
        it('should destroy without error', function(done) {

            client.del('/1/functions/' + functionId, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('run', function() {
        it('should run without error', function(done) {

            client.post('/1/functions/test', {testdata:'testvalue'}, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                assert.equal('data', obj.test);
                assert.equal('testvalue', obj.testdata);
                done();
            });
        });
    });

    describe('use sdk', function() {
        it('should use sdk without error', function(done) {

            var func = "            var Score = new Noserv.Object('Score', '');\
            var score = Score.extend();\
\
            score.set('name', req.data.name);\
            score.set('선수', '선수1');\
console.log('before save');\
            score.save(score, {\
                success: function (data) {\
console.log('success', data);\
                    res.send({objectId : data.objectId});\
                },\
                error: function (data, error) {\
\
                    res.error(error);\
                }\
            });";

            client.post('/1/functions', {name:'addScore', type:'function', function:func}, function (err, req, res, obj) {

                if(err)
                    return done(err);

                assert.equal(201, res.statusCode);
                assert(obj.createdAt);
                assert(obj.objectId);

                var id = obj.objectId;

                client.post('/1/functions/addScore', {name:'testvalue'}, function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    assert(obj.objectId);

                    client.get('/1/functions/' + id, function (err, req, res, obj) {

                        setTimeout(function() {

                            console.log('log', obj.log);
                            assert(obj.log.length);
                            done(err);
                        }, 100);
                    });
                });
            });
        });
    });
});
