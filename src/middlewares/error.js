const boom = require('boom');
const { env } = require('../config/vars');

module.exports = {
  /**
   * Error responder. Send stacktrace only during development
   * @public
   */
  responder: (err, req, res, next) => {
    res.status(err.output.payload.statusCode);
    res.json(err.output.payload);
  },

  /**
   * If error is not a Boom error, convert it.
   * @public
   */
  converter: (err, req, res, next) => {
    if (env !== 'development') {
      delete err.stack;
      delete err.output.payload.stack;
    }
    if (err.isBoom) {
      return module.exports.responder(err, req, res);
    }
    if (err.name === 'MongoError' && err.code === 11000) {
      const boomedError = boom.conflict('This email already exists');
      boomedError.output.payload.stack = err ? err.stack : undefined;
      return module.exports.responder(boomedError, req, res);
    }
    const boomedError = boom.boomify(err, { statusCode: 422 });
    return module.exports.responder(boomedError, req, res);
  },

  /**
   * Catch 404 and forward to error responder
   * @public
   */
  notFound: (req, res) => {
    const err = boom.notFound('Not Found');
    return module.exports.responder(err, req, res);
  },
};
