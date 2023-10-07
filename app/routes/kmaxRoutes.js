"use strict";

const kmaxVoucher = require("../controllers/kmaxController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/kmax-voucher')
        .post(verifyToken, catchError(kmaxVoucher.createKmaxVoucher))
        .put(verifyToken, catchError(kmaxVoucher.updateKmaxVoucher))


    app.route('/api/kmax-voucher/:id')
        .get(verifyToken, catchError(kmaxVoucher.getKmaxVoucher))
        .delete(verifyToken, catchError(kmaxVoucher.deleteKmaxVoucher))
        .post(verifyToken, catchError(kmaxVoucher.activateKmaxVoucher))

    app.route('/api/kmax-vouchers').get(verifyToken, catchError(kmaxVoucher.listAllKmaxVouchers))
    app.route('/api/kmax-vouchers/code').get(verifyToken, catchError(kmaxVoucher.createCode))

    app.route('/api/kmax-vouchers/transaction').post(verifyToken, catchError(kmaxVoucher.createKmaxVoucherTransaction))
    app.route('/api/kmax-vouchers/filter').get(verifyToken, catchError(kmaxVoucher.filterKmaxVouchers))
    app.route('/api/kmax-vouchers/search').post(verifyToken, catchError(kmaxVoucher.searchKmaxVoucher))
    app.route('/api/kmax-vouchers/km-filter').get(verifyToken, catchError(kmaxVoucher.KmaxVoucherFilter))
    app.route('/api/kmax-vouchers/get-date').get(verifyToken, catchError(kmaxVoucher.getwithExactDate))

};
