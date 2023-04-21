const MongoClient = require('mongodb').MongoClient;
const config = require('./config/db')

exports.createIndexes = () => {
  // Create a new MongoClient
  const client = new MongoClient(config.db);

  // Use connect method to connect to the server
  client.connect(function (err) {
    console.log("Successfully connected to the server!");

    const db = client.db(config.dbName);

    // Create indexes
    db.collection('patients').createIndex({ name: 'text', phone: 'text', email: 'text', patientID: 'text' }, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("Patient Indexes Created Successfully!");
      }

      client.close();
    });

    db.collection('appointments').createIndex({
      doctor: 'text',
      phone: 'text'
    }, function (err, result) {
      if (err) {
        console.log(err)
      } else {
        console.log("Appointment Indexes Created Successfully!")
      }
    })

    db.collection('brands').createIndex({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) {
        console.log(err)
      } else {
        console.log('Brand Indexes Created Successfully!')
      }
    })

    db.collection('treatmentlists').createIndex({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Treatment List Indexes Created Successfully!') }
    })

    db.collection('currencies').createIndex({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Currency Indexes Created Successfully!') }
    })
    
    db.collection('medicineitems').createIndex({
      code: 'text',
      medicineItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('medicineItems Indexes Created Successfully!') }
    })

    db.collection('accessoryitems').createIndex({
      code: 'text',
      accessoryItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Accessory Items Indexes Created Successfully!') }
    })

    db.collection('procedureitems').createIndex({
      code: 'text',
      procedureItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Procedure Items Indexes Created Successfully!') }
    })

    db.collection('procedureaccessories').createIndex({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Procedure Accessories Indexes Created Successfully!') }
    })

    db.collection('proceduremedicines').createIndex({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Procedure Medicine Indexes Created Successfully!') }
    })

    db.collection('medicinelists').createIndex({
      code: 'text',
      procedureItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Medicine Lists Indexes Created Successfully!') }
    })

    db.collection('treatments').createIndex({
      treatmentCode: 'text',
      treatmentName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Treatment Indexes Created Successfully!') }
    })

  });
}

