"use strict";

const repayment = require("../controllers/repaymentController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/repayment')
        .post(catchError(repayment.createRepayment))
        .put(verifyToken,catchError(repayment.updateRepayment))
        
    app.route('/api/repayment/:id')
        .get(verifyToken ,catchError(repayment.getRepayment))
        .delete(verifyToken,catchError(repayment.deleteRepayment)) 
        .post(verifyToken ,catchError(repayment.activateRepayment))

    app.route('/api/repayments').get(catchError(repayment.listAllRepayments))
};
