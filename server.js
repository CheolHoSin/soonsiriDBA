// server start method and app settings
const http = require('http')
const express = require('express')
const app = express()
const router = require('./router')

const database = require('./database/database')

const serverConfigs = require('./settings/server_configs')
const dbConfigs_released = require('./settings/db_configs')
const dbConfigs_test = require('./settings/db_configs_test')

function start(mode) {
  let dbConfigs
  if (mode == 'release') dbConfigs = dbConfigs_released
  else if (mode == 'test') dbConfigs = dbConfigs_test
  else {
    console.log('MODE OPTION NEEDED')
    return;
  }

  app.use('/public', express.static('public'));
  app.use('/', router.router)

  // connect to database
  database.connect(dbConfigs, {
    onConnected: ()=>console.log('database connected at ' + Date()),
    onDisconnected: ()=>console.log('database disconnected at ' + Date()),
    onError: (err)=>console.log(err)
  })

//  app.listen(3000)
  http.createServer(app).listen(serverConfigs.httpPort)

  console.log('server is started: ' + Date());
  console.log('server mode: ' + mode)
}

exports.start = start
