const httpStatus = require('http-status');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
const uuidv1 = require('uuid/v1');
const { validationResult } = require('express-validator/check');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { jwtExpirationInterval } = require('../config/vars');

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return { tokenType, accessToken, refreshToken, expiresIn };
}

/**
 * Sends validation email
 * @private
 */
function sendValidationEmail(activationId) {
  nodemailer.createTestAccount(() => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'mqv23wg64gvpwgmf@ethereal.email',
        pass: 'vzRdPkTdwNFxm6wBG1'
      }
    });

    // setup email data with unicode symbols
    const mailOptions = {
      from: '"Fred Foo 👻" <foo@blurdybloop.com>', // sender address
      to: 'crsej42ei5wvs3m2@ethereal.email', // list of receivers
      subject: 'Validation', // Subject line
      html: `<a href="${process.env.CLIENT_URI}auth/${activationId}">click this</a>`, // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      return true;
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
  });
}

/**
 * Creates inactive user and sends
 * verification email if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
  try {
    validationResult(req).throw();
    const user = new User(req.body);
    const token = generateTokenResponse(user, user.token());
    const userTransformed = user.transform();
    user.tokens.push({ kind: 'jwt', token });
    user.activationId = uuidv1();
    await user.save();
    res.status(httpStatus.CREATED);
    sendValidationEmail(user.activationId);
    return res.json({ user: userTransformed });
  } catch (err) {
    return next(err, req, res, next);
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    validationResult(req).throw();
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (err) {
    return next(err, req, res, next);
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken,
    });
    const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};


/**
 * Sets user to activen and log them in if valid token is provided
 * @public
 */
exports.verify = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate({
      activationId: req.params.activationId,
    }, { active: true });
    if (user) {
      const userTransformed = user.transform();
      return res.json(
        {
          token: user.tokens[0].token,
          user: userTransformed,
        },
      );
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
