const mongoose = require('mongoose')
const foodSchema = require('./scheme/food')

module.exports = mongoose.model('food', foodSchema)
