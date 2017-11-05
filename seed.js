const MongoClient = require('mongodb').MongoClient;
const faker = require('faker');
const { mongo } = require('./src/config/vars');

// TODO find a way to bind id and name or just stick with ID

const prepareData = () => {
  const seedData = [];
  for (let i = 0; i <= 10; i += 1) {
    seedData.push({
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(faker.address.longitude()),
          parseFloat(faker.address.latitude()),
        ],
      },
      category: {
        id: faker.random.number({ min: 1, max: 10 }),
      },
      age: faker.random.number({ min: 10, max: 100 }),
      yourSex: faker.random.number({ min: 1, max: 3 }),
      mySex: faker.random.number({ min: 1, max: 3 }),
      username: faker.internet.userName(),
      body: faker.lorem.words(10),
    });
    console.clear();
    console.log(`Created ${i} items`);
  }
  return seedData;
};

const insertDocuments = (db, callback) => {
  db.collection('messages').insertMany(prepareData());
  callback();
};

MongoClient.connect(mongo.uri, (err, db) => {
  db.collection('messages').deleteMany({}, () => {
    db.close();
  });
  db.collection('messages').createIndex({ location: '2dsphere' });
  insertDocuments(db, () => {
    db.close();
  });
  console.log('Seeding complete.');
});
