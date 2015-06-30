
var assert = require('assert');
var container = require('../../lib/container').getInstance();
var restify = require('restify');

describe('schedule', function() {

    var client = null;
    var scheduleId = null;

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

        client.del('/1/schedule', function(err, req, res, obj) {

            client.post('/1/schedule', {
                name: 'test',
                function: 'test',
                start: {$ISODate: '2015-04-29T06:18:37.027Z'}
            }, function(err, req, res, obj) {

                if(obj) {

                    scheduleId = obj.objectId;
                }
                done();
            });
        });
    });

    describe('create', function() {
        it('should create without error', function(done) {

            client.post('/1/schedule', {
                name: 'test2',
                function: 'test',
                start: {$ISODate: '2015-04-29T06:18:37.027Z'}
            }, function(err, req, res, obj) {

                if(res.statusCode === 409) {

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

            client.get('/1/schedule/' + scheduleId, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('update', function() {
        it('should update without error', function(done) {

            client.put('/1/schedule/' + scheduleId, {name:'test3'}, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('find', function() {
        it('should find without error', function(done) {

            client.get('/1/schedule', function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('destroy', function() {
        it('should destroy without error', function(done) {

            client.del('/1/schedule/' + scheduleId, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('schedule run', function() {
        it('should schedule run without error', function(done) {

            client.del('/1/functions', function(err, req, res, obj) {

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

                    client.post('/1/schedule', {
                        name: 'addScore',
                        function: 'addScore',
                        start: {$ISODate: '2015-04-29T06:18:37.027Z'},
                        parameter: { name : 'testvalue' },
                        repeat : { interval : 1 }
                    }, function(err, req, res, obj) {

                        var id = obj.objectId;

                        setTimeout(function() {

                            client.get('/1/schedule/' + id, function (err, req, res, obj) {

                                assert.equal(200, res.statusCode);
                                assert(obj.log);
                                assert(obj.log[0].startedAt);
                                assert(obj.log[0].response);
                                assert(obj.log[0].response.objectId);
                                done();
                            });

                        }, 15000);
                    });
                });
            });

        });
    });

    describe('schedule push run', function() {
        it('should schedule push run without error', function(done) {

            client.post('/1/installations', {deviceType:'ios', deviceToken:'testschedule', test:'data', channels : ['', 'test']}, function (err, req, res, obj) {

                assert.equal(201, res.statusCode);
                assert(obj.createdAt);
                assert(obj.objectId);

                client.post('/1/push', {"where":{"test":"data"}, "data":{"alert":"노섭에서 알려드립니다~~","badge":"100"}, "push_time":{$ISODate: '2015-04-29T06:18:37.027Z'}}, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);
                    assert(obj.createdAt);
                    assert(obj.objectId);
                    assert(obj.scheduleId);

                    var pushId = obj.objectId;
                    var scheduleId = obj.scheduleId;

                    client.get('/1/push/' + pushId, function(err, req, res, obj) {

                        assert.equal(200, res.statusCode);
                        assert.equal(0, obj._sendCount);

                        setTimeout(function() {

                            client.get('/1/schedule/' + scheduleId, function (err, req, res, obj) {

                                assert.equal(200, res.statusCode);
                                assert(obj.log);
                                assert(obj.log[0].index);
                                assert(obj.log[0].response);
                                assert.equal(1, obj.log[0].response.sendCount);
                                done();
                            });

                        }, 15000);
                    });
                });
            });
        });
    });
});
