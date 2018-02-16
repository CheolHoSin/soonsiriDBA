const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const assert = require('assert')

const bluehouse = require('../bluehouse')
const ysmError = require('../../error/ysmError')
const workService = require('../../services/food').work
const foodService = require('../../services/food').food
const fooddummy = require('../../dummies/fooddummy')
const arrUtil = require('../../utils/arrayUtil')
const nullChecker = require('../../utils/nullChecker')

var req, res
var sandbox

function mockupHttp() {
  req = httpMocks.createRequest()
  res = httpMocks.createResponse({
    eventEmitter: require('events').EventEmitter
  })
}

function useSandbox(sandbox, service) {

  const findFoods = (tags, excepts) => {
    return new Promise((resolve, reject) => {
      const data = fooddummy.getTaggedDummies(tags, excepts)
      resolve(data)
    })
  }

  const addFood = (name, tags, msg) => {
    return new Promise((resolve, reject) => {
      const dummies = fooddummy.getDummies()
      let i=0, end=dummies.length

      for (; i<end; i++) {
        if (dummies[i].name == name) {
          let error = new Error('duplicate key error')
          reject(error)
        }
      }
      resolve({name: name, tags: tags, msg: msg})
    })
  }

  const updateName = (oldName, newName) => {
    return new Promise((resolve, reject) => {
      const dummies = fooddummy.getDummies()

      let i=0, end=dummies.length
      let nModified = 0
      for (; i<end; i++) {
        if (dummies[i].name == oldName) nModified++
        if (dummies[i].name == newName) {
          let error = new Error('duplicate key error')
          reject(error)
        }
      }

      resolve({nModified: nModified})
    })
  }

  const updateTags = (name, tags) => {
    return new Promise((resolve, reject) => {
      const dummies = fooddummy.getDummies()

      let i=0, end=dummies.length
      let nModified = 0
      for (; i<end; i++) {
        if (dummies[i].name == name) nModified++
      }

      resolve({nModified: nModified})
    })
  }

  const updateMsg = (name, msg) => {
    return new Promise((resolve, reject) => {
      const dummies = fooddummy.getDummies()

      let i=0, end=dummies.length
      let nModified = 0
      for (; i<end; i++) {
        if (dummies[i].name == name) nModified++
      }

      resolve({nModified: nModified})
    })
  }

  const removeFood = (name) => {
    return new Promise((resolve, reject) => {
      const dummies = fooddummy.getDummies()

      let i=0, end=dummies.length
      let ok=1, n=0
      for (; i<end; i++) {
        if (dummies[i].name == name) n++
      }

      resolve({ok: ok, n: n})
    })
  }

  const sampleOne = (tags, excepts) => {
    return new Promise((resolve, reject) => {
      const data = fooddummy.getTaggedDummies(tags, excepts)
      const idx = Math.floor(Math.random() * data.length)

      resolve([data[idx]])
    })
  }

  const replaceCollection = () => {
    return new Promise((resolve, reject) => {
      resolve(fooddummy.getDummies())
    })
  }

  sandbox.stub(service, 'findFoods').callsFake(findFoods)
  sandbox.stub(service, 'addFood').callsFake(addFood)
  sandbox.stub(service, 'updateName').callsFake(updateName)
  sandbox.stub(service, 'updateTags').callsFake(updateTags)
  sandbox.stub(service, 'updateMsg').callsFake(updateMsg)
  sandbox.stub(service, 'removeFood').callsFake(removeFood)
  sandbox.stub(service, 'sampleOne').callsFake(sampleOne)
  sandbox.stub(service, 'replaceCollection').callsFake(replaceCollection)
}

function restoreSandbox() {
  sandbox.restore()
}

