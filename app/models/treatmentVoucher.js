'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TreatmentVoucherSchema = new Schema({
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    relatedTreatment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Treatments'
    },
    relatedAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointments'
    },
    relatedPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patients'
    },
    paymentMethod: {
        type: String,
        enum: ['by Appointment', 'Lumpsum', 'Total', 'Advanced', 'FOC', 'pAdvance']
    },
    code: {
        type: String
    },
    relatedBank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    relatedCash: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    paymentType: {
        type: String,
        enum: ['Bank', 'Cash']
    },
    seq: {
        type: Number
    },
    relatedTreatmentSelection: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentSelections'
    }],
    remark: {
        type: String
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    bankType: {
        type: String,
        enum: ['Normal', 'POS', 'Pay']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    relatedAccounting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    saleReturnType: {
        type: Boolean,
        default: false
    },
    remark: {
        type: String
    },
    totalDiscount: {
        type: Number
    },
    totalAmount: {
        type: Number
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    totalPaidAmount: {
        type: Number,
        default: 0
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attachments'
    },
    relatedDiscount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discounts'
    },
    discountAmount: {
        type: Number
    },
    discountType: {
        type: Number
    },
    tsType: {
        type: String,
        enum: ['TS', 'TSMulti', 'MS', 'Combined', 'PS']
    },
    msTotalAmount: {
        type: Number,
        default: 0
    },
    msTotalDiscountAmount: {
        type: Number
    },
    msPaidAmount: {
        type: Number
    },
    msChange: {
        type: Number
    },
    msGrandTotal: {
        type: Number
    },
    multiTreatment: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Treatments'
        },
        discountAmount: Number,
        price: Number,
        qty: Number
    }],
    tvDiscount: {
        type: Number
    },
    amount: {
        type: Number
    },
    medicineItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicineItems'
        },
        qty: Number,
        price: Number,
        discountAmount: Number
    }],
    relatedTransaction: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Transactions'
    },
    relatedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctors'
    },
    purchaseType: {
        type: String,
        enum: ['Solid Beauty', 'Normal']
    },
    deposit: {
        type: Number
    },
    payment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Attachments'
    }
});

module.exports = mongoose.model('TreatmentVouchers', TreatmentVoucherSchema);

//Author: Kyaw Zaw Lwin
