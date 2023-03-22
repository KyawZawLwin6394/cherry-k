'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TreatmentSelectionSchema = new Schema({
  paymentMethod: {
    type:String,
    enum:['Credit','Bank','Cash']
  },
  relatedBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists',
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
  relatedTreatment: {
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'Treatments'
  },
  relatedCash: {
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'AccountingLists'
  }
});
const patient = mongoose.model('TreatmentSelections',TreatmentSelectionSchema)
module.exports = patient;

//Author: Kyaw Zaw Lwin
