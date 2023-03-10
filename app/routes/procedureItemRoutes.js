"use strict";

const procedureItem = require("../controllers/procedureItemController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/procedure-item')
        .post(verifyToken,catchError(procedureItem.createProcedureItem))
        .put(verifyToken,catchError(procedureItem.updateProcedureItem))
        
    app.route('/api/procedure-item/:id')
        .get(verifyToken,catchError(procedureItem.getProcedureItem))
        .delete(verifyToken,catchError(procedureItem.deleteProcedureItem)) 
        .post(verifyToken,catchError(procedureItem.activateProcedureItem))

    app.route('/api/procedure-items').get(verifyToken,catchError(procedureItem.listAllProcedureItems))

};
