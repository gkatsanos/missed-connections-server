const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('../../index');
const User = require('../../models/user.model');
const RefreshToken = require('../../models/refreshToken.model');

const sandbox = sinon.createSandbox();

describe('Authentication API', () => {
  let user;
  let persistentUser;
  let refreshToken;

  beforeEach(async () => {
    persistentUser = {
      email: 'gkatsanos@gmail.com',
      password: 'qwer',
      firstName: 'Georgios',
      lastName: 'Katsanos',
    };

    user = {
      email: 'sousa.dfs@gmail.com',
      password: '123456',
      firstName: 'Daniel',
      lastName: 'Whatever',
    };

    refreshToken = {
      token: '5947397b323ae82d8c3a333b.c69d0435e62c9f4953af912442a3d064e20291f0d228c0552ed4be473e7d191ba40b18c2c47e8b9d',
      userId: '5947397b323ae82d8c3a333b',
      userEmail: user.email,
      expires: new Date(),
    };

    await User.remove({});
    await User.create(persistentUser);
    await RefreshToken.remove({});
  });

  afterEach(() => sandbox.restore());

  describe('POST /auth/register', () => {
    it('should register a new user when request is ok', () => {
      return request(app)
        .post('/auth/register')
        .send(user)
        .expect(httpStatus.CREATED)
        .then((res) => {
          delete user.password;
          expect(res.body.user).to.include(user);
        });
    });

    it('should report error when email already exists', () => {
      return request(app)
        .post('/auth/register')
        .send(persistentUser)
        .expect(httpStatus.CONFLICT)
        .then((res) => {
          expect(res.body.errors[0].statusCode).to.equal(409);
        });
    });

    it('should report error when email and password are not provided', () => {
      return request(app)
        .post('/auth/register')
        .send({})
        .expect(httpStatus.UNPROCESSABLE_ENTITY)
        .then((res) => {
          expect(res.body.errors[0].statusCode).to.equal(422);
          expect(res.body.errors[1].statusCode).to.equal(422);
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should return an accessToken and a refreshToken when email and password matches', () => {
      return request(app)
        .post('/auth/login')
        .send(persistentUser)
        .expect(httpStatus.OK)
        .then((res) => {
          delete persistentUser.password;
          expect(res.body.token).to.have.a.property('accessToken');
          expect(res.body.token).to.have.a.property('refreshToken');
          expect(res.body.token).to.have.a.property('expiresIn');
          expect(res.body.user).to.include(persistentUser);
        });
    });

    it('should report error when email and password are not provided', () => {
      return request(app)
        .post('/auth/login')
        .send({})
        .expect(httpStatus.UNPROCESSABLE_ENTITY)
        .then((res) => {
          expect(res.body.errors[0].statusCode).to.equal(422);
          expect(res.body.errors[1].statusCode).to.equal(422);
        });
    });

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

    it('should report error when email and password dont match', () => {
      return request(app)
        .post('/auth/login')
        .send(user)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.errors[0].statusCode).to.equal(401);
        });
    });
  });
});
