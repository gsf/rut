var http = require('http');
var rut = require('./index');
var stack = require('stack');
var test = require('tap').test;

test('setup', function (t) {
  http.createServer(stack(
    rut('/', function (req, res, next) {
      res.end('ding ding');
    }),
    rut.post('/form', function (req, res, next) {
      var received = 'This I got: ';
      req.on('data', function (data) {
        received += data;
      });
      req.on('end', function () {
        res.end(received);
      });
    })
  )).listen(7462, function() {
    t.end();
  });
});


test('requests should return as expected', function (t) {
  t.plan(4);
  http.get('http://localhost:7462', function (res) {
    res.setEncoding('utf8');
    var body = ''
    res.on('data', function (data) {
      body += data;
    });
    res.on('end', function () {
      t.equal(body, 'ding ding');
    });
  });
  http.get('http://localhost:7462/nopage', function (res) {
    t.equal(res.statusCode, 404);
  });
  var req = http.request({port: 7462, path: '/form', method: 'post'}, function (res) {
    res.setEncoding('utf8');
    var body = ''
    res.on('data', function (data) {
      body += data;
    });
    res.on('end', function () {
      t.equal(body, 'This I got: abracadabra');
    });
  });
  req.end('abracadabra');
  http.get('http://localhost:7462/form', function (res) {
    t.equal(res.statusCode, 404);
  });
});

test('teardown', function (t) {
  setImmediate(function () {
    process.exit();
  });
  t.end();
});
