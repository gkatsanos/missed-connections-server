const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

/**
 * Message Schema
 * @private
 */
const messageSchema = new mongoose.Schema({
  location: {
    type: String,
    coordinates: [Number],
  },
  category: {
    id: {
      type: Number,
    },
  },
  username: {
    type: String,
    maxlength: 128,
  },
  age: {
    type: Number,
    max: 120,
    min: 10,
  },
  yourSex: {
    type: Number,
    min: 1,
    max: 3,
  },
  mySex: {
    type: Number,
    min: 1,
    max: 3,
  },
  body: {
    type: String,
  },
});

/**
 * Statics
 */
messageSchema.statics = {
  list() {
    return this.find({})
      .exec();
  },
};

/**
 * Plugins
 */
messageSchema.plugin(mongoosePaginate);

/**
 * @typedef Message
 */
module.exports = mongoose.model('Message', messageSchema);
