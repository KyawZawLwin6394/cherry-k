'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let Discount = new Schema({
    type: {
        type: String,
        enum: ['Amount', 'Percentage', 'FOCItem']
    },
    conditionAmount: {
        type: Number,
    },
    conditionPurchaseFreq: {
        type: Number,
    },
    conditionPackageQty: {
        type: Number
    },
    value: {
        type: Number,
    },
    relatedFOCID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Treatments'
    },
    for: {
        type: String,
        enum: ['All', 'Member', 'Medicine-Sales', 'Treatment-Sales']
    }
});

module.exports = mongoose.model('Discounts', Discount);

//Author: Kyaw Zaw Lwin
