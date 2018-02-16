// constant

/* tags */
const TAGS = [
  'lunch', 'dinner', 'night', 'soju', 'beer', 'makgeolli', 'alcohol', 'cheap', 'expenssive'
]

// components

/* foods component */
var foodsComponent = {
  props: ['foods', 'componentDisabled'],
  data: function() {
    return {
      newName: '',
      newMsg: '',
      newTags: []
    }
  },
  template: '\
  <table class="ysm-foods-table">\
    <tr>\
      <th class="ysm-foods-theader1">이름</th>\
      <th class="ysm-foods-theader2">메세지</th>\
      <th class="ysm-foods-theader3">태그</th>\
      <th class="ysm-foods-theader4">삭제</th>\
    </tr>\
    <tr v-for="food in foods" v-bind:key="food.idx">\
      <td class="ysm-foods-tcol1">\
        <input type="text" class="ysm-foods-textinput"\
         v-bind:value="food.name" v-bind:disabled="componentDisabled"\
         v-on:change="onModifyName(food.idx, $event.target.value, $event.target)">\
        </input>\
      </td>\
      <td class="ysm-foods-tcol2">\
        <input type="text" class="ysm-foods-textinput"\
          v-bind:value="food.msg" v-bind:disabled="componentDisabled"\
          v-on:change="onModifyMsg(food.idx, $event.target.value, $event.target)">\
        </input></td>\
      <td class="ysm-foods-tcol3">\
        <button v-for="tag in TAGS" v-bind:key="tag"\
          v-bind:class="food.tags.includes(tag) ? \'ysm-button\' : \'ysm-button-disabled\'"\
          v-bind:disabled="componentDisabled"\
          v-on:click="onClickTag(food.idx, tag)">\
          {{ tag }}\
        </button>\
      </td>\
      <td class="ysm-foods-tcol4">\
        <button class="ysm-button"\
          v-bind:disabled="componentDisabled" v-on:click="onClickDelete(food.idx)">\
          삭제\
        </button>\
      </td>\
    </tr>\
    <tr>\
      <td class="ysm-foods-tcol1">\
        <input type="text" class="ysm-foods-textinput"\
          v-bind:disabled="componentDisabled"\
          v-on:input="onChangeNewName($event.target.value)"/>\
      </td>\
      <td class="ysm-foods-tcol2">\
        <input type="text" class="ysm-foods-textinput"\
          v-bind:disabled="componentDisabled"\
          v-on:input="onChangeNewMsg($event.target.value)" />\
      </td>\
      <td class="ysm-foods-tcol3">\
        <button v-for="tag in TAGS" v-bind:key="tag"\
          v-bind:class="newTags.includes(tag) ? \'ysm-button\' : \'ysm-button-disabled\'"\
          v-bind:disabled="componentDisabled"\
          v-on:click="onChangeNewTags(tag)">\
          {{ tag }}\
        </button>\
      </td>\
      <td class="ysm-foods-tcol4">\
        <button class="ysm-button"\
          v-bind:disabled="componentDisabled" v-on:click="onClickCreate">\
          추가\
        </button>\
      </td>\
    </tr>\
  </table>',
  methods: {
    onClickTag: function(idx, tag) {
      this.$emit('clicktag', {idx: idx, tag: tag})
    },
    onModifyName: function(idx, name, target) {
      this.$emit('modifyname', {idx: idx, name: name, target: target})
    },
    onModifyMsg: function(idx, msg, target) {
      this.$emit('modifymsg', {idx: idx, msg: msg, target: target})
    },
    onClickDelete: function(idx) {
      this.$emit('clickdelete', {idx: idx})
    },
    onChangeNewName: function(name) {
      this.newName = name
    },
    onChangeNewMsg: function(msg) {
      this.newMsg = msg
    },
    onChangeNewTags: function(tag) {
      let tagIdx = this.newTags.indexOf(tag)

      if (tagIdx == -1) {
        this.newTags = insertElement(this.newTags, 0, tag)
      } else {
        this.newTags = removeElement(this.newTags, tagIdx)
      }
    },
    onClickCreate: function() {
      this.$emit('clickcreate', {name: this.newName, msg: this.newMsg, tags: this.newTags})
    }
  }
}

/* filter buttons */
var filterGroup = {
  props: ['componentDisabled', 'filter', 'buttonClass'],
  template: '\
  <div class="ysm-foods-buttongroup">\
    <div>\
      <button v-for="tag in TAGS" v-bind:key="tag"\
        v-bind:disabled="componentDisabled"\
        v-bind:class="filter.includes(tag) ? buttonClass : \'ysm-button-disabled\'"\
        v-on:click="onClickTag(tag)">\
        {{ tag }}\
      </button>\
    </div>\
  </div>\
  ',
  methods: {
    onClickTag: function(tag) {
      this.$emit('clicktag', {tag: tag})
    }
  }
}

