'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let PatientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
  },
  phone: {
    type:String,
    required:true
  },
  dateOfBirth: {
    type: Date,
  },
  email: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
  },
  address: {
    type: String,
  },
  occupation: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  },
  patientStatus: {
    type:String,
    enum:['New','Old'],
    requried:true,
  },
});
const patient = mongoose.model('Patients',PatientSchema)
module.exports = patient;


//Author: Kyaw Zaw Lwin
