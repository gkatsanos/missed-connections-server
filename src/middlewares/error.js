const Boom = require("boom");
const { env } = require("../config/vars");

module.exports = {
  /**
   * Error responder. Send stacktrace only during development
   * @public
   */
  responder: (err, req, res) => {
    res.status(err.output.payload.statusCode);
    const formattedResponse = { errors: err && err.data && err.data.message || [err.output.payload] };
    res.json(formattedResponse);
  },

  /**
   * If error is not a Boom error, convert it.
   * @public
   */
  converter: (err, req, res, next) => {
    if (env !== "development") {
      delete err.stack;
    }
    if (env !== "development" && err.isBoom) {
      delete err.output.payload.stack;
    }
    if (err.isBoom) {
      return module.exports.responder(err, req, res);
    }
    if (err.name === "MongoError" && err.code === 11000) {
      const boomedError = Boom.conflict("This email already exists");
      boomedError.output.payload.stack = err ? err.stack : undefined;
      return module.exports.responder(boomedError, req, res);
    }
    const boomedError = new Boom("Validation failed", {
      statusCode: err && err[0] && err[0].statusCode || 422,
      data: err,
    });
    return module.exports.responder(boomedError, req, res);
  },

  /**
   * Catch 404 and forward to error responder
   * @public
   */
  notFound: (req, res) => {
    const err = Boom.notFound("Not Found");
    return module.exports.responder(err, req, res);
  },
};
