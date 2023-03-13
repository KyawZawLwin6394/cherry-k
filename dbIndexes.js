const MongoClient = require('mongodb').MongoClient;
const config = require('./config/db')

// Create a new MongoClient
const client = new MongoClient(config.db);

// Use connect method to connect to the server
client.connect(function(err) {
  console.log("Connected successfully to server");

  const db = client.db(config.dbName);

  // Create indexes
  db.collection('patients').createIndex({ name: 'text', phone: 'text', email: 'text',patientID:'text' }, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Patient Indexes Created Successfully!");
    }

    client.close();
  });

  db.collection('appointments').createIndex({
    doctor:'text',
    phone:'text'
  },function(err, result) {
    if (err) {
      console.log(err)
    } else {
      console.log("Appointment Indexes Created Successfully!")
    }
  })

  db.collection('brands').createIndex({
    code:'text',
    name:'text'
  },function(err, result) {
    if (err) {
      console.log(err)
    } else {
      console.log('Brand Indexes Created Successfully!')
    }
  })

  db.collection('treatmentlists').createIndex({
    code:'text',
    name:'text'
  },function(err, result) {
    if (err) {console.log(err)} else {console.log('Treatment List Indexes Created Successfully!')}
  })
  
});