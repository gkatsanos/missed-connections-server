const { validationResult, check } = require('express-validator/check');

exports.auth = [
  check('email').isEmail().withMessage('must be a valid email'),
  check('password').isLength({ min: 4 }).withMessage('passwd 4 chars long!'),
  (req, res, next) => {
    const errorFormatter = ({ msg, param }) => ({
      statusCode: 422,
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
