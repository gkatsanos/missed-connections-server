const passport = require('passport');
const Boom = require('boom');

const handleJWT = (req, res, next) => async (err, user, info) => {
  const error = err || info;

  if (err || !user) {
    Boom.boomify(error, { statusCode: 401, stack: error.stack});
    return next(error);
  }

  req.user = user;

  return next();
};

exports.authorize = () => (req, res, next) =>
  passport.authenticate('jwt', { session: false }, handleJWT(req, res, next))(
    req,
    res,
    next,
  );