/* test soonsiri */
var testComponent = {
  props: ['componentDisabled', 'result'],
  template: '\
  <div>\
    <button class="ysm-button" v-on:click="onClickTest" v-bind:disabled="componentDisabled">soonsiri</button>\
    결과: {{ result }}\
  </div>\
  ',
  methods: {
    onClickTest: function() {
      this.$emit('clicktest')
    }
  }
}

// Vue
var app = new Vue({
  el: '#app',
  components: {
    'foods-component': foodsComponent,
    'filter-group': filterGroup,
    'test-component': testComponent
  },
  data: {
    foods: [],
    tags: [],
    excepts: [],
    componentDisabled: false,
    result: '버튼을 눌러 테스트하세요'
  },
  computed: {
    filteredFoods: function() {
      const tags = this.tags
      const excepts = this.excepts
      return this.foods.filter(function (food) {
        return arrContains(food.tags, tags) && arrNotContains(food.tags, excepts)
      })
    }
  },
  methods: {
    onClickTag: function(value) {
      this.componentDisabled = true
      let idx = value.idx, tag = value.tag
      let originalTags = this.foods[idx].tags
      let tagIdx = originalTags.indexOf(tag)

      let newTags = []

      if (tagIdx == -1) {
        newTags = insertElement(originalTags, 0, tag)
      } else {
        if (originalTags.length <= 1) { // tags cannot blank array
          this.componentDisabled = false
          alert(ERROR_STR['blank_tags'])
          return
        }
        newTags = removeElement(originalTags, tagIdx)
      }

      restApi.put(URIS.UPDATE_TAGS, {"name": this.foods[idx].name, "tags": newTags})
      .then(onResponse)
      .then((res) => {
        if (res.response.status == 200) {  // success
          this.foods[idx] = Object.assign(this.foods[idx], {tags: newTags})
        } else {  // fail
          alert(ERROR_STR[res.json.error.msg])
        }
        this.componentDisabled = false
      })
      .catch((err) => { // unknown error occurs
        alert(ERROR_STR['unknown'])
        this.componentDisabled = false
      })
    },
    onModifyName: function(value) {
      this.componentDisabled = true
      let idx = value.idx, name = value.name

      if (name == '' || name == undefined || name == null) {  // name is required
        value.target.value = this.foods[idx].name
        this.componentDisabled = false
        alert(ERROR_STR['required'])
        return
      }

      if (findFoodByName(this.foods, name) != -1) { // name cannot be duplicated
        value.target.value = this.foods[idx].name
        this.componentDisabled = false
        alert(ERROR_STR['duplicated'])
        return
      }

      restApi.put(URIS.UPDATE_NAME, {"oldName": this.foods[idx].name, "newName": name})
      .then(onResponse)
      .then((res) => {
        if (res.response.status == 200) {
          this.foods[idx] = Object.assign(this.foods[idx], {name: name})
          this.foods = assignIdx(sortFoodsByName(this.foods))
        } else {
          alert(ERROR_STR[res.json.error.msg])
        }
        this.componentDisabled = false
      })
      .catch((err) => { // unknown error occurs
        alert(ERROR_STR['unknown'])
        this.componentDisabled = false
      })

    },
    onModifyMsg: function(value) {
      this.componentDisabled = true
      let idx = value.idx, msg = value.msg

      if (msg == '' || msg == undefined || msg == null) { // msg is required
        value.target.value = this.foods[idx].msg
        this.componentDisabled = false
        alert(ERROR_STR['required'])
        return
      }

      restApi.put(URIS.UPDATE_MSG, {"name": this.foods[idx].name, "msg": msg})
      .then(onResponse)
      .then((res) => {
        if (res.response.status == 200) {
          this.foods[idx] = Object.assign(this.foods[idx], {msg: msg})
        } else {
          alert(ERROR_STR[res.json.error.msg])
        }
        this.componentDisabled = false
      })
      .catch((err) => { // unknown error occurs
        alert(ERROR_STR['unknown'])
        this.componentDisabled = false
      })
    },
    onClickDelete: function(value) {
      this.componentDisabled = true
      let idx = value.idx

      restApi.delete(URIS.REMOVE, {"name": this.foods[idx].name})
      .then(onResponse)
      .then((res) => {
        if (res.response.status == 200) {
          this.foods = assignIdx(removeElement(this.foods, idx))
        } else {
          alert(ERROR_STR[res.json.error.msg])
        }
        this.componentDisabled = false
      })
      .catch((err) => { // unknown error occurs
        alert(ERROR_STR['unknown'])
        this.componentDisabled = false
      })
    },
    onClickCreate: function(value) {
      let name = value.name
      let msg = value.msg
      let tags = value.tags

      this.componentDisabled = true

      if (name == '' || name == undefined || name == null ||
          msg == '' || msg == undefined || msg == null ||
          tags == '' || tags == undefined || tags === []) { // all is required
        this.componentDisabled = false
        alert(ERROR_STR['required'])
        return
      }

      if (findFoodByName(this.foods, name) != -1) { // name cannot be duplicated
        this.componentDisabled = false
        alert(ERROR_STR['duplicated'])
        return
      }

      restApi.post(URIS.ADD, {"name": name, "msg": msg, "tags": tags})
      .then(onResponse)
      .then((res) => {
        if (res.response.status == 201) {
          this.foods = assignIdx(
            sortFoodsByName(
              insertElement(this.foods, 0, {name: name, msg: msg, tags: tags})
            )
          )
        } else {
          alert(ERROR_STR[res.json.error.msg])
        }
        this.componentDisabled = false
      })
      .catch((err) => {
        alert(ERROR_STR['unknown'])
        this.componentDisabled = false
      })
    },
    test: function() {
      this.componentDisabled = true

      let status = 0

      let tags = this.tags.map((elm) => '+'+elm).join('&')
      let excepts = this.excepts.map((elm) => '-'+elm).join('&')
      let queryStr =''

      let include = (tags != '')
      let except = (excepts != '')

      if (include) {
        if (except) queryStr = tags + '&' + excepts
        else queryStr = tags
      } else {
        if (except) queryStr = excepts
        else queryStr = ''
      }

      restApi.get(URIS.TEST + '/' + queryStr)
      .then(onResponse)
      .then((res) => {
        if (res.response.status == 200) this.result = res.json.food.name
        else this.result = ERROR_STR[res.json.error.msg]
        this.componentDisabled = false
      })
      .catch((err) => {
        this.result = ERROR_STR['unknown']
        this.componentDisabled = false
      })
    },
    changeFilter: function(value) { // not asynchronous function...
      tag = value.tag

      let tagIdx = this.tags.indexOf(tag)
      if (tagIdx == -1) {
        this.tags = insertElement(this.tags, 0, tag)
      } else {
        this.tags = removeElement(this.tags, tagIdx)
      }
    },
    changeExcepts: function(value) {
      tag = value.tag

      let tagIdx = this.excepts.indexOf(tag)
      if (tagIdx == -1) {
        this.excepts = insertElement(this.excepts, 0, tag)
      } else {
        this.excepts = removeElement(this.excepts, tagIdx)
      }
    },
    commit: function() {
      this.componentDisabled = true
      let ok = confirm('작업 내역을 DB 에 반영합니까?')
      if (ok) {
        restApi.put(URIS.COMMIT)
        .then(onResponse)
        .then((res) => {
          if (res.response.status == 200) alert('반영했습니다')
          else alert(ERROR_STR[res.json.error.msg])
          this.componentDisabled = false
        })
      } else {
        this.componentDisabled = false
      }
    },
    revert: function() {
      this.componentDisabled = true
      let ok = confirm('작업 내역을 초기화합니까?')
      if (ok) {
        restApi.put(URIS.REVERT)
        .then(onResponse)
        .then((res) => {
          if (res.response.status == 200) {
            this.foods = assignIdx(sortFoodsByName(res.json.foods))
            alert('초기화했습니다.')
          } else {
            alert(ERROR_STR[res.json.error.msg])
          }
          this.componentDisabled = false
        })
      } else {
        this.componentDisabled = false
      }
    }
  }
})

