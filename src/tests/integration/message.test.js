const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const app = require('../../index');
const Message = require('../../models/message.model');
const User = require('../../models/user.model');

describe('Get messages', () => {
  let persistentUser;
  let message;

  beforeEach(async () => {
    persistentUser = {
      email: 'persistent@user.com',
      password: '123456',
      firstName: 'Persistent',
      lastName: 'User',
      active: true,
    };

    message = {
      username: 'mitsos',
      location: {
        type: 'Point',
        coordinates: [172.711, 59.2657],
      },
      title: 'message title here!',
      body: 'This is the body text of the messsage',
    };

    await User.deleteMany({});
    await User.create(persistentUser);
    await Message.create(message);
  });

  after(async () => {
    await Message.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /message/list', () => {
    it('get a list of messages if Authentication Token is correct', () => request(app)
      .post('/auth/login')
      .send(persistentUser)
      .then(res =>
        request(app).get('/message/list').set('Authorization', `Bearer ${res.body.token.accessToken}`)
          .then((res) => {
            expect(httpStatus.OK);
            delete res.body.docs[0]._id;
            delete res.body.docs[0].__v;
            expect(res.body.docs[0]).to.be.deep.equal(message);
          })));

    it('gets unauthorized if Authentication Token is invalid', () => request(app)
      .post('/auth/login')
      .send(persistentUser)
      .then(res =>
        request(app).get('/message/list').set('Authorization', `Bearer ${res.body.token.accessToken}123`)
          .then(() => expect(httpStatus.UNAUTHORIZED))));
  });
});
