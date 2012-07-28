var url = require('url')

// special characters that need to be escaped when passed to `RegExp()`, lest
// they be interpreted as pattern-matching:
var specialChars = /[|.+?{}()\[\]\^$]/g;

function rut(route, cb) {
  return function(req, res, next) {
    req.parsedUrl = req.parsedUrl || url.parse(req.url)
    var path = req.parsedUrl.pathname
    // use constructor because instanceof fails between modules
    if (route.constructor.name != 'RegExp') {
      route = new RegExp('^' +
        String(route)
        .replace(specialChars, '\\$&')
        .replace(/\*\*/g, '(.+)')
        .replace(/\*/g, '([^/]+)') +
        '$'
      )
    }
    if (!route.exec(path)) return next()
    cb(req, res, next)
  }
}

module.exports = rut
module.exports.all = rut
