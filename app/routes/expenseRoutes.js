"use strict";

const expense = require("../controllers/expenseController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/expense')
        .post(catchError(expense.createExpense))
        .put(verifyToken,catchError(expense.updateExpense))
        
    app.route('/api/expense/:id')
        .get(verifyToken ,catchError(expense.getExpense))
        .delete(verifyToken,catchError(expense.deleteExpense)) 
        .post(verifyToken ,catchError(expense.activateExpense))

    app.route('/api/expenses').get( catchError(expense.listAllExpenses))
};
