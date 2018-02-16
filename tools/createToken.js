const authToken = require('../utils/token')
const serverConfigs = require('../settings/server_configs')
const fs = require('fs')

authToken.jombieToken({ userid: serverConfigs.admin.id },
  (err, token) => {
    if (!err) {
      let d = new Date()
      let fileName = d.getTime() + '.txt'
      fs.writeFile(fileName, token, (ferr) => {
        if (ferr) console.log('The file has been saved!');
        else console.log('created: ' + fileName)
      });
    } else {
      console.log(err)
    }
})
