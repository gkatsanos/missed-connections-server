const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseHidden = require("mongoose-hidden")({
  defaultHidden: { password: true },
});
const { reverseGeocode } = require("../config/api");
const to = require("await-to-js").default;
const throttledQueue = require("throttled-queue");
const throttle = throttledQueue(1, 3000);

/**
 * Message Schema
 * @private
 */
const messageSchema = new mongoose.Schema(
  {
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
      geocoded: {
        type: String,
      },
    },
    body: {
      type: String,
      required: true,
      index: "text",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    seenDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

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

  async getMessage(req) {
    // @TODO implement get single message logic
  },
};
/*
 faker returns random lat/lon and often dont correspond
 to real life addresses so the following has to be ditched.

messageSchema.pre("insertMany", async (next, docs) => {
  let err, response;
  for (const doc of docs) {
    throttle(async function () {
      console.log(`calling API for ${doc.location.coordinates}`);
      [err, response] = await to(
        reverseGeocode(doc.location.coordinates[0], doc.location.coordinates[1])
      );
      console.log("response", response && response.data);
      console.log("error", err);
    });
    if (err) {
      console.log(err);
      return next(err);
    }
    doc.location.geocoded =
      response && response.data && response.data.display_name;
  }
});
*/

messageSchema.index({ location: "2dsphere" });
messageSchema.plugin(mongoosePaginate);
messageSchema.plugin(mongooseHidden);

/**
 * @typedef Message
 */
module.exports = mongoose.model("Message", messageSchema);
