var methods = require('methods')
var url = require('url')

// special characters that need to be escaped when passed to `RegExp()` 
// lest they be interpreted as pattern-matching
var specialChars = /[|.+?{}()\[\]\^$]/g

// cache for route RegExps
var cache = {}

function rut(route, options, cb) {
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
    if (!route.exec(path)) return next()
    // TODO append match groups to params
    cb(req, res, next)
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
