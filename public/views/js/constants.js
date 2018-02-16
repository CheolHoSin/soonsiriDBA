/* error text */
const ERROR_STR = {
  'required': '필요한 항목을 모두 채우세요.',
  'duplicated': '음식 이름이 중복됐습니다.',
  'unknown': '알 수 없는 오류',
  'invalid_tags': '태그를 잘못 입력했습니다.',
  'update_failed': '업데이트를 실패했습니다.',
  'not_found': '해당 음식을 찾을 수 없습니다.',
  'blank_tags': '태그를 비울 수 없습니다',
  'not_logined': '로그인이 필요합니다',
  'user_not_found': '아이디와 비밀번호를 확인해주세요'
}

const HOST = 'http://localhost:3210'

const URIS = {
  LOGIN_URI: HOST + '/login',
  MANAGER: HOST + '/bluehouse/manager',
  LIST: HOST + '/bluehouse/api/list',
  ADD: HOST + '/bluehouse/api/add',
  UPDATE_NAME: HOST + '/bluehouse/api/update/name',
  UPDATE_MSG: HOST + '/bluehouse/api/update/msg',
  UPDATE_TAGS: HOST + '/bluehouse/api/update/tags',
  REMOVE: HOST + '/bluehouse/api/remove',
  TEST: HOST + '/bluehouse/api/test',
  REVERT: HOST + '/bluehouse/api/revert',
  COMMIT: HOST + '/bluehouse/api/commit',
}
