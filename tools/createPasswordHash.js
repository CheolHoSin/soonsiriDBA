const serverConfigs = require('../settings/server_configs')
const hashUtil = require('../utils/hashUtil')
const fs = require('fs')

var password = process.argv[2];

function createPasswordHash(password) {
  let d = new Date()
  let fileName = d.getTime() + '.txt'
  fs.writeFile(fileName, hashUtil.getHash(password), (ferr) => {
    if (ferr) console.log('The file has been saved!');
    else console.log('created: ' + fileName)
  })
}

createPasswordHash(password)
