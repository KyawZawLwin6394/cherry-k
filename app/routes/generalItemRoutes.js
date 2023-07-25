"use strict";

const generalItem = require("../controllers/generalItemController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/general-item')
        .post(verifyToken, catchError(generalItem.createGeneralItem))
        .put(verifyToken, catchError(generalItem.updateGeneralItem))

    app.route('/api/general-item/:id')
        .get(verifyToken, catchError(generalItem.getGeneralItem))
        .delete(verifyToken, catchError(generalItem.deleteGeneralItem))
        .post(verifyToken, catchError(generalItem.activateGeneralItem))

    app.route('/api/general-items').get(verifyToken, catchError(generalItem.listAllGeneralItems))
    app.route('/api/general-items/:id').get(verifyToken, catchError(generalItem.getRelatedGeneralItem))
    app.route('/api/general-items-search').post(verifyToken, catchError(generalItem.searchGeneralItems))
};
