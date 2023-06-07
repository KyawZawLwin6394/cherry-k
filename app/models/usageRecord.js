'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let UsageRecordSchema = new Schema({
    relatedUsage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usages'
    },
    usageStatus: {
        type: String,
        enum: ['Pending', 'In Progress', 'Finished']
    },
    procedureMedicine: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProcedureItems'
        },
        stock: Number,
        actual: Number
    }],
    procedureAccessory: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessoryItems'
        },
        stock: Number,
        actual: Number
    }],
    machine: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FixedAssets'
        },
        stock: Number,
        actual: Number
    }],
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    machineError: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FixedAssets'
        },
        stock: Number,
        actual: Number
    }],
    procedureItemsError: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProcedureItems'
        },
        stock: Number,
        actual: Number
    }],
    accessoryItemsError: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessoryItems'
        },
        stock: Number,
        actual: Number
    }]
});

module.exports = mongoose.model('UsageRecords', UsageRecordSchema);

//Author: Kyaw Zaw Lwin
