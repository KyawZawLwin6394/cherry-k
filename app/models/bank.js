'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let BankSchema = new Schema({
  bankName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: Number,
    required: true,
  },
  accountHolderName: {
    type:String,
    required:true
  },
  bankContact: {
    type: String,
    required:true,
  },
  openingDate: {
    type: Date,
    required:true,
  },
  balance: {
    type: Number,
    required:true,
  },
  bankAddress: {
    type: String,
    required:true,
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  }
});

module.exports = mongoose.model('Banks', BankSchema);

//Author: Kyaw Zaw Lwin
