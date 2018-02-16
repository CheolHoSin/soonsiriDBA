const workService = require('../services/food').work
const foodService = require('../services/food').food
const ysmError = require('../error/ysmError')
const arrUtil = require('../utils/arrayUtil')
const values = require('../values')
const nullChecker = require('../utils/nullChecker')

function parseTagsArray(tagsString) {
  let tags = {
    includes: [],
    excepts: [],
    error: false
  }
  if (nullChecker.isNull(tagsString)) {
    return tags
  } else {
    let arr = tagsString.split('&')
    let prefix, elm
    for (elm of arr) {
      prefix = elm.charAt(0)
      if(prefix == '+') { tags.includes.push(elm.slice(1)) }
      else if(prefix == '-') { tags.excepts.push(elm.slice(1)) }
      else { tags.error = true; return tags}
    }

    return tags
  }
}

function validateParams(select, params) {
  let paramNames = Object.keys(params)
  if (!arrUtil.contains(paramNames, select)) return false

  let end=select.length

  for (let i=0; i<end; i++) {
    if (select[i] == 'tags') {
      if(nullChecker.isNullArray(params[select[i]])) return false
    } else {
      if(nullChecker.isNull(params[select[i]])) return false
    }
  }

  return true
}

function validateFoodTypes(tags) {
   return arrUtil.contains(values.foodTypes, tags)
}

const dbHandler = {
  onCommonError: (res, err) => {
    let error, status
    if (ysmError.getFoodDBError(err) === ysmError.ERRORS.DUPLICATED_FOOD) {
      error = ysmError.ERRORS.DUPLICATED_FOOD
      status = 400
    }
    else {
      error = ysmError.UNKNOWN
      status = 500
    }
    res.status(status).send({error: error})
  },
  onFoundFoods: (res, result) => { res.status(200).send({foods: result}) },
  onAddedFood: (res, result) => { res.status(201).send({result: 'Added'}) },
  onUpdatedFood: (res, result) => {
    if (result.nModified == 1) res.status(200).send({result: 'Updated'})
    else if (result.nModified == 0) res.status(404).send({error: ysmError.ERRORS.NOT_FOUND})
    else return res.status(500).send({error: ysmError.ERRORS.UNKNOWN})
  },
  onRemovedFood: (res, result) => {
    if (result.ok == 1) {
      if (result.n == 1) res.status(200).send({result: 'Removed'})
      else if (result.n == 0) res.status(404).send({error: ysmError.ERRORS.NOT_FOUND})
      else res.status(500).send({error: ysmError.ERRORS.UNKNOWN})
    } else {
      return res.status(500).send({error: ysmError.ERRORS.UNKNOWN})
    }
  },
  onFoundFood: (res, result) => {
    if (nullChecker.isNullArray(result)) res.status(200).send({food: {}})
    else res.status(200).send({food: result[0]})
  },
  onRevertWork: (res, result) => {
    if(nullChecker.isNullArray(result)) { res.status(200).send({foods: []}) }
    else res.status(200).send({foods: result})
  },
  onCommitWork: (res, result) => {
    res.status(200).send({result: 'Commit'})
  }
}

// GET main page
function main(req, res) {
  res.loadHtml('/bluehouse.html')
}

// GET LIST tagged by 'tags'. response sends a list of json
function getList(req, res) {
  // parse params
  const tags = parseTagsArray(req.params.tags)

  // check parameter's validation
  if (tags.error || !validateFoodTypes(tags.includes) || !validateFoodTypes(tags.excepts)) {
    res.status(400).send({error: ysmError.ERRORS.INVALID_TAGS})
    return
  }

  // read food list
  workService.findFoods(tags.includes, tags.excepts)
  .then((result) => dbHandler.onFoundFoods(res, result))
  .catch((err) => dbHandler.onCommonError(res, err))      // fail

}

