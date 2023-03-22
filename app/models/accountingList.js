'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let AccountingListSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    accountingTypes: {
        type: String,
        enum:['Current Assets','Payable','Inventory','Receivable','Current Liabilities','Equity','Revenue','COGS','Administration Expenses','Operation Expenses','Staff Expenses','Marketing Expenses','Other Expenses','Other Income','Fixed Assets','Longterm Liabilities'],
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    relatedTreatment: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Treatments',
       
    },
    amount: {
        type: Number,
        required: true,
    },
    openingBalance: {
        type: Number
    },
    generalFlag: {
        type: Boolean,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    relatedCurrency: {
        type:String,
        required:true
      },
    carryForWork: {
        type:Boolean,
        required: true
    }
});

module.exports = mongoose.model('AccountingLists', AccountingListSchema);

//Author: Kyaw Zaw Lwin
