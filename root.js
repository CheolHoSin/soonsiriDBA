// root router functions

const serverConfigs = require('./settings/server_configs')
const authToken = require('./utils/token')
const ysmError = require('./error/ysmError')
const hashUtil = require('./utils/hashUtil')

function root(req, res) {
  res.send('Hello World')
}

function auth(token) {
  return token.userid == serverConfigs.admin.id
}

function notLogined(req, res) {
  if (req.path.indexOf('api') == -1) { res.loadHtml('/login.html')}
  else res.status(400).send({'error' : ysmError.ERRORS.NOT_LOGINED})
}

function login(req, res) {
  const userid = req.body.userid
  const password = req.body.password

  if (userid === serverConfigs.admin.id && hashUtil.getHash(password) === serverConfigs.admin.password) {
    authToken.sign({ userid: userid },
      (err, token) => {
        if (!err) {
          res.cookie('token', token, {
            secure: true,
            httpOnly: true
          })
          res.set('x-issued-token', token)
          res.status(200).json({"result": "success"})
        } else {
          res.status(500).json({"error": ysmError.ERRORS.UNKNOWN})
        }
    })
    return;
  } else {
    res.status(404).json({"error": ysmError.ERRORS.USER_NOT_FOUND})
  }
}

exports.root = root
exports.auth = auth
exports.login = login
exports.notLogined = notLogined
