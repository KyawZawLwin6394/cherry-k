"use strict";

const accountingList = require("../controllers/accountingListController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/accounting-list')
        .post(catchError(accountingList.createAccountingList))
        .put(verifyToken,catchError(accountingList.updateAccountingList))
        
    app.route('/api/accounting-list/:id')
        .get(verifyToken ,catchError(accountingList.getAccountingList))
        .delete(verifyToken,catchError(accountingList.deleteAccountingList)) 
        .post(verifyToken ,catchError(accountingList.activateAccountingList))

    app.route('/api/accounting-lists').get( catchError(accountingList.listAllAccountingLists))
};
