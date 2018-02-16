const mongoose = require('mongoose')

function connect(dbConfigs, callbackFunctions) {
  const db = mongoose.connection

  const dbUri = `mongodb://${dbConfigs.username}:${dbConfigs.pwd}@${dbConfigs.host}/${dbConfigs.dbname}`

  mongoose.Promise = global.Promise;

  db.on('error', callbackFunctions.onError)
  db.on('disconnected', callbackFunctions.onDisconnected)
  db.once('open', callbackFunctions.onConnected)

  mongoose.connect(dbUri, {
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30
  })
}

function disconnect() {
  mongoose.disconnect()
}

exports.connect = connect
exports.disconnect = disconnect
