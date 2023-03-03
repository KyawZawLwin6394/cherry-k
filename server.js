const cors = require('cors');
const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  config = require('./config/db'),
  app = express(),
  server = require('http').Server(app),
  port = process.env.PORT || 9000;
app.use(cors({ origin: '*'}));

// mongoose instance connection url connection
if (mongoose.connection.readyState != 1) {
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db, {
    retryWrites: false,
  });

  const db = mongoose.connection;
  db.on('error', (err) => {
    console.log(err)  });

  db.once('open', function () {
    console.log('Database is connected');
  });
  module.exports = db;
}
mongoose.plugin((schema) => {
  schema.options.usePushEach = true;
});

// Bring in our dependencies
require('./config/express')(app, config);


server.listen(port, () => {
  console.log('We are live on port: ', port);
});

