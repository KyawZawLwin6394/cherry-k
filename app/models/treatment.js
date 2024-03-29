'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let TreatmentSchema = new Schema({
  treatmentCode: {
    type: String,
    required: true
  },
  treatmentName: {
    type: String,
    required: true,
  },
  treatmentTimes: {
    type:Number,
    required:true
  },
  relatedDoctor: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Doctors',
    required: function() {
        return !this.relatedTherapist; // therapist is required if field2 is not provided
      }
  },
  relatedTherapist: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Therapists',
    required: function() {
        return !this.relatedDoctor; // doctor is required if field2 is not provided
      }
  },
  procedureMedicine: [{
    item_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ProcedureItems'
    },
    quantity:Number,
    perUsageQTY:Number
  }],
  procedureAccessory: [{
    item_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ProcedureAccessories'
    },
    quantity:Number,
    perUsageQTY:Number
  }],
  machine:[{
    item_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Machines'
    },
    quantity:Number,
    perUsageQTY:Number
  }],
  estimateTotalPrice:{
    type: Number,
    required:true,
  },
  discount:{
    type:Number,
    required:true
  },
  sellingPrice: {
    type:Number,
    required:true,
  },
  description: {
    type:String
  },
  isDeleted: {
    type:Boolean, 
    required:true,
    default:false
  },
  relatedPatient: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Patients',
    required:true
  },
  relatedAppointment: {
    type:[mongoose.Schema.Types.ObjectId],
    required:true,
    ref:'Appointments'
  }
});

module.exports = mongoose.model('Treatments', TreatmentSchema);

//Author: Kyaw Zaw Lwin
