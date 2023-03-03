const path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'production';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'Cherry-K',
    },
    db: 'mongodb://127.0.0.1:3221',
    
  },

  production: {
    root: rootPath,
    app: {
      name: 'Cherry-K',
    },
    db: 'mongodb://127.0.0.1:3221',
  },
};

module.exports = config[env];
