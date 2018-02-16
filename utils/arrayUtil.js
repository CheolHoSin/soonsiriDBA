const equals = (arr1, arr2) => {
  if(arr1.length != arr2.length) return false

  let i=0, end=arr1.length
  for(; i<end; i++) {
    if(!arr2.includes(arr1[i])) return false
  }

  return true
}

const contains = (arr1, arr2) => {
  if(arr2.length > arr1.length) return false

  let i=0, end=arr2.length
  for (; i<end; i++) {
    if(!arr1.includes(arr2[i])) return false
  }

  return true
}

const notContains = (arr1, arr2) => {
  let i=0, end=arr2.length
  for(; i<end; i++) {
    if(arr1.includes(arr2[i])) return false
  }

  return true
}

exports.equals = equals
exports.contains = contains
exports.notContains = notContains