// Write a food (name, tags, msg). response sends a result
function addFood(req, res) {
  // parse params
  const name = req.body.name
  const tags = req.body.tags
  const msg = req.body.msg

  // check parameter's validation
  if (!validateParams(['name', 'tags', 'msg'], req.body)) {
    res.status(400).send({error: ysmError.ERRORS.REQUIRED})
    return
  }
  if (!validateFoodTypes(tags)) {
    res.status(400).send({error: ysmError.ERRORS.INVALID_TAGS})
    return
  }

  // write a food
  workService.addFood(name, tags, msg)
  .then((result) => dbHandler.onAddedFood(res, result))  // success
  .catch((err) => dbHandler.onCommonError(res, err)) // fail
}

function updateName(req, res) {
  // parse params
  const oldName = req.body.oldName
  const newName = req.body.newName

  // check parameter's validation
  if (!validateParams(['oldName', 'newName'], req.body)) {
    res.status(400).send({error: ysmError.ERRORS.REQUIRED})
    return
  }

  // update a food
  workService.updateName(oldName, newName)
  .then((result) => dbHandler.onUpdatedFood(res, result)) // success
  .catch((err) => dbHandler.onCommonError(res, err))    // fail
}

function updateTags(req, res) {
  // parse params
  const name = req.body.name
  const tags = req.body.tags

  // check parameter's validation
  if (!validateParams(['name', 'tags'], req.body)) {
    res.status(400).send({error: ysmError.ERRORS.REQUIRED})
    return
  }
  if (!arrUtil.contains(values.foodTypes, tags)) {
    res.status(400).send({error: ysmError.ERRORS.INVALID_TAGS})
    return
  }

  // update a food
  workService.updateTags(name, tags)
  .then((result) => dbHandler.onUpdatedFood(res, result)) // success
  .catch((err) => dbHandler.onCommonError(res, err)) // failed

}

function updateMsg(req, res) {
  // parse params
  const name = req.body.name
  const msg = req.body.msg

  // check parameter's validation
  if (!validateParams(['name', 'msg'], req.body)) {
    res.status(400).send({error: ysmError.ERRORS.REQUIRED})
    return
  }

  // update a food
  workService.updateMsg(name, msg)
  .then((result) => dbHandler.onUpdatedFood(res, result)) // success
  .catch((err) => dbHandler.onCommonError(res, err)) // failed
}

function removeFood(req, res) {
  // parse params
  const name = req.body.name

  // check parameter's validation
  if (!validateParams(['name'], req.body)) {
    res.status(400).send({error: ysmError.ERRORS.REQUIRED})
    return
  }

  // delete a food
  workService.removeFood(name)
  .then((result) => dbHandler.onRemovedFood(res, result)) // success
  .catch((err) => dbHandler.onCommonError(res, err)) // failed
}

function test(req, res) {
  // parse params
  const tags = parseTagsArray(req.params.tags)

  // check parameter's validation
  if (tags.error || !validateFoodTypes(tags.includes) || !validateFoodTypes(tags.excepts)) {
    res.status(400).send({error: ysmError.ERRORS.INVALID_TAGS})
    return
  }

  // find a random one
  workService.sampleOne(tags.includes, tags.excepts)
  .then((result) => dbHandler.onFoundFood(res, result))  // success
  .catch((err) => dbHandler.onCommonError(res, err)) // failed
}

function revertWork(req, res) {
  workService.replaceCollection()
  .then((result) => dbHandler.onRevertWork(res, result))
  .catch((err) => dbHandler.onCommonError(res, err))
}

function commitWork(req, res) {
  foodService.replaceCollection()
  .then((result) => dbHandler.onCommitWork(res, result))
  .catch((err) => dbHandler.onCommonError(res, err))
}

exports.main = main
exports.getList = getList
exports.addFood = addFood
exports.updateName = updateName
exports.updateTags = updateTags
exports.updateMsg = updateMsg
exports.removeFood = removeFood
exports.test = test
exports.revertWork = revertWork
exports.commitWork = commitWork
