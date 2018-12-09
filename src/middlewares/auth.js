const passport = require('passport');
const boom = require('boom');

const handleJWT = (req, res, next) => async (err, user, info) => {
  const error = err || info;
  const logIn = Promise.promisify(req.logIn);
  const boomedError = boom.unauthorized('Unauthorized');
  boomedError.output.payload.stack = error ? error.stack : undefined;

  try {
    if (error || !user) throw error;
    await logIn(user, { session: false });
  } catch (e) {
    return next(boomedError);
  }

  if (err || !user) {
    return next(boomedError);
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
