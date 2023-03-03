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
    db: 'mongodb+srv://kyawzawlwinwork6394:xyBbuhqdam1wTRHe@cluster0.48jl3a7.mongodb.net/?retryWrites=true&w=majority&ssl=true',
  },

  production: {
    root: rootPath,
    app: {
      name: 'Cherry-K',
    },
    port: 27017,
    db: 'mongodb+srv://kyawzawlwinwork6394:xyBbuhqdam1wTRHe@cluster0.48jl3a7.mongodb.net/?retryWrites=true&w=majority&ssl=true',
  },
};

module.exports = config[env];

//db: 'mongodb://54.251.85.187/issue-tracking',
