const { validationResult, header } = require('express-validator/check');

exports.message = [
  header('Authorization').exists().withMessage('Authorization header missing, please login'),
  (req, res, next) => {
    const errorFormatter = ({ msg, param }) => ({
      statusCode: 401,
      field: param,
      message: msg,
    });
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      const mapped = result.array();
      return next(mapped, req, res, next);
    }
    return next();
  },
];
