"use strict";

const medicineItem = require("../controllers/medicineItemController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/medicine-item')
        .post(verifyToken,catchError(medicineItem.createMedicineItem))
        .put(verifyToken,catchError(medicineItem.updateMedicineItem))
        
    app.route('/api/medicine-item/:id')
        .get(catchError(medicineItem.getMedicineItem))
        .delete(catchError(medicineItem.deleteMedicineItem)) 
        .post(catchError(medicineItem.activateMedicineItem))

    app.route('/api/medicine-items').get(catchError(medicineItem.listAllMedicineItems))

};
