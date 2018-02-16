const ERRORS = {
  UNKNOWN: {code: -1, name: 'UNKNOWN', msg: 'unknown'},
  DUPLICATED_FOOD: {code: 0, name: 'DUPLICATED_FOOD', msg: 'duplicated'},
  REQUIRED: {code: 1, name: 'REQUIRED', msg: 'required'},
  INVALID_TAGS: {code: 2, name: 'INVALID_TAGS', msg: 'invalid_tags'},
  UPDATE_FAILED: { code: 3, name: 'UPDATE_FAILED', msg: 'update_failed'},
  NOT_FOUND: { code: 4, name: 'NOT_FOUND', msg: 'not_found'},
  USER_NOT_FOUND: { code: 5, name: 'USER_NOT_FOUND', msg: 'user_not_found'},
  NOT_LOGINED: { code: 6, name: 'NOT_LOGINED', msg: 'not_logined'}
}

function getFoodDBError(dbError) {
  if (dbError.message.indexOf('duplicate key error') != -1) return ERRORS.DUPLICATED_FOOD
  else return ERRORS.UNKNOWN
}

exports.getFoodDBError = getFoodDBError
exports.ERRORS = ERRORS
