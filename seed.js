const MongoClient = require('mongodb').MongoClient;
const faker = require('faker');
const { mongo } = require('./src/config/vars');

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
      username: faker.internet.userName(),
      title: faker.lorem.words(5),
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

MongoClient.connect(mongo.uri, { useNewUrlParser: true }, (err, client) => {
  const db = client.db('isawyou');
  db.collection('messages').deleteMany({}, () => {
    client.close();
  });
  db.collection('messages').createIndex({ location: '2dsphere' });
  insertDocuments(db, () => {
    client.close();
  });
  console.log('Seeding complete.');
});
