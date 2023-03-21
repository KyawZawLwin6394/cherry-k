"use strict";

const medicineSale = require("../controllers/medicineSaleController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/medicine-sale')
        .post(catchError(medicineSale.createMedicineSale))
        .put(verifyToken,catchError(medicineSale.updateMedicineSale))
        
    app.route('/api/medicine-sale/:id')
        .get(verifyToken,catchError(medicineSale.getMedicineSale))
        .delete(verifyToken,catchError(medicineSale.deleteMedicineSale)) 
        .post(verifyToken,catchError(medicineSale.activateMedicineSale))

    app.route('/api/medicine-sales').get(catchError(medicineSale.listAllMedicineSales))

};
