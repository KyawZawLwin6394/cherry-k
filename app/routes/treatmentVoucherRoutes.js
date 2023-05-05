"use strict";

const treatmentVoucher = require("../controllers/treatmentVoucherController");
const { catchError } = require("../lib/errorHandler");
const  verifyToken= require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/treatment-voucher')
        .post( catchError(treatmentVoucher.createTreatmentVoucher))
        .put(catchError(treatmentVoucher.updateTreatmentVoucher))

    app.route('/api/treatment-voucher/:id')
        .get(catchError(treatmentVoucher.getTreatmentVoucher))
        .delete(catchError(treatmentVoucher.deleteTreatmentVoucher))
        .post(catchError(treatmentVoucher.activateTreatmentVoucher))

    app.route('/api/treatment-vouchers').get( catchError(treatmentVoucher.listAllTreatmentVouchers))
};