function equalList(list1, list2, msg) {
  if (list1.length != list2.length) { msg.err = 'lengths are not same'; return false }

  let i=0, end=list1.length, flag=false
  let j=0
  for(; i<end; i++) {
    flag = false
    for(; j<end; j++) {
      if(flag) break
      flag = (list1[i].name == list2[j].name)
        && (arrUtil.equals(list1[i].tags, list2[j].tags))
        && (list1[i].msg == list2[j].msg)
    }
    if(!flag) { msg.err = list1[i].name + ' is not found '; return false }
  }
  msg.res = 'two are same'
  return true

}

function test() {
  describe('bluehouse', () => {
    before(() => {
      sandbox = sinon.sandbox.create()
      useSandbox(sandbox, workService)
      useSandbox(sandbox, foodService)
    })

    after(() => {
      restoreSandbox()
    })

    beforeEach(() => {
      mockupHttp()
    })

    afterEach(() => {
      req = null
      res = null
    })

    describe('#getList', () => {

      it('should be same between dummy list and db list', (done) => {
        req.params.tags = ''

        const expected = fooddummy.getTaggedDummies([])

        res.on('end', () => {
          let resData = res._getData()
          if(res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }

          let msg = {}
          if(!equalList(expected, resData.foods, msg)) { done(new Error(msg.err)); return }

          done()
        })

        bluehouse.getList(req, res)

      })

      it('should be same between dummy filtered list (include) and db list', (done) => {
        const tags = ['dinner', 'alcohol']
        const tagsString = '+dinner&+alcohol'
        req.params.tags = tagsString

        const expected = fooddummy.getTaggedDummies(tags)

        res.on('end', () => {
          let resData = res._getData()
          if(res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }

          let msg = {}
          if(!equalList(expected, resData.foods, msg)) { done(new Error(msg.err)); return }

          done()
        })

        bluehouse.getList(req, res)
      })

      it('should be same between dummy filtered list (excepts) and db list', (done) => {
        const excepts = ['cheap', 'night']
        const tagsString = '-cheap&-night'
        req.params.tags = tagsString

        const expected = fooddummy.getTaggedDummies([], excepts)

        res.on('end', () => {
          let resData = res._getData()
          if(res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }

          let msg = {}
          if(!equalList(expected, resData.foods, msg)) { done(new Error(msg.err)); return }

          done()
        })

        bluehouse.getList(req, res)
      })

      it('should be same between dummy filtered list (inclde, dinner) and db list', (done) => {
        const tags = ['alcohol', 'dinner']
        const excepts = ['night', 'expenssive']
        const tagsString = '+dinner&-night&+alcohol&-expenssive'
        req.params.tags = tagsString

        const expected = fooddummy.getTaggedDummies(tags, excepts)

        res.on('end', () => {
          let resData = res._getData()
          if(res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }

          let msg = {}
          if(!equalList(expected, resData.foods, msg)) { done(new Error(msg.err)); return }

          done()
        })

        bluehouse.getList(req, res)
      })

      it('should statusCode === 400 and response === INVALID_TAGS', (done) => {
        const tagsString = 'dinner&alcohol&TEST'
        req.params.tags = tagsString

        res.on('end', () => {
          let resData = res._getData()
          if(res.statusCode !== 400) { done(new Error('statusCode: ' + res.statusCode)); return }
          if(resData.error !== ysmError.ERRORS.INVALID_TAGS) { done(new Error('resData' + JSON.stringify(resData))); return }

          done()
        })

        bluehouse.getList(req, res)
      })

    })

    describe('#addFood', () => {

      it('should statusCode === 400 and response === DUPLICATED_FOOD', (done) => {
        req.body.name = '삼겹살'
        req.body.tags = ['dinner', 'soju', 'alcohol']
        req.body.msg = '삼겹살입니다'

        res.on('end', () => {
          const resData = res._getData()
          if(res.statusCode !== 400) { done(new Error('statusCode: ' + res.statusCode)); return }
          if(resData.error !== ysmError.ERRORS.DUPLICATED_FOOD) { done(new Error('resData: ' + JSON.stringify(resData))); return }
          done()
        })

        return bluehouse.addFood(req, res)
      })

      it('should statusCode === 400 and response === REQUIRED', (done) => {
        req.body.name = '테스트'
        req.body.tags = ['dinner', 'soju', 'alcohol']
        req.body.msg = '삼겹살입니다'

        const dice = Math.floor(Math.random()*7)
        if(dice == 0) { req.body.name = ''}
        else if (dice == 1) { req.body.tags = []}
        else if (dice == 2) { req.body.msg = ''}
        else if (dice == 3) { req.body.name = ''; req.body.tags = []}
        else if (dice == 4) { req.body.name = ''; req.body.msg = ''}
        else if (dice == 5) { req.body.tags= []; req.body.msg = ''}
        else { req.body.name = ''; req.body.msg = ''; req.body.tags = []}

        res.on('end', () => {
          const resData = res._getData()
          if(res.statusCode !== 400) { done(new Error('statusCode: ' + res.statusCode)); return }
          if(resData.error !== ysmError.ERRORS.REQUIRED) { done(new Error('resData: ' + JSON.stringify(resData))); return }
          done()
        })

        return bluehouse.addFood(req, res)
      })

      it('should statusCode === 400 and response === INVALID_TAGS', (done) => {
        req.body.name = '테스트'
        req.body.tags = ['lunch', 'dinner', 'test']
        req.body.msg = '삼겹살입니다'

        res.on('end', () => {
          const resData = res._getData()
          if(res.statusCode !== 400) { done(new Error('statusCode: ' + res.statusCode)); return }
          if(resData.error !== ysmError.ERRORS.INVALID_TAGS) { done(new Error('resData: ' + JSON.stringify(resData))); return }
          done()
        })

        return bluehouse.addFood(req, res)
      })

      it('should statusCode === 201', (done) => {
        req.body.name = '테스트'
        req.body.tags = ['dinner', 'soju', 'alcohol']
        req.body.msg = '테스트입니다'

        res.on('end', () => {
          const resData = res._getData()
          if(res.statusCode !== 201) { done(new Error('statusCode: ' + res.statusCode)); return }
          done()
        })

        return bluehouse.addFood(req, res)
      })
    })
    describe('#updateName', () => {

      it('should statusCode == 400 and response === DUPLICATED_FOOD', (done) => {
        req.body.oldName = '삼겹살'
        req.body.newName = '김밥'

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 400) { done(new Error('statusCode: ' + res.statusCode)); return }
          if (resData.error !== ysmError.ERRORS.DUPLICATED_FOOD) { done(new Error('resData: ' + JSON.stringify(resData))); return }
          done()
        })

        return bluehouse.updateName(req, res)
      })

      it('should statusCode == 404 and response === NOT_FOUND', (done) => {
        req.body.oldName = '테스트'
        req.body.newName = '테스트2'

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 404) { done(new Error('statusCode: ' + res.statusCode)); return }
          if (resData.error !== ysmError.ERRORS.NOT_FOUND) { done(new Error('resData: ' + JSON.stringify(resData))); return }
          done()
        })

        return bluehouse.updateName(req, res)
      })

      it('should statusCode == 400 and response === REQUIRED', (done) => {
        req.body.oldName = ''
        req.body.newName = ''

        const dice = Math.floor(Math.random()*3)
        if(dice == 0) { req.body.oldName == '삼겹살'}
        else if (dice == 1) { req.body.newName == '테스트'}
        else {}

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 400) { done(new Error('statusCode: ' + res.statusCode)); return }
          if (resData.error !== ysmError.ERRORS.REQUIRED) { done(new Error('resData: ' + JSON.stringify(resData))); return }
          done()
        })

        return bluehouse.updateName(req, res)
      })

      it('should statusCode == 200', (done) => {
        req.body.oldName = '삼겹살'
        req.body.newName = '테스트'

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }
          done()
        })

        return bluehouse.updateName(req, res)
      })

    })

    describe('#updateTags', () => {

      it('should statusCode == 400 and response === REQUIRED', (done) => {
        req.body.name = ''
        req.body.tags = ''

        const dice = Math.floor(Math.random()*3)
        if(dice == 0) { req.body.name == '삼겹살'}
        else if (dice == 1) { req.body.tags == ['lunch', 'dinner', 'night']}
        else {}

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 400) { done(new Error('statusCode: ' + res.statusCode)); return }
          if (resData.error !== ysmError.ERRORS.REQUIRED) { done(new Error('resData: ' + JSON.stringify(resData))); return }
          done()
        })

        return bluehouse.updateTags(req, res)
      })

      it('should statusCode == 400 and response === INVALID_TAGS', (done) => {
        req.body.name = '삼겹살'
        req.body.tags = ['lunch', 'dinner', 'night', 'TEST']

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 400) { done(new Error('statusCode: ' + res.statusCode)); return }
          if (resData.error !== ysmError.ERRORS.INVALID_TAGS) { done(new Error('resData' + JSON.stringify(resData))); return}
          done()
        })

        return bluehouse.updateTags(req, res)
      })

      it('should statusCode == 404 and response === NOT_FOUND', (done) => {
        req.body.name = '테스트'
        req.body.tags = ['lunch', 'dinner', 'night']

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 404) { done(new Error('statusCode: ' + res.statusCode)); return }
          if (resData.error !== ysmError.ERRORS.NOT_FOUND) { done(new Error('resData' + JSON.stringify(resData))); return}
          done()
        })

        return bluehouse.updateTags(req, res)
      })

      it('should statusCode == 200', (done) => {
        req.body.name = '삼겹살'
        req.body.tags = ['lunch', 'dinner', 'night']

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }
          done()
        })

        return bluehouse.updateTags(req, res)
      })

    })

    describe('#updateMsg', () => {

      it('should statusCode == 400 and response === REQUIRED', (done) => {
        req.body.name = ''
        req.body.msg = ''

        const dice = Math.floor(Math.random()*3)
        if(dice == 0) { req.body.name == '삼겹살'}
        else if (dice == 1) { req.body.msg == 'message'}
        else {}

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 400) { done(new Error('statusCode: ' + res.statusCode)); return }
          if (resData.error !== ysmError.ERRORS.REQUIRED) { done(new Error('resData: ' + JSON.stringify(resData))); return }
          done()
        })

        return bluehouse.updateMsg(req, res)
      })

      it('should statusCode == 404 and response === NOT_FOUND', (done) => {
        req.body.name = '테스트'
        req.body.msg = 'message'

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 404) { done(new Error('statusCode: ' + res.statusCode)); return }
          if (resData.error !== ysmError.ERRORS.NOT_FOUND) { done(new Error('resData' + JSON.stringify(resData))); return}
          done()
        })

        return bluehouse.updateMsg(req, res)
      })

      it('should statusCode == 200', (done) => {
        req.body.name = '삼겹살'
        req.body.msg = '변경된 텍스트'

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }
          done()
        })

        return bluehouse.updateMsg(req, res)
      })

    })

    describe('#removeFood', () => {

      it('should statusCode == 400 and response === REQUIRED', (done) => {
        req.body.name = ''

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 400) { done(new Error('statusCode: ' + res.statusCode)); return }
          if (resData.error !== ysmError.ERRORS.REQUIRED) { done(new Error('resData: ' + JSON.stringify(resData))); return }
          done()
        })

        return bluehouse.removeFood(req, res)
      })

      it('should statusCode == 404 and response === NOT_FOUND', (done) => {
        req.body.name = '테스트'

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 404) { done(new Error('statusCode: ' + res.statusCode)); return }
          if (resData.error !== ysmError.ERRORS.NOT_FOUND) { done(new Error('resData' + JSON.stringify(resData))); return}
          done()
        })

        return bluehouse.removeFood(req, res)
      })

      it('should statusCode == 200', (done) => {
        req.body.name = '삼겹살'

        res.on('end', () => {
          const resData = res._getData()

          if (res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }
          done()
        })

        return bluehouse.removeFood(req, res)
      })

    })

    describe('#test', () => {

      it('should statusCode == 200', (done) => {
        req.params.tags = ''

        res.on('end', () => {
          let resData = res._getData()
          if(res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }

          console.log(resData.food)

          done()
        })

        bluehouse.test(req, res)

      })

      it('should statusCode == 200 and result has tags', (done) => {
        const tags = ['dinner', 'alcohol']
        const tagsString = '+dinner&+alcohol'
        req.params.tags = tagsString

        res.on('end', () => {
          let resData = res._getData()
          if (res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }

          if (nullChecker.isNull(resData.food)) { done(); return }
          if (nullChecker.isNullArray(resData.food.tags)) { done(new Error('tags are null')); return }
          if (!arrUtil.contains(resData.food.tags, tags)) { done(new Error('result doesn\'t contains tags')); return }

          done()
        })

        bluehouse.test(req, res)
      })

      it('should statusCode == 200 and result does not have excepts', (done) => {
        const excepts = ['cheap', 'night']
        const tagsString = '-cheap&-night'
        req.params.tags = tagsString

        res.on('end', () => {
          let resData = res._getData()
          if (res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }

          if (nullChecker.isNull(resData.food)) { done(); return }
          if (nullChecker.isNullArray(resData.food.tags)) { done(new Error('tags are null')); return }
          if (!arrUtil.notContains(resData.food.tags, excepts)) { done(new Error('result contains tags')); return }

          done()
        })

        bluehouse.test(req, res)
      })

      it('should statusCode == 200 and result has tags and does not have excepts', (done) => {
        const tags = ['alcohol', 'dinner']
        const excepts = ['night', 'expenssive']
        const tagsString = '-expenssive&+alcohol&-night&+dinner'
        req.params.tags = tagsString

        res.on('end', () => {
          let resData = res._getData()
          if (res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }

          if (nullChecker.isNull(resData.food)) { done(); return }
          if (nullChecker.isNullArray(resData.food.tags)) { done(new Error('tags are null')); return }
          if (!arrUtil.contains(resData.food.tags, tags)) { done(new Error('result doesn\'t contains tags')); return }
          if (!arrUtil.notContains(resData.food.tags, excepts)) { done(new Error('result contains tags')); return }

          done()
        })

        bluehouse.test(req, res)
      })

      it('should statusCode === 400 and response === INVALID_TAGS', (done) => {
        const tagsString = '+dinner&-alcohol&+TEST'
        req.params.tags = tagsString

        res.on('end', () => {
          let resData = res._getData()
          if(res.statusCode !== 400) { done(new Error('statusCode: ' + res.statusCode)); return }
          if(resData.error !== ysmError.ERRORS.INVALID_TAGS) { done(new Error('resData' + JSON.stringify(resData))); return }

          done()
        })

        bluehouse.test(req, res)
      })

      describe('#revertWork', () => {
        it('should statusCode === 200 and response === fooddummies', (done) => {
          res.on('end', () => {
            let resData = res._getData()
            if (res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }

            let msg = {}
            if (!equalList(resData.foods, fooddummy.getDummies(), msg)) { done(new Error(msg.err)); return }

            done()
          })

          bluehouse.revertWork(req, res)
        })
      })

      describe('#commitWork', () => {
        it('should statusCode === 200', (done) => {
          res.on('end', () => {
            let resData = res._getData()
            if (res.statusCode !== 200) { done(new Error('statusCode: ' + res.statusCode)); return }

            done()
          })

          bluehouse.commitWork(req, res)
        })
      })

    })

  })
}

exports.test = test
