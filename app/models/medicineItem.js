'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let MedicineItemSchema = new Schema({
  code: {
    type: String,
    required: true
  },
  medicineItemName:{
    type:String
  },
  name: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'MedicineLists',
    required:true,
  },
  currentQuantity: {
    type:Number,
    required:true,
  },
  reOrderQuantity: {
    type:Number,
  },
  purchasePrice: {
    type:Number,
    required:true,
  },
  sellingPrice: {
    type:Number,
    required:true,
  },
  description: {
    type:String,
  },
  fromUnit: {
    type:String,
  },
  toUnit: {
    type:String
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  }
});

module.exports = mongoose.model('MedicineItems', MedicineItemSchema);

//Author: Kyaw Zaw Lwin
