"use strict";

const branch = require("../controllers/branchController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/branch')
        .post(verifyToken, catchError(branch.createBranch))
        .put(verifyToken, catchError(branch.updateBranch))

    app.route('/api/branch/:id')
        .get(verifyToken, catchError(branch.getBranch))
        .delete(verifyToken, catchError(branch.deleteBranch))
        .post(verifyToken, catchError(branch.activateBranch))

    app.route('/api/branches').get(verifyToken, catchError(branch.listAllBranches))
};
