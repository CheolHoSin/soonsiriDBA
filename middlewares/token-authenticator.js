const nullChecker = require('../utils/nullChecker')
const authToken = require('../utils/token')

// token authenticator authenticates and refresh token
// if it fails to authenticate token, call failCallback.
// refreshed token added to x-issued-token in headers

/*
** arguments
** authMethod: function(token). return true or false
** failCallback: function(req, res)
** refreshOpts: { autoRefresh: <true or false>, refreshTime: <second> }
*/

const middlewareFunction = (authMethod, failCallback, refreshOpts) => {
  return (req, res, next) => {
    if (nullChecker.isNull(req.decodedToken)) { failCallback(req, res); return }

    let token = req.decodedToken

    if (!authMethod(token)) { failCallback(req, res); return }

    // token doesn't refresh
    if (!refreshOpts.autoRefresh) { next(); return }

    // token refresh
    const d = new Date()
    const remainTime = token.exp - d.getTime()/1000

    if (remainTime < 0 || remainTime > refreshOpts.refreshTime) {  // token expired or don't need to refresh yet
      next()
      return;
    }

    delete token.iat;
    delete token.exp;
    delete token.nbf;
    delete token.jti;
    delete token.iss;
    delete token.sub;

    authToken.sign(token, (err, token) => {
      if (!err) {
        res.cookie('token', token, {
          secure: true,
          httpOnly: true
        })
        res.set('x-issued-token', token)
        next()
      } else {
        next()
      }
    })
  }
}

module.exports = middlewareFunction
