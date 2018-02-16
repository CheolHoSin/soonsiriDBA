function setJWT(token) {
  document.cookie = 'token=' + token
}

function getJWT() {
  const cookie = document.cookie.split(';')
  const end=cookie.length
  let searched = -1

  for(let i=0; i<end; i++) {
    searched = cookie[i].indexOf('token=')
    if (searched != -1) {
      return cookie[i].slice(searched+4)
    }
  }
  return ''
}

/* if arr1 contains arr2, returns true. Or returns false */
function arrContains(arr1, arr2) {
  if(arr1.length < arr2.length) return false
  let i=0, end=arr2.length
  for(; i<end; i++) {
    if(!arr1.includes(arr2[i])) return false
  }
  return true
}

/* if arr1 not contains arr2, returns true. or Returns false */
function arrNotContains(arr1, arr2) {
  if (arr1.length < arr2.length) return false
  let elm, end=arr2.length
  for (elm of arr2) {
    if (arr1.includes(elm)) return false
  }
  return true
}

/* remove element from array */
function removeElement(arr, idx) {
  let newArr = []
  return newArr.concat(arr.slice(0, idx), arr.slice(idx+1))
}

/* insert element into array */
function insertElement(arr, idx, data) {
  let newArr = []
  return newArr.concat(arr.slice(0, idx), [data], arr.slice(idx))
}

// utility functions
/* use fetch api with json */
function jsonFetch(uri, opts) {
  return new Promise((resolve, reject) => {
    let response
    fetch(uri, opts)
    .then((res) => {
      response = res
      res.json().
      then((resJson) => {
        resolve({response: response, json: resJson})
      })
    })
    .catch((err) => { reject(err)} )
  })
}
