const {
  validationResult,
  body,
  check,
  header,
  checkSchema,
} = require("express-validator/check");

exports.authorization = [
  header("Cookie")
    .exists()
    .withMessage("Cookie header missing, please login"),
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

exports.createMessage = [
  body("location.coordinates")
    .isArray()
    .custom((value) => value.length === 2)
    .withMessage("location should be an array with two elements"),
  check("title").exists().withMessage("title cant be empty"),
  check("body").exists().withMessage("body cant be empty"),
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
