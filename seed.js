const mongoose = require("mongoose");
const faker = require("faker");
const { mongo } = require("./src/config/vars");
const User = require("./src/models/user.model");
const Message = require("./src/models/message.model");
const random = require("lodash/random");
const bcrypt = require("bcryptjs");

const sexes = ["male", "female", "transgender", "neutral", "non-binary"];

console.log(
  `********************************
******** seeding begins ********
********************************`
);

let messagesSeedData = [];
let usersSeedData = [];

function generateMessageSeedData() {
  // const seedData = [];
  for (let i = 0; i < 20; i += 1) {
    const message_id = mongoose.Types.ObjectId();
    messagesSeedData.push({
      _id: message_id,
      location: {
        type: "Point",
        geocoded: `${faker.helpers.contextualCard().address.street}, ${
          faker.helpers.contextualCard().address.city
        }`,
        // lon/lat generated return non-realistic human addresses
        coordinates: [
          parseFloat(faker.address.longitude()),
          parseFloat(faker.address.latitude()),
        ],
      },
      seenDate: faker.date.past(),
      title: faker.lorem.words(5),
      body: faker.lorem.words(10),
    });
  }
  console.log(`Created ${messagesSeedData.length} messages`);
  return messagesSeedData;
}

async function generateUsersSeedData() {
  // const seedData = [];
  for (let i = 0; i < 20; i += 1) {
    const user_id = mongoose.Types.ObjectId();
    usersSeedData.push({
      _id: user_id,
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      active: true,
      gender: sexes[random(sexes.length - 1)], // @TODO can faker do this?
      messages_ids: [messagesSeedData[i]._id],
    });
    messagesSeedData[i].user = usersSeedData[i]._id;
  }
  const hash = await bcrypt.hash("1234", 10);
  usersSeedData.push({
    _id: mongoose.Types.ObjectId(),
    email: "gkatsanos@gmail.com",
    username: "gkatsanos",
    password: hash,
    firstName: "George",
    lastName: "Katsanos",
    active: true,
    gender: "male",
    messages_ids: [messagesSeedData[1]._id],
  });
  console.log(`Created ${usersSeedData.length} users`);
  return usersSeedData;
}

generateMessageSeedData();
generateUsersSeedData();

mongoose.set("useCreateIndex", true);
mongoose.connect(mongo.uri, {
  poolSize: 10,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

User.deleteMany({})
  .then(() => User.insertMany(usersSeedData))
  .then(() => {
    console.log("seeding users done");
    mongoose.connection.close();
    console.log(
      `********************************
******** seeding ended ********
********************************`
    );
  });

Message.deleteMany({})
  .then(() => Message.insertMany(messagesSeedData))
  .then(() => console.log("seeding messages done"));
