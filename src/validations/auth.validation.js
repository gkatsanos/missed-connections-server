const { check } = require('express-validator/check');

exports.register = [
  check('email').isEmail().withMessage('must be a valid email'),
  check('password').isLength({ min: 4 }).withMessage('passwd 4 chars long!'),
];

exports.login = [
  check('email').isEmail().withMessage('must be a valid email'),
  check('password').isLength({ min: 4 }).withMessage('passwd 4 chars long!'),
];
