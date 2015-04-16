var assert = require('assert');
var container = require('../../lib/container').getInstance();
var restify = require('restify');

describe('classes-route', function() {

    var client = null;
    var userId = null;
    var masterKey = null;

    before(function(done) {
        container.init('', '', function(err) {

            setTimeout(done, 30000);
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

            client.post('/1/apps', {appname:'testAcl'}, function (err, req, res, obj) {

                client.headers['X-Noserv-Application-Id'] = obj.applicationId;
                client.headers['X-Noserv-Rest-Api-Key'] = obj.restApiKey;
                masterKey = obj.masterKey;

                client.del('/1/users', function(err, req, res, obj) {

                    client.post('/1/users', {username:'test', password:'pass', phone:'010-1111-2222'}, function (err, req, res, obj) {

                        client.headers['X-Noserv-Session-Token'] = obj.sessionToken;
                        userId = obj.objectId;

                        done();
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

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.del('/1/classes/testAcl/ACL', function (err, req, res, obj) {

                delete client.headers['X-Noserv-Master-Key'];
                client.post('/1/classes/testAcl', {test: 'data'}, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);
                    assert(obj.createdAt);
                    assert(obj.objectId);

                    done(err);
                });
            });
        });

        it('user readable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL[userId] = { read : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testAcl/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.post('/1/classes/testAcl', {test: 'data'}, function (err, req, res, obj) {

                    assert.equal(403, res.statusCode);

                    done();
                });
            });
        });

        it('user writable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL[userId] = { write : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testAcl/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.post('/1/classes/testAcl', {test: 'data'}, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);

                    done(err);
                });
            });
        });

        it('* readable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { read : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testAcl/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.post('/1/classes/testAcl', {test: 'data'}, function (err, req, res, obj) {

                    assert.equal(403, res.statusCode);

                    done();
                });
            });
        });

        it('* writable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { write : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testAcl/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.post('/1/classes/testAcl', {test: 'data'}, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);

                    done(err);
                });
            });
        });

        it('user master permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { write : false };
            acl.ACL[userId] = { master : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testAcl/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.post('/1/classes/testAcl', {test: 'data'}, function (err, req, res, obj) {

                    assert.equal(201, res.statusCode);

                    done(err);
                });
            });
        });

    });

    describe('read', function() {
        it('No permission settings', function(done) {

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.del('/1/classes/testAcl/ACL', function (err, req, res, obj) {

                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testAcl', function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    done(err);
                });
            });
        });

        it('user readable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL[userId] = { read : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testAcl/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testAcl', function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    done(err);
                });
            });
        });

        it('user writable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL[userId] = { write : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.put('/1/classes/testAcl/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testAcl', function (err, req, res, obj) {

                    assert.equal(403, res.statusCode);
                    done();
                });
            });
        });

        it('* readable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { read : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.put('/1/classes/testAcl/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testAcl', function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    done(err);
                });
            });
        });

        it('* writable permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { write : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.put('/1/classes/testAcl/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testAcl', function (err, req, res, obj) {

                    assert.equal(403, res.statusCode);
                    done();
                });
            });
        });

        it('user master permission settings', function(done) {

            var acl = {ACL:{}};
            acl.ACL['*'] = { read : false };
            acl.ACL[userId] = { master : true };

            client.headers['X-Noserv-Master-Key'] = masterKey;
            client.post('/1/classes/testAcl/ACL', acl, function (err, req, res, obj) {
                delete client.headers['X-Noserv-Master-Key'];
                client.get('/1/classes/testAcl', function (err, req, res, obj) {

                    assert.equal(200, res.statusCode);
                    done(err);
                });
            });
        });
    });
});
