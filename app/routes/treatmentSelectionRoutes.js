"use strict";

const treatmentSelection = require("../controllers/treatmentSelectionController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/treatment-selection')
        .post(verifyToken, catchError(treatmentSelection.createTreatmentSelection))
        .put(verifyToken, catchError(treatmentSelection.updateTreatmentSelection))

    app.route('/api/treatment-selection/:id')
        .get(verifyToken, catchError(treatmentSelection.getTreatmentSelection))
        .delete(verifyToken, catchError(treatmentSelection.deleteTreatmentSelection))
        .post(verifyToken, catchError(treatmentSelection.activateTreatmentSelection))

    app.route('/api/treatment-selections').get(verifyToken, catchError(treatmentSelection.listAllTreatmentSelections))

    app.route('/api/treatment-selections/transaction').post(catchError(treatmentSelection.createTreatmentTransaction))

};
