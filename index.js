// server commands
const mode = process.argv[2];

const server = require('./server')

server.start(mode)
