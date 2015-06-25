var assert = require('assert');
var container = require('../../lib/container').getInstance();
var restify = require('restify');

describe('roleAcl', function() {

    var client = null;
    var userId = null;
    var masterKey = null;

    before(function(done) {
        container.init('', '', function(err) {

            setTimeout(done, 2000);
        });

        client = restify.createJsonClient({
            url: 'http://localhost:3337',
            version: '~1.0',
            headers: {
                'X-Noserv-Session-Token' : 'supertoken',
                'X-Noserv-Application-Id' : 'supertoken'
            }
        });

        client.del('/1/apps', function(err, req, res, obj) {

            client.post('/1/apps', {appname:'testRole'}, function (err, req, res, obj) {

                client.headers['X-Noserv-Application-Id'] = obj.applicationId;
                client.headers['X-Noserv-Rest-Api-Key'] = obj.restApiKey;
                masterKey = obj.masterKey;

                client.del('/1/users', function(err, req, res, obj) {

                    client.post('/1/users', {username:'test', password:'pass', phone:'010-1111-2222'}, function (err, req, res, obj) {

                        client.headers['X-Noserv-Session-Token'] = obj.sessionToken;
                        userId = obj.objectId;

                        client.headers['X-Noserv-Master-Key'] = masterKey;
                        client.post('/1/roles', {name:'a', roles:['b']}, function(err, req, res,obj) {

                            client.headers['X-Noserv-Master-Key'] = masterKey;
                            client.post('/1/roles', {name:'b', users:[userId]}, function(err, req, res,obj) {

                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    after(function(done) {
        container.close(function() {

            setTimeout(done, 2000);
        });
    });

    describe('create', function() {
        it('No permission settings', function(done) {

            delete client.headers['X-Noserv-Master-Key'];
            client.post('/1/classes/testRole', {test: 'data'}, function (err, req, res, obj) {
console.log('response error', err);
                assert.equal(201, res.statusCode);
                assert(obj.createdAt);
                assert(obj.objectId);

                done(err);
            });
        });

        it('user readable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['a'] = { read : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.post('/1/classes/testRole', {test: 'data'}, function (err, req, res, obj) {

                    assert.equal(403, res.statusCode);

                    done();
                });
            });
        });

        it('user writable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['a'] = { write : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.post('/1/classes/testRole', {test: 'data'}, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);

                    done(err);
                });
            });
        });

        it('* readable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { read : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.post('/1/classes/testRole', {test: 'data'}, function (err, req, res, obj) {

                    assert.equal(403, res.statusCode);

                    done();
                });
            });
        });

        it('* writable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { write : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.post('/1/classes/testRole', {test: 'data'}, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);

                    done(err);
                });
            });
        });

        it('user master permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { write : false };
            acl.ACL['a'] = { master : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.post('/1/classes/testRole', {test: 'data'}, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);

                    done(err);
                });
            });
        });
    });

    describe('read', function() {
        it('No permission settings', function(done) {

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.del('/1/classes/testRole/ACL', function (err, req, res, obj) {

                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testRole', function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    done(err);
                });
            });
        });

        it('user readable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['a'] = { read : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testRole', function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    done(err);
                });
            });
        });

        it('user writable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['a'] = { write : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.put('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testRole', function (err, req, res, obj) {

                    assert.equal(403, res.statusCode);
                    done();
                });
            });
        });

        it('* readable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { read : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.put('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testRole', function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    done(err);
                });
            });
        });

        it('* writable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { write : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.put('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testRole', function (err, req, res, obj) {

                    assert.equal(403, res.statusCode);
                    done();
                });
            });
        });

        it('user master permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { read : false };
            acl.ACL['a'] = { master : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testRole', function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    done(err);
                });
            });
        });
    });

    describe('row acl', function() {

        it('should get without error', function(done) {

            delete client.headers['X-Noserv-Master-Key'];

            client.post('/1/classes/testRole', {test: 'data5', ACL:{'a' : {'read': true}}}, function (err, req, res, obj) {

                var acl = {ACL:{}};
                acl.ACL['a'] = { read : true };

                client.headers['X-Noserv-Master-Key'] = masterKey;
                client.post('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {

                    delete client.headers['X-Noserv-Master-Key'];
                    client.get('/1/classes/testRole?where={"test":"data5"}', function (err, req, res, obj) {

                        assert.equal(200, res.statusCode);
                        assert.equal('data5', obj.results[0].test);

                        done(err);
                    });
                });
            });
        });

        it('should not get without error', function(done) {

            delete client.headers['X-Noserv-Master-Key'];

            client.post('/1/classes/testRole', {test: 'data6', ACL:{'x' : {'read': true}}}, function (err, req, res, obj) {

                var acl = {ACL:{}};
                acl.ACL['a'] = { read : true };

                client.headers['X-Noserv-Master-Key'] = masterKey;
                client.post('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {

                    delete client.headers['X-Noserv-Master-Key'];
                    client.get('/1/classes/testRole?where={"test":"data6"}', function (err, req, res, obj) {

                        assert.equal(200, res.statusCode);
                        assert.equal(0, obj.results.length);

                        done(err);
                    });
                });
            });
        });

        it('should update without error', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { write : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {

                delete client.headers['X-Noserv-Master-Key'];

                client.post('/1/classes/testRole', {test: 'data7', ACL:{'a' : {'write': true}}}, function (err, req, res, obj) {

                    var objId = obj.objectId;

                    client.put('/1/classes/testRole/' + objId, {test: 'data8'}, function (err, req, res, obj) {

                        assert.equal(200, res.statusCode);
                        assert(obj.updatedAt);
                        done(err);
                    });
                });
            });
        });

        it('should not update with error', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { write : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testRole/ACL', acl, function (err, req, res, obj) {

                delete client.headers['X-Noserv-Master-Key'];

                client.post('/1/classes/testRole', {test: 'data9', ACL:{'x' : {'write': true}}}, function (err, req, res, obj) {

                    var objId = obj.objectId;

                    client.put('/1/classes/testRole/' + objId, {test: 'data10'}, function (err, req, res, obj) {

                        assert.equal(404, res.statusCode);
                        done();
                    });
                });
            });
        });
    });
});
