const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const Boom = require('boom');
const { converter } = require('../middlewares/error');
const { env, jwtSecret, jwtExpirationInterval } = require('../config/vars');

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 128,
  },
  firstName: {
    type: String,
    required: true,
    maxlength: 128,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 128,
    trim: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  gender: String,
  tokens: Array,
  activationId: String,
}, {
  timestamps: true,
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
// @TODO change this to real validation
// https://stackoverflow.com/questions/13580589/mongoose-unique-validation-error-type
userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    const rounds = env === 'test' ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (err) {
    return converter(err);
  }
});

/**
 * Methods
 */
userSchema.method({
  transform() {
    const transformed = {};
    const fields = ['email', 'id', 'firstName', 'lastName', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const payload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(payload, jwtSecret);
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});

/**
 * Statics
 */
userSchema.statics = {

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, Error>}
   */
  async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;
    const user = await this.findOne({ email }).exec();
    if (!user) {
      // user doesn't exist in our DB but we don't want to give that information
      throw Boom.unauthorized('Incorrect email or password');
    }
    if (user && !user.active) {
      throw Boom.unauthorized('Inactive account');
    }
    if (refreshObject && refreshObject.userEmail === email) {
      return { user, accessToken: user.token() };
    }
    if (user && await user.passwordMatches(password)) {
      return { user, accessToken: user.token() };
    }
    throw Boom.unauthorized('Incorrect email or password');
  },

};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);
