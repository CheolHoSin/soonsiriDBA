const nullChecker = require('./nullChecker')

function validate(validator, a, b) {
  if (nullChecker.isNull(b)) return validateUnary(validator, a)
  else return validateBinary(validator, a, b)
}

function validateUnary(validator, a) {
  return new Promise((resolve, reject) => {
    msg = {res: '', err: ''}
    if(validator.test(msg, a)) resolve(msg.res)
    else reject(msg.err)
  })
}

function validateBinary(validator, a, b) {
  return new Promise((resolve, reject) => {
    msg = {res: '', err: ''}
    if(validator.test(msg, a, b)) resolve(msg.res)
    else reject(msg.err)
  })
}

const notExistValidator = {
  test: (msg, a) => {
    if (a) { msg.err = 'a exists'; return false }
    else { msg.res = 'a not exists'; return true }
  }
}

const nModifiedValidator = {
  test: (msg, a) => {
    if(a.nModified == 1) { msg.res = 'modifying is success'; return true}
    else { msg.err = 'nModified value is ' + a.nModified; return false}
  }
}

const nModifiedFailValidator = {
  test: (msg, a) => {
    if (a.nModified == 0) { msg.res = 'anything is not modified'; return true }
    else { msg.err = a.nModified + ' are modified'; return false }
  }
}

const deletedValidator = {
  test: (msg, a) => {
    if (a.ok == 1 && a.n == 1) { msg.res = 'deleting is success'; return true }
    else { msg.err = 'deleted: ' + a.n; return false }
  }
}

const notDeletedValidator = {
  test: (msg, a) => {
    if (a.deletedCount == 0) { msg.res = 'anything is not deleted'; return true }
    else { msg.err = a.deletedCount + ' are deleted'; return false }
  }
}

const emptyListValidator = {
  test: (msg, a) => {
    if (nullChecker.isNullArray(a)) { msg.res = 'list is empty'; return true }
    else { msg.err = 'list is not empty'; return false }
  }
}

function createValidatorUnary(validateFunction) {
  return {
    test: (msg, a) => {
      return validateFunction(msg, a)
    }
  }
}

function createValidatorBinary(validateFunction) {
  return {
    test: (msg, a, b) => {
      return validateFunction(msg, a, b)
    }
  }
}

exports.validate = validate
exports.notExistValidator = notExistValidator
exports.nModifiedValidator = nModifiedValidator
exports.nModifiedFailValidator = nModifiedFailValidator
exports.deletedValidator = deletedValidator
exports.notDeletedValidator = notDeletedValidator
exports.emptyListValidator = emptyListValidator
exports.createValidatorUnary = createValidatorUnary
exports.createValidatorBinary = createValidatorBinary
