const mongoose = require('mongoose')
const Schema = mongoose.Schema

const values = require('../../values')

const foodSchema = new Schema({
  name: {type: String, required: true, unique: true},
  tags: [{type: String, enum: values.foodTypes}],
  msg: {type: String, required: true}
})

foodSchema.index({name: 1})

module.exports = foodSchema
