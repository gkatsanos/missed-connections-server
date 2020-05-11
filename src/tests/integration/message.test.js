const request = require("supertest");
const httpStatus = require("http-status");
const { expect } = require("chai");
const app = require("../../index");
const Message = require("../../models/message.model");
const User = require("../../models/user.model");

describe("Get messages", () => {
  let persistentUser;
  let persistentMessage;
  let message;
  let validAccessToken;

  before(async () => {
    persistentUser = {
      email: "persistent@user.com",
      password: "123456",
      firstName: "Persistent",
      lastName: "User",
      active: true,
    };

    await User.deleteMany({});
    await User.create(persistentUser);

    await request(app)
      .post("/auth/login")
      .send(persistentUser)
      .then((res) => {
        validAccessToken = res.body.token.accessToken;
      });
  });

  beforeEach(async () => {
    persistentMessage = {
      username: "mitsos",
      location: {
        type: "Point",
        coordinates: [172.711, 59.2657],
      },
      title: "message title here!",
      body: "This is the body text of the messsage",
    };

    message = {
      location: {
        type: "Point",
        coordinates: [172.711, 59.2657],
      },
      title: "message title here!",
      body: "This is the body text of the messsage",
    };

    await Message.create(persistentMessage);
  });

  after(async () => {
    await Message.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /message/list", () => {
    it("get a list of messages if Authentication Token is correct", () =>
      request(app)
        .get("/message/list")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .then((res) => {
          expect(httpStatus.OK);
          delete res.body.docs[0]._id;
          delete res.body.docs[0].__v;
          expect(res.body.docs[0]).to.be.deep.equal(persistentMessage);
        }));

    it("gets unauthorized if Authentication Token is invalid", () =>
      request(app)
        .get("/message/list")
        .set("Authorization", `Bearer ${validAccessToken}123`)
        .then(() => expect(httpStatus.UNAUTHORIZED)));
  });

  describe("POST /message/create", () => {
    describe("if Authentication Token is correct", () => {
      describe("and message object is valid", () => {
        it("should create a message", () =>
          request(app)
            .post("/message/create")
            .set("Authorization", `Bearer ${validAccessToken}`)
            .send(message)
            .then((res) => {
              expect(httpStatus.OK);
              expect(res.body.message).to.deep.include(message);
            }));
      });
    });
  });
});
