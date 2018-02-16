const mongoose = require('mongoose')

const arrUtil = require('../utils/arrayUtil')
const nullChecker = require('../utils/nullChecker')

const foods = [
  {name: "삼겹살", tags: ['soju', 'beer', 'alcohol', 'dinner'], msg: '삼겹살에 쐬주, 캬!'},
  {name: "소고기구이", tags: ['soju', 'beer', 'alcohol', 'dinner', 'expenssive'], msg: 'yura야 재용이가 소고기 보냈다'},
  {name: "양고기구이", tags: ['soju', 'beer', 'alcohol', 'dinner', 'night'], msg: 'yura야 재용이가 양고기 보냈다'},
  {name: "양꼬치", tags: ['beer', 'alcohol', 'dinner', 'night'], msg: '양꼬치엔 칭따오'},
  {name: "스시뷔페", tags: ["lunch", 'dinner'], msg: '스시뷔페 가서 배터지게 먹자'},
  {name: "치킨", tags: ['beer', 'alcohol', 'dinner', "lunch"], msg: '치맥은 진리지'},
  {name: "햄버거", tags: ["lunch", 'dinner', 'cheap'], msg: '아 몰랑 걍 햄버거나 먹으러 가자'},
  {name: "피자", tags: ["makgeolli", 'beer', "lunch", 'dinner', 'alcohol'], msg: '피막은 진리지'},
  {name: "떡볶이", tags: ["lunch", 'dinner', 'cheap'], msg: '엽떡 가즈아아ㅏㅏㅏ'},
  {name: "김밥", tags: ["lunch", 'dinner', 'cheap'], msg: '김밥 먹고 천국가세요'},
  {name: "도시락", tags: ["lunch", 'dinner', 'cheap'], msg: '도시락 ㄱㄱ'},
  {name: "짜장면", tags: ["lunch", 'dinner', 'cheap'], msg: '아 제발...'}
]

const newFood = {
  name: "땅콩",
  tags: ['soju', 'beer', 'alcohol', 'lunch', 'dinner', 'night', 'cheap'],
  msg: '너 고소'
}

const notFood = {
  name: "캐비어",
  tags: ['soju', 'alcohol', 'lunch', 'expenssive'],
  msg: '복권 당첨했냐'
}

const dummyFilter = (tags, excepts) => {
  let _includes = [], _excepts = []
  if (!nullChecker.isNullArray(tags)) _includes = tags
  if (!nullChecker.isNullArray(excepts)) _excepts = excepts
  return foods.filter((elm) => {
    return arrUtil.contains(elm.tags, _includes) && arrUtil.notContains(elm.tags, _excepts)
  })
}

exports.getDummies = () => foods.slice()
exports.getTaggedDummies = dummyFilter
exports.getDummy = (idx) => Object.assign({}, foods[idx])
exports.getNew = () => Object.assign({}, newFood)
exports.getNot = () => Object.assign({}, notFood)
