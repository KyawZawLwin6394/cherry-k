"use strict";

const procedureItem = require("../controllers/procedureItemController");
const { catchError } = require("../lib/errorHandler");

module.exports = (app) => {

    app.route('/api/procedure-item')
        .post(catchError(procedureItem.createProcedureItem))
        .put(catchError(procedureItem.updateProcedureItem))
        
    app.route('/api/procedure-item/:id')
        .get(catchError(procedureItem.getProcedureItem))
        .delete(catchError(procedureItem.deleteProcedureItem)) 
        .post(catchError(procedureItem.activateProcedureItem))

    app.route('/api/procedure-items').get(catchError(procedureItem.listAllProcedureItems))

};
