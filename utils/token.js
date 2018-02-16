// jwt methods

const jwt = require('jsonwebtoken')
const configs = require('../settings/jwt_configs')

exports.sign = (payload, callback) => {
  jwt.sign(payload, configs.secret, {
    issuer: configs.issuer,
    subject: configs.sub,
    expiresIn: configs.expiresIn
  }, callback)
}

exports.verify = (token, callback) => {
  jwt.verify(token, configs.secret, callback)
}

exports.jombieToken = (payload, callback) => {
  jwt.sign(payload, configs.secret, {
    issuer: configs.issuer,
    subject: configs.sub,
    expiresIn: '1d'
  }, callback)
}
