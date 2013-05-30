var http = require('http');
var rut = require('./');
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
    }),
    rut.get('/user/*', function (req, res, next, userId) {
      res.end('user: ' + userId);
    }),
    rut.get('/file/**', function (req, res, next, filename) {
      res.end('file: ' + filename);
    })
  )).listen(7462, function() {
    t.end();
  });
});


test('basic get', function (t) {
  t.plan(1);
  http.get('http://localhost:7462', function (res) {
    res.setEncoding('utf8');
    res.on('data', function (data) {
      t.equal(data, 'ding ding');
    });
  });
});
  
test('404', function (t) {
  t.plan(1);
  http.get('http://localhost:7462/nopage', function (res) {
    t.equal(res.statusCode, 404);
  });
});

test('post', function (t) {
  t.plan(1);
  var req = http.request({port: 7462, path: '/form', method: 'post'}, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (data) {
      t.equal(data, 'This I got: abracadabra');
    });
  });
  req.end('abracadabra');
});

test('getting a post route is a 404', function (t) {
  t.plan(1);
  http.get('http://localhost:7462/form', function (res) {
    t.equal(res.statusCode, 404);
  });
});

test('get with a param', function (t) {
  t.plan(1);
  http.get('http://localhost:7462/user/12', function (res) {
    res.setEncoding('utf8');
    res.on('data', function (data) {
      t.equal(data, 'user: 12');
    });
  });
});

test('no match beyond a slash on a star', function (t) {
  t.plan(1);
  http.get('http://localhost:7462/user/12/profile', function (res) {
    t.equal(res.statusCode, 404);
  });
});

test('double star', function (t) {
  t.plan(1);
  http.get('http://localhost:7462/file/my/best/unicorn.png', function (res) {
    res.setEncoding('utf8');
    res.on('data', function (data) {
      t.equal(data, 'file: my/best/unicorn.png');
    });
  });
});

test('teardown', function (t) {
  t.end();
  process.nextTick(function () {
    process.exit();
  });
});
