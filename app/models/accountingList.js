'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let AccountingListSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    relatedType: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'AccountTypes'
    },
    relatedHeader: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'AccountHeaders'
    },
    subHeader: {
        type:String
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
    },
    relatedBank: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Banks'
    }
});

module.exports = mongoose.model('AccountingLists', AccountingListSchema);

//Author: Kyaw Zaw Lwin
