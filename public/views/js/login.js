function login() {
  const form = document.getElementById('loginform')
  if (!form.reportValidity()) return
  const formStr = 'userid=' + form['userid'].value + '&password=' + form['password'].value

  let status = 0
  let issuedToken = ''

  jsonFetch(URIS.LOGIN_URI, {
    method: 'post',
    credentials: 'same-origin',
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    }),
    body: formStr
  })
  .then((res) => {
    let response = res.response
    if (response.status == 200) {
      let issuedToken = response.headers.get('x-issued-token')
      if (issuedToken == '' || issuedToken == undefined || issuedToken == null) {
        alert(ERROR_STR['not_logined'])
        return;
      }
      setJWT(issuedToken)
      location.href = URIS.MANAGER
    } else {
      alert(ERROR_STR[res.json.error.msg])
    }
  })
  .catch((err) => {
    console.log(err)
    alert(ERROR_STR['unknown'])
  })
}
