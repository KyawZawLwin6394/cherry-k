'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let SystemSettingSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type:Date,
    required:true
  },
  address: {
    type: String,
  },
  accountingFlag: {
    type: Boolean,
    required:true,
  },
  fiscalYearStartDate: {
    type:Date,
    required:true
  },
  fiscalYearEndDate: {
    type:Date,
    required:true
  }
});

module.exports = mongoose.model('SystemSettings', SystemSettingSchema);

//Author: Kyaw Zaw Lwin
