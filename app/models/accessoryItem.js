'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let AccessoryItem = new Schema({
  code: {
    type: String,
    required: true
  },
  procedureItemName:{
    type:String,
  },
  name: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'ProcedureAccessories',
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
    type:Number,
  },
  toUnit: {
    type:Number
  },
  totalUnit: {
    type:Number
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  },
  totalUnit:{
    type:Number
  }
});

module.exports = mongoose.model('AccessoryItems', AccessoryItem);

//Author: Kyaw Zaw Lwin
