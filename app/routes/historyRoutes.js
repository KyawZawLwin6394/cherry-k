"use strict";

const history = require("../controllers/historyController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');
const upload = require('../lib/fieldUploader').upload;

module.exports = (app) => {

    app.route('/api/history')
        .post(upload, catchError(history.createHistory))
        .put(upload, catchError(history.updateHistory))

    app.route('/api/history/:id')
        .get(catchError(history.getHistory))
        .delete(catchError(history.deleteHistory))
        .post(catchError(history.activateHistory))

    app.route('/api/histories').get(catchError(history.listAllHistories))

    app.route('/api/histories-filter')
        .get(catchError(history.filterHistories))

    app.route('/api/histories-search')
        .post(catchError(history.searchHistories))
};
