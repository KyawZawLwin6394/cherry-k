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
        enum:['Assets','Liabilities','Equity','Revenue','COGS','Administration Expenses','Operation Expenses','Staff Expenses','Marketing Expenses','Other Expenses','Other Income'],
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    relatedTreatment: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Treatments',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    openingBalance: {
        type: Number,
        required: true,
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
    currency: {
        type: String,
        required:true
    },
    carryForWork: {
        type:Boolean,
        required: true
    }
});

module.exports = mongoose.model('AccountingLists', AccountingListSchema);

//Author: Kyaw Zaw Lwin
