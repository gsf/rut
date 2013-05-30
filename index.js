var url = require('url')

// From http://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods
// I'm happy to add more as needed
var methods = [
  'get',
  'head',
  'post',
  'put',
  'delete',
  'trace',
  'options',
  'connect',
  'patch'
]

// special characters that need to be escaped when passed to `RegExp()` 
// lest they be interpreted as pattern-matching
var specialChars = /[|.+?{}()\[\]\^$]/g

// cache for route RegExps
var cache = {}

function rut(route, options, cb) {
  route = route || '**';
  if (!cb) {
    cb = options
    options = {}
  }
  // convert route to RegExp with matching * groups if not already a RegExp
  // use constructor because instanceof fails between modules
  if (route.constructor.name != 'RegExp') {
    route = cache[route] || (cache[route] = new RegExp('^' + String(route)
      .replace(specialChars, '\\$&')
      .replace(/\*\*/g, '(.+)')
      .replace(/\*/g, '([^/]+)') + '$'
    ))
  }
  return function(req, res, next) {
    if (options.method && options.method != req.method) return next()
    req.parsedUrl = req.parsedUrl || url.parse(req.url)
    var path = req.parsedUrl.pathname
    var matches = route.exec(path)
    if (!matches) return next()
    // add matches to the end of our param list
    cb.apply(null, [req, res, next].concat(matches.slice(1)))
  }
}

module.exports = rut
module.exports.all = rut

methods.forEach(function(method) {
  module.exports[method] = function(route, options, cb) {
    if (!cb) {
      cb = options
      options = {}
    }
    options.method = method.toUpperCase()
    return rut(route, options, cb)
  }
})
