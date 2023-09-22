'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let AccessoryItemRecord = new Schema({
    accessoryItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessoryItems'
        },
        qty: {
            type: Number,
            default: 0
        },
        actual: {
            type: Number,
            default: 0
        }
    }],
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },

    reason: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('AccessoryItemRecords', AccessoryItemRecord);

//Author: Kyaw Zaw Lwin
