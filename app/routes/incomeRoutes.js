"use strict";

const income = require("../controllers/incomeController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/income')
        .post(catchError(income.createIncome))
        .put(verifyToken,catchError(income.updateIncome))
        
    app.route('/api/income/:id')
        .get(catchError(income.getIncome))
        .delete(verifyToken,catchError(income.deleteIncome)) 
        .post(verifyToken ,catchError(income.activateIncome))

    app.route('/api/incomes').get( catchError(income.listAllIncomes))
};
