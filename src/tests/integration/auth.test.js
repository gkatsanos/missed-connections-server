const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const uuidv1 = require('uuid/v1');
const app = require('../../index');
const User = require('../../models/user.model');
const RefreshToken = require('../../models/refreshToken.model');

describe('Authentication', () => {
  let user;
  let persistentUser;
  const activationId = uuidv1();
  // @TODO implement test to check what happens when token expires
  // let refreshToken;

  beforeEach(async () => {
    persistentUser = {
      email: 'persistent@user.com',
      password: '123456',
      firstName: 'Persistent',
      lastName: 'User',
      active: true,
    };

    user = {
      email: 'temporary@user.com',
      password: '123456',
      firstName: 'Temporary',
      lastName: 'User',
      activationId,
    };

    // @TODO implement test to check what happens when logging with expired token
    // refreshToken = {
    //   token: '',
    //   userId: '',
    //   userEmail: user.email,
    //   expires: new Date(),
    // };

    await User.remove({});
    await User.create(persistentUser);
    await RefreshToken.remove({});
  });

  after(async () => {
    await User.remove({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user when request is ok', () => request(app)
      .post('/auth/register')
      .send(user)
      .expect(httpStatus.CREATED)
      .then((res) => {
        delete user.password;
        delete user.activationId;
        expect(res.body.user).to.include(user);
      }));

    it('should report error when email already exists', () => request(app)
      .post('/auth/register')
      .send(persistentUser)
      .expect(httpStatus.CONFLICT)
      .then((res) => {
        expect(res.body.errors[0].statusCode).to.equal(409);
      }));

    it('should report error when email and password are not provided', () => request(app)
      .post('/auth/register')
      .send({})
      .expect(httpStatus.UNPROCESSABLE_ENTITY)
      .then((res) => {
        expect(res.body.errors[0].statusCode).to.equal(422);
        expect(res.body.errors[1].statusCode).to.equal(422);
      }));
  });

  describe('POST /auth/login', () => {
    it('should return an error when trying to login from an unverified account', () => request(app).post('/auth/register').send(user)
      .then(() => request(app).post('/auth/login').send(user)
        .then((res) => {
          expect(httpStatus.UNAUTHORIZED);
          expect(res.body.errors[0].statusCode).to.equal(401);
        })));

    it('should return an accessToken and a refreshToken when email and password matches and account is active', () => request(app)
      .post('/auth/login')
      .send(persistentUser)
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.token).to.have.a.property('accessToken');
        expect(res.body.token).to.have.a.property('refreshToken');
        expect(res.body.token).to.have.a.property('expiresIn');
        delete persistentUser.password;
        delete persistentUser.active;
        expect(res.body.user).to.include(persistentUser);
      }));

    it('should report error when email and password are not provided', () => request(app)
      .post('/auth/login')
      .send({})
      .expect(httpStatus.UNPROCESSABLE_ENTITY)
      .then((res) => {
        expect(res.body.errors[0].statusCode).to.equal(422);
        expect(res.body.errors[1].statusCode).to.equal(422);
      }));

    it('should report error when the email provided is not valid', () => {
      user.email = 'this_is_not_an_email';
      return request(app)
        .post('/auth/login')
        .send(user)
        .expect(httpStatus.UNPROCESSABLE_ENTITY)
        .then((res) => {
          expect(res.body.errors[0].statusCode).to.equal(422);
        });
    });

    it('should report error when email and password dont match', () => request(app)
      .post('/auth/login')
      .send(user)
      .then((res) => {
        expect(httpStatus.UNAUTHORIZED);
        expect(res.body.errors[0].statusCode).to.equal(401);
      }));
  });

  describe('POST /auth/activationId', () => {
    it('activate an account when GETing its activation URI', () => request(app).post('/auth/register').send(user)
      .then(() => request(app).post(`/auth/${activationId}`).send(user)
        .then(() => request(app).post('/auth/login').send(user)
          .then(() => expect(httpStatus.OK)))));
  });
});
