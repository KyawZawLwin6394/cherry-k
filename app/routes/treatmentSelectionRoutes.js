"use strict";

const treatmentSelection = require("../controllers/treatmentSelectionController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');
const treatment = require("../models/treatment");
const upload = require('../lib/fieldUploader').upload;

module.exports = (app) => {

    app.route('/api/treatment-selection')
        .post(verifyToken, upload, catchError(treatmentSelection.createTreatmentSelection))
        .put(verifyToken, catchError(treatmentSelection.updateTreatmentSelection))

    app.route('/api/treatment-selection/:id')
        .get(verifyToken, catchError(treatmentSelection.getTreatmentSelection))
        .delete(verifyToken, catchError(treatmentSelection.deleteTreatmentSelection))
        .post(verifyToken, catchError(treatmentSelection.activateTreatmentSelection))

    app.route('/api/treatment-selections')
        .get(verifyToken, catchError(treatmentSelection.listAllTreatmentSelections));

    app.route('/api/treatment-selections/multi')
        .post(verifyToken, upload, catchError(treatmentSelection.createMultiTreatmentSelection))
        .get(verifyToken, catchError(treatmentSelection.listMultiTreatmentSelections))

    app.route('/api/treatment-selections/transaction').post(verifyToken, catchError(treatmentSelection.createTreatmentTransaction))
    app.route('/api/treatment-selections/treatment/:id').get(verifyToken, catchError(treatmentSelection.getTreatementSelectionByTreatmentID))
    app.route('/api/treatment-selections/payment').put(verifyToken, upload, catchError(treatmentSelection.treatmentPayment))
    app.route('/api/treatment-selections/filter').post(verifyToken, catchError(treatmentSelection.getRelatedTreatmentSelections))
    app.route('/api/treatment-selections/search').post(verifyToken, catchError(treatmentSelection.searchTreatmentSelections))
    app.route('/api/treatment-selections/code').get(verifyToken, catchError(treatmentSelection.createTreatmentSelectionCode))
    app.route('/api/treatment-selections/top-ten').get(verifyToken, catchError(treatmentSelection.TopTenFilter))

};
