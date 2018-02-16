// allow controller
// This method set headers. when request is preflight (METHOD == OPTION), just send status 200.

/*
argument: configs {
  ...
  'Access-Control-Allow-Origin': '<domain>, ... (or *)',
  'Access-Control-Allow-Headers': '<my-header>, ... ',
  'Access-Control-Allow-Methods': '<METHOD>, ...',
  ...
}
*/

const middlewareFunction = (configs) => {
  return (req, res, next) => {
    res.set(configs)
    if ('OPTIONS' == req.method) res.send();
    else next();
  }

}

module.exports = middlewareFunction
