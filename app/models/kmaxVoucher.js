'use strict'

const mongoose = require('mongoose')
mongoose.promise = global.Promise
const Schema = mongoose.Schema

let KmaxVoucherSchema = new Schema({
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  relatedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctors'
  },
  relatedTreatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatments'
  },
  secondAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountingLists'
  },
  secondAmount: {
    type: Number,
    default: 0
  },
  isDouble: {
    type: Boolean
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
    enum: ['Paid', 'Partial', 'FOC']
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
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachments'
  },
  totalDiscountAmt: {
    type: Number,
    default: 0
  },
  medicineSale: [
    {
      item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicineItems'
      },
      discountAmount: Number,
      price: Number,
      qty: Number,
      stock: Number
    }
  ],
  procedureSale: [
    {
      item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProcedureItems'
      },
      discountAmount: Number,
      price: Number,
      qty: Number,
      stock: Number
    }
  ],
  accessorySale: [
    {
      item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccessoryItems'
      },
      discountAmount: Number,
      price: Number,
      qty: Number,
      stock: Number
    }
  ],
  paidAmount: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number
  }
})

module.exports = mongoose.model('KmaxVouchers', KmaxVoucherSchema)

//Author: Kyaw Zaw Lwin
