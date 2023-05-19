'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let LogSchema = new Schema({
    relatedTreatmentSelection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentSelections',
        required: true
    },
    relatedAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentSelections',
        required: true
    },
    date: {
        type: Date,
        default:Date.now()
    },
    currentQty: {
        type: Number,
    },
    actualQty: {
        type: Number,
    },
    finalQty: {
        type: Number,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('Logs', LogSchema);

//Author: Kyaw Zaw Lwin
