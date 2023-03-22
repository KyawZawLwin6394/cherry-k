"use strict";

const treatment = require("../controllers/treatmentController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/treatment')
        .post(verifyToken ,catchError(treatment.createTreatment))
        .put(verifyToken,catchError(treatment.updateTreatment))
        
    app.route('/api/treatment/:id')
        .get(verifyToken ,catchError(treatment.getTreatment))
        .delete(verifyToken,catchError(treatment.deleteTreatment)) 
        .post(verifyToken ,catchError(treatment.activateTreatment))

    app.route('/api/treatments').get(catchError(treatment.listAllTreatments))
};
