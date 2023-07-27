'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let PurchaseSchema = new Schema({
    code: {
        type: String
    },
    seq: {
        type: Number
    },
    purchaseDate: {
        type: Date,
    },
    supplierName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Suppliers',
    },
    remark: {
        type: String,
    },
    medicineItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicineItems'
        },
        subTotal:Number,
        stockQty: Number,
        requestedQty: Number,
        transferQty: Number,
        purchasePrice: Number
    }],
    procedureItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProcedureItems'
        },
        subTotal:Number,
        stockQty: Number,
        requestedQty: Number,
        transferQty: Number,
        purchasePrice: Number,
    }],
    accessoryItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessoryItems'
        },
        subTotal:Number,
        stockQty: Number,
        requestedQty: Number,
        transferQty: Number,
        purchasePrice: Number
    }],
    totalQTY: {
        type: Number,
    },
    totalPrice: {
        type: Number,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    purchaseType: {
        type: String,
        enum: ['Cash Down', 'Credit']
    },
    creditAmount: {
        type: Number
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
});

module.exports = mongoose.model('Purchases', PurchaseSchema);

//Author: Kyaw Zaw Lwin
