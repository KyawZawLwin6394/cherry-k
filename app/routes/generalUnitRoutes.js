"use strict";

const generalUnit = require("../controllers/generalUnitController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/general-unit')
        .post(verifyToken, catchError(generalUnit.createGeneralUnit))
        .put(verifyToken, catchError(generalUnit.updateGeneralUnit))

    app.route('/api/general-unit/:id')
        .get(verifyToken, catchError(generalUnit.getGeneralUnit))
        .delete(verifyToken, catchError(generalUnit.deleteGeneralUnit))
        .post(verifyToken, catchError(generalUnit.activateGeneralUnit))

    app.route('/api/general-units').get(verifyToken, catchError(generalUnit.listAllGeneralUnits))

    app.route('/api/general-units/search').post(verifyToken, catchError(generalUnit.searchProcedureAccessories))
};
