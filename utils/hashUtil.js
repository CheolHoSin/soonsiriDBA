const crypto = require('crypto')

function getHash(data) {
  const hash = crypto.createHash('sha256')
  hash.update(data)

  return hash.digest('hex')
}

exports.getHash = getHash
