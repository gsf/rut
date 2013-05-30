rut
===

Routing middleware for stack.

[![Build Status](https://travis-ci.org/gsf/rut.png)](https://travis-ci.org/gsf/rut)

```js
var http = require('http');
var rut = require('rut');
var stack = require('stack');

// Pass stack to createServer for middlewares
http.createServer(stack(

  // Calling rut without a method is the same as rut.all()
  rut('/', function (req, res, next) {
    res.end('ding ding');
  }),

  // A call to rut.post() will only cover the POST for that path
  rut.post('/form', function (req, res, next) {
    var received = 'Posted: ';
    req.on('data', function (data) {
      received += data;
    });
    req.on('end', function () {
      res.end(received);
    });
  }),

  // A star will match any non-slash
  rut.get('/user/*', function (req, res, next, userId) {
    // userId can also be found at req.params[0]
    res.end('user: ' + userId);
  }),

  // Two stars matches slashes as well
  rut.get('/file/**', function (req, res, next, filename) {
    res.end('file: ' + filename);
  }),

  // Or use a RegExp
  rut.get(/^\/page\/(\d+)$/, function (req, res, next, pageNumber) {
    res.end('page number: ' + pageNumber);
  })
)).listen();
```

Inspired by https://github.com/laughinghan/choreographer.
