"use strict";

const transaction = require("../controllers/transactionController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/transaction')
        .post(verifyToken ,catchError(transaction.createTransaction))
        .put(verifyToken,catchError(transaction.updateTransaction))
        
    app.route('/api/transaction/:id')
        .get(verifyToken ,catchError(transaction.getTransaction))
        .delete(verifyToken,catchError(transaction.deleteTransaction)) 
        .post(verifyToken ,catchError(transaction.activateTransaction))

    app.route('/api/transactions').get(verifyToken, catchError(transaction.listAllTransactions))
};
