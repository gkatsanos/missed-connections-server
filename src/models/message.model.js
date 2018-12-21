const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

/**
 * Message Schema
 * @private
 */
const messageSchema = new mongoose.Schema({
  username: {
    type: String,
    maxlength: 128,
  },
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
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
