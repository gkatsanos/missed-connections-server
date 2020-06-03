const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseHidden = require("mongoose-hidden")({
  defaultHidden: { password: true },
});

/**
 * Message Schema
 * @private
 */
const messageSchema = new mongoose.Schema({
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      default: "Point",
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

/**
 * Statics
 */
messageSchema.statics = {
  async getMessagesAndUsers(req) {
    const messages = await this.paginate(
      {},
      {
        page: req.params.page,
        limit: 10,
        customLabels: { docs: "items" },
        populate: "user",
      }
    );
    return messages;
  },
};

messageSchema.index({ location: "2dsphere" });
messageSchema.plugin(mongoosePaginate);
messageSchema.plugin(mongooseHidden);

/**
 * @typedef Message
 */
module.exports = mongoose.model("Message", messageSchema);
