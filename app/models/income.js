'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let IncomeSchema = new Schema({
    relatedAccounting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists',
        required: true
    },
    date: {
        type: Date,
        required: true,
    },
    remark: {
        type: String,
        required: true
    },
    initialAmount: {
        type: Number,
        required: true,
    },
    initialCurrency: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Currencies',
        required: true,
    },
    finalAmount: {
        type: Number,
        required: true,
    },
    finalCurrency: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Currencies',
        required: true,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('Incomes', IncomeSchema);

//Author: Kyaw Zaw Lwin
