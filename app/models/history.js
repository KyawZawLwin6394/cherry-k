'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let HistorySchema = new Schema({
    skinCareAndCosmetic: [{
        item: String,
        remark: String
    }],
    drugHistory: {
        type: String
    },
    medicalHistory: {
        type: String
    },
    allergyHistory: {
        type: String
    },
    treatmentHistory: {
        type: String
    },
    complaint: {
        type: String,
    },
    relatedPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patients'
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    lmp: {
        type: Date
    },
    desiredTreatment: {
        type: String
    },
    note: {
        type: String
    },
    complaint: {
        type: String
    },
    consent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attachments"
    },
    underCareStatus: {
        type: String,
        enum: ['Yes', 'No']
    },
    underCareExplain: {
        type: String
    },
    plasticSurgeryStatus: {
        type: String,
        enum: ['Yes', 'No']
    },
    plasticSurgeryExplain: {
        type: String
    },
    skinCancerStatus: {
        type: String,
        enum: ['Yes', 'No']
    },
    skinCancerExplain: {
        type: String
    },
    bodySpaTreatmentStatus: {
        type: String,
        enum: ['Yes', 'No']
    },
    bodySpaTreatmentExplain: {
        type: String
    },
    selectedDiseases: [{
        name: {
            type: String
        },
        remark: {
            type: String
        }
    }]
});

module.exports = mongoose.model('Histories', HistorySchema);

//Author: Kyaw Zaw Lwin
