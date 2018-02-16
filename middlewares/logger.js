// logger

function consoleLogger(req, res, next) {
  console.log(res.originalUrl + 'requested at ' + Date())
  next()
}

module.exports = consoleLogger
