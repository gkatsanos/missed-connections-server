const httpStatus = require("http-status");
const moment = require("moment-timezone");
const nodemailer = require("nodemailer");
const Boom = require("boom");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const { jwtExpirationInterval } = require("../config/vars");
const { env } = require("../config/vars");

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = "Bearer";
  const { refreshToken } = RefreshToken.generate(user);
  const expiresIn = moment().add(jwtExpirationInterval, "minutes");
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Sends validation email
 * @private
 */
function sendValidationEmail(activationId, user) {
  nodemailer.createTestAccount(() => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "mqv23wg64gvpwgmf@ethereal.email",
        pass: "vzRdPkTdwNFxm6wBG1",
      },
    });

    const receiverMail =
      env === "development" ? "crsej42ei5wvs3m2@ethereal.email" : user.email;
    // setup email data with unicode symbols
    const mailOptions = {
      from: '"Boilerplate Email Validation Service" <noreply@boilerplate.com>', // sender address
      to: receiverMail, // list of receivers
      subject: `${user.firstName} ${user.lastName}'s Validation`, // Subject line
      html: `Hey ${user.firstName} ${user.lastName} <a href="${process.env.BASE_URI}/auth/${activationId}">click this</a> to activate ${user.email}`, // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent: %s", info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
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
    const user = new User(req.body);
    const userTransformed = user.transform();
    user.activationId = uuidv4();
    sendValidationEmail(user.activationId, user);
    await user.save();
    res.status(httpStatus.CREATED);
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
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    res.cookie('accessToken', accessToken, { secure: false, httpOnly: true, maxAge: 900000 });
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
    const refreshObject = await RefreshToken.findOneAndDelete({
      email,
      refreshToken,
    });
    if (refreshObject) {
      const { user, accessToken } = await User.findAndGenerateToken({
        email,
        refreshObject,
      });
      const response = generateTokenResponse(user, accessToken);
      return res.json(response);
    }
    const err = Boom.unauthorized("refreshToken expired");
    return next(err, req, res, next);
  } catch (err) {
    return next(err, req, res, next);
  }
};

/**
 * Email verification of account, flags user as active and sends them a token
 * @public
 */
exports.verify = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        activationId: req.params.activationId,
      },
      { active: true }
    );
    const token = generateTokenResponse(user, user.token());
    user.tokens.push({ kind: "jwt", token });
    if (user) {
      const userTransformed = user.transform();
      return res.json({
        token: user.tokens[0].token,
        user: userTransformed,
      });
    }
    return next();
  } catch (err) {
    return next(err);
  }
};
