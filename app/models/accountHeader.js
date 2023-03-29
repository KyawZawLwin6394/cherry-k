'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let AccountHeaderSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    description: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    updatedAt: {
        type: Date,
    },
    relatedAccountType: {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'AccountTypes'
    }
});

module.exports = mongoose.model('AccountHeaders', AccountHeaderSchema);

//Author: Kyaw Zaw Lwin
