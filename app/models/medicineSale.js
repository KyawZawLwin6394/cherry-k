'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let MedicineSaleSchema = new Schema({
  voucherCode: {
    type:String,
    required:true
  },
  createdAt: {
    type:Date,
    default:Date.now()
  },
  relatedTreatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Treatments',
    required: true
  },
  relatedPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Patients',
    required: true,
  },
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Appointments',
    required: true,
  },
  remark: {
    type:String,
  },
  totalAmount: {
    type:Number,
    required:true,
  },
  discount: {
    type: Number
  },
  grandTotal: {
    type:Number
  },
  payAmount: {
    type:Number
  },
  change: {
    type:Number
  },
  paymentMethod: {
    type:String,
    enum:["Cash Down","Bank Transition"],
    required:true
  },
  bankInfo: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Banks',
    required:true
  },
  medicineItems: [{
    item_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'MedicineItems'
    },
    quantity:Number,
    discount:Number
  }],
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  },
});

module.exports = mongoose.model('MedicineSales', MedicineSaleSchema);

//Author: Kyaw Zaw Lwin
