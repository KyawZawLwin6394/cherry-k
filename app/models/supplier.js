'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let SupplierSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type:String,
    required:true
  },
  isDeleted: {
    type:Boolean,
    default:false
  }
});

module.exports = mongoose.model('Suppliers', SupplierSchema);

//Author: Kyaw Zaw Lwin
