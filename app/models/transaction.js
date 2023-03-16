'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TransactionSchema = new Schema({
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
    required:true,
  },
  relatedTreatment: {
    type:Boolean,
    required:true
  },
  relatedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Transactions',
    required:true,
    default:null
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  }
});

module.exports = mongoose.model('Transactions', TransactionSchema);

//Author: Kyaw Zaw Lwin
