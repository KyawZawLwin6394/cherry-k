'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TreatmentHistorySchema = new Schema({
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Appointments',
    required: true
  },
  diagnosis: {
    type: String,
    required: true,
  },
  doctorRemark: {
    type:String
  },
  attachments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref:'Attachments'
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  }
});

module.exports = mongoose.model('TreatmentHistories', TreatmentHistorySchema);

//Author: Kyaw Zaw Lwin
