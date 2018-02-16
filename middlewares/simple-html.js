// SIMPLE HTML
// This middleware extens response object's loadHtml() function for using html files simply

/* usage
*
*  const simpleHtml = require('simple-html')
*
*  app.use('/', simpleHtml({root: 'C:/nodejs/myserver/public/views/'})) //absolute path
*
*  app.get('/', (req, res) => {
*    res.loadHtml('user/login.html')
*  })
*/

function middleWareFunction(opts) {
  const simpleHtml = (req, res, next) => {
    res.loadHtml = (path) => {
      res.sendFile(opts.root + path)
    }

    next()
  }

  return simpleHtml
}

module.exports = middleWareFunction
