// token parser is the middleware that parses token and pass decodedToken to next
// if there is a errorCallback, this middleware calls it when token is invalid
// if there is a verifyMethod, this middleware calls it when token is valid

/* usage
* const tokenParser = require('token-parser')
*
* function verifyMethod(req, res, next) {
*   const token = req.decodedToken
*   doSomething(token)
*   next()
* }
*
* function errorCallback(req, res, next, err) {
*   doSomething(err)
*   next()
* }
*
* app.use('/', tokenParser(errorCallback, verifyMethod))
*
*
*/

const authToken = require('../utils/token')

function middlewareFunction(errorCallback) {
  const tokenParser = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.query.token || req.cookies.token
    const verifyToken = (token) => {
      const p = new Promise((resolve, reject) => {
        if(!token) { reject(new Error('Token is null')) }
        authToken.verify(token, (err, decoded) => {
          if(err) reject(err)
          else resolve(decoded)
        })
      })

      return p
    }

    const onTokenVerified = (decoded) => {
      req.decodedToken = decoded
      next()
    }

    const onError = (err) => {
      if (!errorCallback) next()
      else errorCallback(req, res, next, err)
    }

    verifyToken(token)
    .then(onTokenVerified)
    .catch(onError)
  }

  return tokenParser
}

module.exports = middlewareFunction
