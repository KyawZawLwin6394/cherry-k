"use strict";

const accountType = require("../controllers/accountTypeController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/account-type')
        .post(catchError(accountType.createAccountType))
        .put(verifyToken, catchError(accountType.updateAccountType))

    app.route('/api/account-type/:id')
        .get(verifyToken, catchError(accountType.getAccountType))
        .delete(verifyToken, catchError(accountType.deleteAccountType))
        .post(verifyToken, catchError(accountType.activateAccountType))

    app.route('/api/account-types').get(catchError(accountType.listAllAccountTypes))
};
