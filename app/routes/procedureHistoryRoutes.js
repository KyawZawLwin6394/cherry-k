"use strict";

const procedureHistory = require("../controllers/procedureHistoryController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/procedure-history')
        .post(catchError(procedureHistory.createProcedureHistory))
        .put(catchError(procedureHistory.updateProcedureHistory))
        
    app.route('/api/procedure-history/:id')
        .get(catchError(procedureHistory.getProcedureHistory))
        .delete(catchError(procedureHistory.deleteProcedureHistory)) 
        .post(catchError(procedureHistory.activateProcedureHistory))

    app.route('/api/procedure-histories').get(catchError(procedureHistory.listAllProcedureHistorys))
};
