"use strict";

const purchaseRequest = require("../controllers/purchaseRequestController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/purchase-request')
        .post(verifyToken, catchError(purchaseRequest.createPurchaseRequest))
        .put(verifyToken, catchError(purchaseRequest.updatePurchaseRequest))

    app.route('/api/purchase-requests/code').get(verifyToken, catchError(purchaseRequest.getCode))


    app.route('/api/purchase-request/:id')
        .get(verifyToken, catchError(purchaseRequest.getPurchaseRequest))
        .delete(verifyToken, catchError(purchaseRequest.deletePurchaseRequest))
        .post(verifyToken, catchError(purchaseRequest.activatePurchaseRequest))

    app.route('/api/purchase-requests').get(verifyToken, catchError(purchaseRequest.listAllPurchaseRequests))
};