// functions

/* sort foods using by name :asc*/
function sortFoodsByName(foods) {
  return foods.sort((a, b) => {
    if (a.name < b.name) return -1
    else if (a.name > b.name) return 1
    else return 0
  })
}

/* find food's idx using by name */
function findFoodByName(foods, name) {
  let end = foods.length
  for (let i=0; i<end; i++) {
    if (foods[i].name == name) return i
  }
  return -1
}

/* assign idx into foods and returns new foods*/
function assignIdx(arr) {
  return arr.map((elm, idx) => {
    return {
      idx: idx,
      name: elm.name,
      msg: elm.msg,
      tags: elm.tags
    }
  })
}

/* load food list */
function loadList(tags) {
  restApi.get(URIS.LIST + '/' + tags.join('&'))
  .then((res) => onResponse(res))
  .then((res) => {
    if (res.response.status == 200) {
      app.foods = assignIdx(res.json.foods)
    } else {
      alert(ERROR_STR[res.json.error.msg])
    }
    app.componentDisabled = false
  })
  .catch((err) => {
    app.componentDisabled = false
  })
}


// fetch response
function onResponse(result) {
  return new Promise((resolve, reject) => {
    // refreshing token
    let token = result.response.headers.get('x-issued-token')
    if (token != '' && token != undefined && token != null) {
      setJWT(token)
    }

    resolve(result)
  })
}

/* use fetch api with json */
const restApi = {
  get: (uri) => {
    return jsonFetch(uri, {
      method: 'GET',
      mode: 'cors',
      credentials: 'same-origin',
      headers: new Headers()
    })
  },
  post: (uri, data) => {
    return jsonFetch(uri, {
      method: 'post',
      credentials: 'same-origin',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(data),
    })
  },
  put: (uri, data) => {
    return jsonFetch(uri, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(data)
    })
  },
  delete: (uri, data) => {
    return jsonFetch(uri, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(data)
    })
  }
}


// initialize list when it loads first
loadList([])
