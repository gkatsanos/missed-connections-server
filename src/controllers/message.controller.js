const Message = require('../models/message.model');

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const messages = await Message.paginate({}, { page: req.params.pageNum, limit: 10 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};
