var assert    = require('assert'),
    xhr2proxy    = require('../'),
    connect   = require('connect'),
    http      = require('http'),
    request   = require('request'),
    url       = require("url");


describe('xhr2proxy', function () {

    before(function () {
        connect()
            .use(function ( req, res ) {
                var query = url.parse(req.url).query;
                if (query)
                    res.end(query);
                else
                    res.end("response from remote");
            })
            .listen(9000);
    });

    describe('with default settings', function () {

        before(function () {
            connect()
                .use(xhr2proxy())
                .use(function ( req, res ) {
                    res.end("Hello from Connect!");
                })
                .listen(8000);
        });

        it('should proxy requests under /proxy', function ( done ) {

            request
                .get('http://localhost:8000/proxy/http://localhost:9000', function ( err, res, body ) {
                    assert.ok(!err);
                    assert.equal(res.statusCode, 200);
                    assert.equal(body, "response from remote");
                    done();
                });
        });

        it('should proxy encoded characters', function ( done ) {

            request
                .get({
                    uri: 'http://localhost:8000/proxy/http://localhost:9000/',
                    qs: { q: 'foo bar' }
                }, function ( err, res, body ) {
                    assert.equal(body, 'q=foo%20bar');
                    done();
                });
        });

        it('should proxy double encoded urls', function ( done ) {
            var url = encodeURIComponent('http://localhost:9000');
            request
                .get({
                    uri: 'http://localhost:8000/proxy/' + url
                }, function ( err, res, body ) {
                    assert.equal(body, "response from remote");
                    done();
                });
        });

        it('should ignore urls outside /proxy/', function ( done ) {

            request
                .get('http://localhost:8000/foo', function ( err, res, body ) {

                    assert.ok(!err);
                    assert.equal(res.statusCode, 200);
                    assert.equal(body, "Hello from Connect!");
                    done();
                });
        });
    });

    describe('with custom prefix', function () {

        before(function () {
            connect()
                .use(xhr2proxy({prefix:'myproxy'}))
                .listen(8001);
        })

        it('should proxy requests under the custom prefix', function ( done ) {

            request
                .get('http://localhost:8001/myproxy/http://localhost:9000', function ( err, res, body ) {

                    assert.ok(!err);
                    assert.equal(res.statusCode, 200);
                    assert.equal(body, "response from remote");
                    done();
                });
        });
    });

    describe('with custom acao', function () {

        before(function () {
            connect()
                .use(xhr2proxy({acao:'*'}))
                .listen(8003);
        })

        it('should proxy requests and append ACAO', function ( done ) {

            request
                .get('http://localhost:8003/proxy/http://localhost:9000', function ( err, res, body ) {

                    assert.ok(!err);
                    assert.equal(res.statusCode, 200);
                    assert.equal(res.headers['access-control-allow-origin'], '*');
                    assert.equal(body, "response from remote");
                    done();
                });
        });
    });

    describe('with custom referer', function () {

        before(function () {
            connect()
                .use(xhr2proxy({referer:/^http:\/\/localhost:8002/}))
                .listen(8002);
        })

        it('should NOT proxy requests under the no referer', function ( done ) {

            request
                .get('http://localhost:8002/proxy/http://localhost:9000',function ( err, res, body ) {

                    assert.ok(!err);
                    assert.notEqual(res.statusCode, 200);
                    done();
                });
        });

        it('should NOT proxy requests under the incorrect referer', function ( done ) {

            request
                .get('http://localhost:8002/proxy/http://localhost:9000',{headers:{'referer':'http://wwww.foo.com'}},function ( err, res, body ) {

                    assert.ok(!err);
                    assert.notEqual(res.statusCode, 200);
                    done();
                });
        });


        it('should proxy requests under the correct referer', function ( done ) {

            request
                .get('http://localhost:8002/proxy/http://localhost:9000',{headers:{'referer':'http://localhost:8002'}},function ( err, res, body ) {

                    assert.ok(!err);
                    assert.equal(res.statusCode, 200);
                    assert.equal(body, "response from remote");
                    done();
                });
        });

    });
});
