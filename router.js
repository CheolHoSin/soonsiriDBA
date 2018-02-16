const express = require('express')

const rootRouter = express.Router()
const bluehouseRouter = require('./bluehouse/router')

const headersCreator = require('./middlewares/headers-creator')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const tokenParser = require('./middlewares/token-parser')
const logger = require('./middlewares/logger')
const simpleHtml = require('./middlewares/simple-html')
const tokenAuthenticator = require('./middlewares/token-authenticator')

const serverConfigs = require('./settings/server_configs')

const root = require('./root')

rootRouter.use(headersCreator(serverConfigs.headers))
rootRouter.use(bodyParser.urlencoded({ extended: true }))
rootRouter.use(bodyParser.json())         // body parser
rootRouter.use(cookieParser())                    // cookie parser
rootRouter.use('/', simpleHtml({ root: serverConfigs.viewPath }))  // simpleHtml
// rootRouter.use('/', logger)            // logger
rootRouter.use('/bluehouse', tokenParser(root.notLogined)) // token parser
rootRouter.use('/bluehouse', tokenAuthenticator(root.auth, root.notLogined, serverConfigs.token)) // token authentiator

rootRouter.get('/', root.root)
rootRouter.post('/login', root.login)
rootRouter.use('/bluehouse', bluehouseRouter.router)

exports.router = rootRouter
