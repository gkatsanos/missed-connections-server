const httpStatus = require("http-status");
const Message = require("../models/message.model");

/**
 * Get messages list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const messages = await Message.paginate(
      {},
      { page: req.params.page, limit: 10, customLabels: { docs: 'items' } }
    );
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

/**
 * Create message
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const message = new Message(req.body);
    message.username = req.user.email;
    await message.save();
    res.status(httpStatus.CREATED);
    return res.json({ message });
  } catch (err) {
    return next(err, req, res, next);
  }
};
