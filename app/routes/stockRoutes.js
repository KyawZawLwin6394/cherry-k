"use strict";

const stock = require("../controllers/stockController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/stock')
        .post(catchError(stock.createStock))
        .put(catchError(stock.updateStock))

    app.route('/api/stock/:id')
        .get(catchError(stock.getStock))
        .delete(catchError(stock.deleteStock))
        .post(catchError(stock.activateStock))

    app.route('/api/stocks').get(catchError(stock.listAllStocks))

};
