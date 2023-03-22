'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let PatientTreatmentSchema = new Schema({
  relatedAccounting: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists',
    required: true
  },
  amount: {
    type: String,
    required: true,
  },
  date: {
    type:Date,
    required:true
  },
  remark: {
    type: String,
    required:true,
  },
  type: {
    type: String,
    enum:['Debit','Credit'],
    // required:true,
  },
  relatedTreatment: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Treatments',
  },
  relatedBank: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists',
  },
  relatedCash: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists',
  },
  treatmentFlag: {
    type:Boolean, 
    // required:true
  },
  isDeleted: {
    type:Boolean,
    // required:true,
    default:false
  }
});

module.exports = mongoose.model('PatientTreatments', PatientTreatmentSchema);

//Author: Kyaw Zaw Lwin
