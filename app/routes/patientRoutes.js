"use strict";

const patient = require("../controllers/patientController");
const { catchError } = require("../lib/errorHandler");

module.exports = (app) => {

    app.route('/api/patient')
        .post(catchError(patient.createPatient))
        .put(catchError(patient.updatePatient))
        
    
    app.route('/api/patient/:id')
        .get(catchError(patient.getPatient))
        .delete(catchError(patient.deletePatient)) 
        .post(catchError(patient.activatePatient))

    app.route('/api/patients').get(catchError(patient.listAllPatients))

};
