'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let AppointmentSchema = new Schema({
  patientStatus: {
    type: String,
    enum:['New', 'Old'],
    required: true
  },
  patientName: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Patients',
    required: true,
  },
  phone: {
    type:String,
    required:true
  },
  doctor: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Doctors',
    required:true,
  },
  description: {
    type:String,
    required:true
  },
  originalDate: {
    type: Date,
    required:true, //storing the originalDate so that we can use it later whenever we need
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  },
  date:{
    type: String,
    required:true,
  },
  time:{
    type:String,
    required:true
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  }
});

module.exports = mongoose.model('Appointments', AppointmentSchema);

//Author: Kyaw Zaw Lwin
