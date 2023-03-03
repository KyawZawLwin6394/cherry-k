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
    db: 'mongodb+srv://kyawzawlwin6394:XZ90J74EVci26GAd@cluster0.85ozwwv.mongodb.net/?retryWrites=true&w=majority',
  },

  production: {
    root: rootPath,
    app: {
      name: 'Cherry-K',
    },
    port: 27017,
    db: 'mongodb+srv://kyawzawlwin6394:XZ90J74EVci26GAd@cluster0.85ozwwv.mongodb.net/?retryWrites=true&w=majority',
  },
};

module.exports = config[env];

//db: 'mongodb://54.251.85.187/issue-tracking',
