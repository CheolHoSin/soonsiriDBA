function isNull(value) {
  return (value == null || value == undefined || value == '')
}

function isNullArray(arr) {
  return (arr == null || arr == undefined || arr == '' || arr === [])
}

exports.isNull = isNull
exports.isNullArray = isNullArray
