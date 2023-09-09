'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let PurchaseRequestSchema = new Schema({
    code: {
        type: String
    },
    seq: {
        type: Number
    },
    purchaseDate: {
        type: Date,
    },
    reason: {
        type: String
    },
    requiredDate: {
        type: Date
    },
    remark: {
        type: String,
    },
    supplierName: {
        type: String
    },
    supplierVoucher: {
        type: String
    },
    medicineItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicineItems'
        },
        stockQty: Number,
        requestedQty: Number,
        purchasePrice: Number,
        subTotal: Number,
        recievedQty: {
            type: Number
        },
        flag: {
            type: Boolean,
            default: false
        }
    }],
    procedureItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProcedureItems'
        },
        subTotal: Number,
        stockQty: Number,
        requestedQty: Number,
        purchasePrice: Number,
        recievedQty: {
            type: Number
        },
        flag: {
            type: Boolean,
            default: false
        }
    }],
    accessoryItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessoryItems'
        },
        subTotal: Number,
        stockQty: Number,
        requestedQty: Number,
        purchasePrice: Number,
        recievedQty: {
            type: Number
        },
        flag: {
            type: Boolean,
            default: false
        }
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
    relatedApprove: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchases'
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
    type: {
        type: String,
        enum: ['Requested', 'Approved', 'Received'],
        default: 'Requested'
    }
});

module.exports = mongoose.model('PurchaseRequests', PurchaseRequestSchema);

//Author: Kyaw Zaw Lwin
