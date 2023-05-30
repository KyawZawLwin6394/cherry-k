"use strict";

const branch = require("../controllers/branchController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/branch')
        .post(catchError(branch.createBranch))
        .put(catchError(branch.updateBranch))
        
    app.route('/api/branch/:id')
        .get(catchError(branch.getBranch))
        .delete(catchError(branch.deleteBranch)) 
        .post(catchError(branch.activateBranch))

    app.route('/api/branches').get(catchError(branch.listAllBranches))
};
