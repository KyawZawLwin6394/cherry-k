'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let StockRequestSchema = new Schema({
    procedureMedicine: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProcedureItems'
        },
        stockQty: Number,
        requestedQty: Number
    }],
    medicineLists: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicineItems'
        },
        stockQty: Number,
        requestedQty: Number
    }],
    procedureAccessory: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessoryItems'
        },
        stockQty: Number,
        requestedQty: Number
    }],
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    date: {
        type: Date
    },
    requestNo: {
        type: String
    },
    requestedBy: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    seq: {
        type: Number
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },

});

module.exports = mongoose.model('StockRequests', StockRequestSchema);

//Author: Kyaw Zaw Lwin
