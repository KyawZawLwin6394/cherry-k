const path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'production';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'Cherry-K',
    },
    port: 27017,
    db: 'mongodb://dbuser:se0prykWCd8YYIx9@ac-ws1mvow-shard-00-00.85ozwwv.mongodb.net:27017,ac-ws1mvow-shard-00-01.85ozwwv.mongodb.net:27017,ac-ws1mvow-shard-00-02.85ozwwv.mongodb.net:27017/?ssl=true&replicaSet=atlas-r1hi5a-shard-0&authSource=admin&retryWrites=true&w=majority',

  },

  production: {
    root: rootPath,
    app: {
      name: 'Cherry-K',
    },
    port: 27017,
    db: 'mongodb://dbuser:se0prykWCd8YYIx9@ac-ws1mvow-shard-00-00.85ozwwv.mongodb.net:27017,ac-ws1mvow-shard-00-01.85ozwwv.mongodb.net:27017,ac-ws1mvow-shard-00-02.85ozwwv.mongodb.net:27017/?ssl=true&replicaSet=atlas-r1hi5a-shard-0&authSource=admin&retryWrites=true&w=majority',
  },
};

module.exports = config[env];
