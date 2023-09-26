"use strict";

const accessoryItemRecord = require("../controllers/accessoryItemRecordController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/accessory-item-record')
        .post(verifyToken, catchError(accessoryItemRecord.createAccessoryItemRecord))
        .put(verifyToken, catchError(accessoryItemRecord.updateAccessoryItemRecord))

    app.route('/api/accessory-item-record/:id')
        .get(verifyToken, catchError(accessoryItemRecord.getAccessoryItemRecord))
        .delete(verifyToken, catchError(accessoryItemRecord.deleteAccessoryItemRecord))
        .post(verifyToken, catchError(accessoryItemRecord.activateAccessoryItemRecord))

    app.route('/api/accessory-item-records').get(verifyToken, catchError(accessoryItemRecord.listAllAccessoryItemRecordes))
};
