var assert = require('assert');
var container = require('../../lib/container').getInstance();
var restify = require('restify');

describe('aggregate', function() {

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

    describe('aggregate', function() {
        it('should create without error', function(done) {

            client.del('/1/classes/testAggregate', function (err, req, res, obj) {
                client.post('/1/classes/testAggregate', {test:'data1', groupId : 'a', num : 1}, function (err, req, res, obj) {
                    client.post('/1/classes/testAggregate', {test:'data2', groupId : 'a', num : 2}, function (err, req, res, obj) {
                        client.post('/1/classes/testAggregate', {test:'data3', groupId : 'b', num : 3}, function (err, req, res, obj) {
                            client.post('/1/classes/testAggregate', {test:'data4', groupId : 'b', num : 4}, function (err, req, res, obj) {

                                var aggregate = [
                                    { $match : {
                                        "num": {
                                            "$lt": 4
                                        }
                                    }},
                                    { $group : {
                                        _id : { groupId : "$groupId" },
                                        sum : { $sum : "$num" },
                                        count: { $sum: 1 }
                                    }}
                                ];

                                client.get('/1/classes/testAggregate?aggregate=' + encodeURIComponent(JSON.stringify(aggregate)), function (err, req, res, obj) {

                                    assert(obj.results);
                                    assert.equal(2, obj.results.length);
                                    assert.equal(3, (obj.results[0].sum));

                                    done(err);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
