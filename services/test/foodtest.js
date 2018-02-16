const assert = require('assert')

const workService = require('../food').work
const foodService = require('../food').food

const fooddummy = require('../../dummies/fooddummy')
const testMethods = require('../../utils/testMethods')
const arrUtil = require('../../utils/arrayUtil')

const equalValidator = testMethods.createValidatorBinary(
  (msg, a, b) => {
    if(!b) { msg.err = 'obj are not found'; return false }
    if(a.name != b.name) { msg.err = 'names are not same: ' + a.name + ', ' + b.name; return false }
    if(!arrUtil.equals(a.tags, b.tags)) { msg.err = 'tags are not same'; return false }
    if(a.msg != b.msg) { msg.err = 'names are not same'; return false }
    msg.err = ''
    msg.res = 'two are same'
    return true
  }
)

const listEqualValidator = testMethods.createValidatorBinary(
  (msg, a, b) => {
    if(!b) { msg.err = 'obj are not found'; return false }
    if (a.length != b.length) { msg.err = 'lengths are not same '; return false }
    let i=0, end=a.length, flag=false
    let j=0
    for (; i<end; i++) {
      flag = false
      for (j=0; j<end; j++) {
        if(flag) break
        flag = (a[i].name == b[j].name) && (arrUtil.equals(a[i].tags, b[j].tags)) && (a[i].msg == b[j].msg)
      }
      if(!flag) { msg.err = a[i].name + ' is not found '; return false }
    }
    msg.err = ''
    msg.res = 'lists are same'
    return true
  }
)

function test(service1, service2, testName) {
  describe(testName, () => {

    beforeEach(() => {
      return service1.insertAll(fooddummy.getDummies())
      .then((res) => service2.insertAll(fooddummy.getTaggedDummies(['alcohol'])))
    })

    afterEach(() => {
      return service1.dropCollection()
      .then((res) => service2.dropCollection())
    })

    describe('#addFood', () => {

      it('should be same between dummy obj and db-written obj', () => {
        const newFood = fooddummy.getNew()

        return service1.addFood(newFood.name, newFood.tags, newFood.msg)
        .then((res) => testMethods.validate(equalValidator, newFood, res))
      })

      it('should be fail when trying to add duplicated food', (done) => {
        const newFood = fooddummy.getDummy(0)

        let success = false

        service1.addFood(newFood.name, newFood.tags, newFood.msg)
        .then((res) => { done('add is success...')})
        .catch((err) => { done() })
      })

    })

    describe('#findFood', () => {

      it('should be same between dummy obj and db-found obj', () => {
        const targetFood = fooddummy.getDummy(1)

        return service1.findFood(targetFood.name)
        .then((res) => testMethods.validate(equalValidator, targetFood, res))
      })

    })

    describe('#findFoods', () => {

      it('should be same between dummy arr and db-found arr', () => {
        const foods = fooddummy.getDummies()
        return service1.findFoods([])
        .then((res) => testMethods.validate(listEqualValidator, foods, res))
      })

      it('should be same between filtered dummy arr and db-fond arr', () => {
        const tags = ['night', 'alcohol']
        const foods = fooddummy.getTaggedDummies(tags)
        return service1.findFoods(tags)
        .then((res) => testMethods.validate(listEqualValidator, foods, res))
      })

    })

    describe('#sampleOne', () => {

      it('should finds one food (dinner, alcohol)', () => {
        const tags = ['dinner', 'alcohol']
        return service1.sampleOne(tags)
        .then((res) => {
          return new Promise((resolve, reject) => {
            console.log(res)
            resolve()
          })
        })
      })

      it('should finds one food (all)', () => {
        const tags = []
        return service1.sampleOne(tags)
        .then((res) => {
          return new Promise((resolve, reject) => {
            console.log(res)
            resolve()
          })
        })
      })

      it('should finds one food (-cheap, -night)', () => {
        const tags = []
        const excepts = ['cheap', 'night']
        return service1.sampleOne(tags, excepts)
        .then((res) => {
          return new Promise((resolve, reject) => {
            console.log(res)
            resolve()
          })
        })
      })

      it('should finds one food (alcohol, dinner, -night, -expenssive)', () => {
        const tags = ['alcohol', 'dinner']
        const excepts = ['night', 'expenssive']
        return service1.sampleOne(tags, excepts)
        .then((res) => {
          return new Promise((resolve, reject) => {
            console.log(res)
            resolve()
          })
        })
      })

    })

    describe('#removeFood', () => {

      it('should remove a food', () => {
        const targetFood = fooddummy.getDummy(0)

        return service1.removeFood(targetFood.name)
        .then((res) => testMethods.validate(testMethods.deletedValidator, res))
        .then(() => service1.findFood(targetFood.name))
        .then((res) => testMethods.validate(testMethods.notExistValidator, res))
      })

    })

    describe('#updateName', () => {

      it('should be same between dummy obj and db obj', () => {
        const targetFood = fooddummy.getDummy(1)
        const oldName = targetFood.name
        targetFood.name = 'newName'

        return service1.updateName(oldName, targetFood.name)
        .then((res) => testMethods.validate(testMethods.nModifiedValidator, res))
        .then(() => service1.findFood(targetFood.name))
        .then((res) => testMethods.validate(equalValidator, targetFood, res))
      })

    })

    describe('#updateTags', () => {

      it('should be same between dummy obj and db obj', () => {
        const targetFood = fooddummy.getDummy(1)
        targetFood.tags = ['lunch']

        return service1.updateTags(targetFood.name, targetFood.tags)
        .then((res) => testMethods.validate(testMethods.nModifiedValidator, res))
        .then(() => service1.findFood(targetFood.name))
        .then((res) => testMethods.validate(equalValidator, targetFood, res))
      })

    })

    describe('#updateMsg', () => {

      it('should be same between dummy obj and db obj', () => {
        const targetFood = fooddummy.getDummy(1)
        targetFood.msg = 'helloworld'

        return service1.updateMsg(targetFood.name, targetFood.msg)
        .then((res) => testMethods.validate(testMethods.nModifiedValidator, res))
        .then(() => service1.findFood(targetFood.name))
        .then((res) => testMethods.validate(equalValidator, targetFood, res))
      })
    })

    describe('#replaceCollection', () => {

      it('should be same between foods and works', () => {
        const expected = fooddummy.getTaggedDummies(['alcohol'])
        return service1.replaceCollection()
        .then((res) => testMethods.validate(listEqualValidator, expected, res))
      })

      it('should be empty list', () => {
        return service2.dropCollection()
        .then(() => service1.replaceCollection())
        .then((res) => testMethods.validate(testMethods.emptyListValidator, res))
      })

      it('should be between foods and works', () => {
        const expected = fooddummy.getTaggedDummies(['alcohol'])

        return service1.dropCollection()
        .then(() => service1.replaceCollection())
        .then((res) => testMethods.validate(listEqualValidator, expected, res))
      })
    })

  })
}

exports.test = () => {
  test(workService, foodService, 'work')
  test(foodService, workService, 'food')
}
