'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let PatientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
  },
  phone: {
    type:Number,
    required:true
  },
  dateOfBirth: {
    type: Date,
    required:true,
  },
  gender: {
    type: String,
    required:true,
  },
  address: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Patients', PatientSchema);
