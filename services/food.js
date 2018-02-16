const nullChecker = require('../utils/nullChecker')
const Food = require('../models/food')
const Work = require('../models/work')

// This function adds a food and returns a promise object: resolve(food)
function addFood(Model, name, tags, msg) {
  const food = new Model({
    name: name,
    tags: tags,
    msg: msg
  })

  return food.save()
}

// This function remove a food and returns a promise object: resolve(raw)
function removeFood(Model, name) {
  return Model.deleteOne({name: name})
}

// This function find a food and returns a promise object: resolve(food)
function findFood(Model, name) {
  return Model.findOne({name: name})
}

// This function find all foods tagged by 'tags' and excepts 'excepts'. Then it returns a promise object: resolve(foods)
function findFoods(Model, tags, excepts) {
  let include = !nullChecker.isNullArray(tags)
  let except = !nullChecker.isNullArray(excepts)
  let query

  if (include) {
    if (except) {
      query = Model.find({$and: [{tags: {$all: tags}}, {tags: {$not: {$in: excepts}}}]})
    } else {
      query = Model.find({tags: {$all: tags}})
    }
  } else {
    if (except) {
      query = Model.find({tags: {$not: {$in: excepts}}})
    } else {
      query = Model.find()
    }
  }

  return query.sort('name')
}

// This function sample one food tagged by 'tags' and returns a promise object: resolve(food)
function sampleOne(Model, tags, excepts) {
  const include = !nullChecker.isNullArray(tags)
  const except = !nullChecker.isNullArray(excepts)

  if (include) {
    if (except) {
      return Model.aggregate([
        { $match: {$and: [{tags: {$all: tags}}, {tags: {$not: {$in: excepts}}}]} },
        { $sample: {size: 1} }
      ]);
    } else {
      return Model.aggregate([
        { $match: {tags: {$all: tags}} },
        { $sample: {size: 1} }
      ]);
    }
  } else {
    if (except) {
      return Model.aggregate([
        { $match: {tags: {$not: {$in: excepts}}}},
        { $sample: {size: 1}}
      ])
    } else {
      return Model.aggregate([
        { $match: {tags: {$not: {$all: []}}}},
        { $sample: {size: 1}}
      ])
    }
  }
}

// This function updates food's name and returns a promise object: resolve(raw)
function updateName(Model, oldName, newName) {
  return Model.update({name: oldName}, {$set: {name: newName}})
}

// This function updates food's tags and returns a promise object: resolve(raw)
function updateTags(Model, name, tags) {
  return Model.update({name: name}, {$set: {tags: tags}})
}

// This function updates food's msg and returns a promise obejct: resolve(raw)
function updateMsg(Model, name, msg) {
  return Model.update({name: name}, {$set: {msg: msg}})
}

// This function replace Dest with Source and returns a promise object: resolve(foods)
function replaceCollection(Source, Dest) {

  let list = []

  const getList = (res) => {
    return new Promise((resolve, reject) => {
      list = res.map((elm) => {
        return {
          name: elm.name,
          msg: elm.msg,
          tags: elm.tags
        }
      })

      resolve()
    })
  }


  return Source.find()
  .then(getList)
  .then(() => Dest.remove())
  .then(() => Dest.create(list))
}

// This function remove collection and all documents in it.
function dropCollection(Model) {
  return Model.remove()
}

// This function inserts foods all
function insertAll(Model, foods) {
  return Model.create(foods)
}

function ModelInjector(Model1, Model2) {
  return {
    addFood: (name, tags, msg) => { return addFood(Model1, name, tags, msg) },
    removeFood: (name) => { return removeFood(Model1, name) },
    findFood: (name) => { return findFood(Model1, name) },
    findFoods: (tags, excepts) => { return findFoods(Model1, tags, excepts) },
    sampleOne: (tags, excepts) => { return sampleOne(Model1, tags, excepts) },
    updateName: (oldName, newName) => { return updateName(Model1, oldName, newName) },
    updateTags: (name, tags) => { return updateTags(Model1, name, tags) },
    updateMsg: (name, msg) => { return updateMsg(Model1, name, msg) },
    dropCollection: () => { return dropCollection(Model1) },
    insertAll: (foods) => { return insertAll(Model1, foods) },
    replaceCollection: () => { return replaceCollection(Model2, Model1)}
  }
}

exports.work = ModelInjector(Work, Food)
exports.food = ModelInjector(Food, Work)
