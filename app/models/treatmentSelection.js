'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let TreatmentSelectionSchema = new Schema({
  treatmentName: {
    type: String,
    required: true
  },
  treatmentCode: {
    type: String,
    required:true,
  },
  paymentMethod: {
    type:String,
    enum:['Credit','Cash Down']
  },
  bankInformation: {
    type: String,
    required:true
  },
  paidAmount: {
    type: Number,
  },
  leftOverAmount: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required:true,
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
});
const patient = mongoose.model('TreatmentSelections',TreatmentSelectionSchema)
module.exports = patient;

//Author: Kyaw Zaw Lwin
