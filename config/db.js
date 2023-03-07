const path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'production';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'Cherry-K',
    },
    //db: 'mongodb://127.0.0.1:3221', 
    db: 'mongodb+srv://dbuser:P7qBNveg8bVO1d2z@cluster0.85ozwwv.mongodb.net/cherry-k?retryWrites=true&w=majority', 
    
  },

  production: {
    root: rootPath,
    app: {
      name: 'Cherry-K',
    },
    //db: 'mongodb://127.0.0.1:3221', 
    db: 'mongodb+srv://dbuser:P7qBNveg8bVO1d2z@cluster0.85ozwwv.mongodb.net/cherry-k?retryWrites=true&w=majority', 
  },
};

module.exports = config[env];
