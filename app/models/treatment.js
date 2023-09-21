'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let TreatmentSchema = new Schema({
  treatmentCode: {
    type: String,
    required: true
  },
  name: {
    type: String,
  },
  treatmentName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TreatmentLists",
  },
  treatmentTimes: {
    type: Number
  },
  relatedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctors',
    // required: function() {
    //     return !this.relatedTherapist; // therapist is required if field2 is not provided
    //   }
  },
  relatedTherapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapists',
    // required: function() {
    //     return !this.relatedDoctor; // doctor is required if field2 is not provided
    //   }
  },
  procedureMedicine: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcedureItems'
    },
    quantity: {
      type: Number
    },
    perUsageQTY: {
      type: Number
    },
    unit: {
      type: String
    }
  }],
  medicineLists: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineItems'
    },
    quantity: {
      type: Number
    },
    perUsageQTY: {
      type: Number
    },
    unit: {
      type: String
    }
  }],
  procedureAccessory: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccessoryItems'
    },
    quantity: {
      type: Number
    },
    perUsageQTY: {
      type: Number
    },
    unit: {
      type: String
    }
  }],
  machine: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FixedAssets'
    },
    quantity: {
      type: Number
    },
    perUsageQTY: {
      type: Number
    },
    unit: {
      type: String
    }
  }],
  estimateTotalPrice: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  sellingPrice: {
    type: Number,
  },
  description: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  relatedPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patients'
  },
  relatedAppointment: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Appointments'
  },
  status: {
    type: Boolean,
  },
  relatedAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountingLists'
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
  sellEndFlag: {
    type: Boolean,
    default: false
  },
  TCLSellingPrice: {
    type: Number
  },
  TCLEstimateTotalPrice: {
    type: Number
  },
  EightMileSellingPrice: {
    type: Number
  },
  EightMileEstimateTotalPrice: {
    type: Number
  },
  NPTSellingPrice: {
    type: Number
  },
  NPTEstimateTotalPrice: {
    type: Number
  },
  LSHSellingPrice: {
    type: Number
  },
  LSHEstimateTotalPrice: {
    type: Number
  },
  MDYSellingPrice: {
    type: Number
  },
  MDYEstimateTotalPrice: {
    type: Number
  },
  KShoppingSellingPrice: {
    type: Number
  },
  KShoppingEstimateTotalPrice: {
    type: Number
  },

});

module.exports = mongoose.model('Treatments', TreatmentSchema);

//Author: Kyaw Zaw Lwin
