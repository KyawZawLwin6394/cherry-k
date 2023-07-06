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
    medicineLists: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicineItems'
        },
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
    procedureAccessory: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessoryItems'
        },
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
    relatedTransfer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StockTransfers'
    },
    seq: {
        type: Number
    },
    status: {
        type: String,
        enum: ['Ongoing', 'Done'],
        default: 'Ongoing'
    }

});

module.exports = mongoose.model('StockRequests', StockRequestSchema);

//Author: Kyaw Zaw Lwin
