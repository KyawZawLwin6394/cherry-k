// middleware.js
const relatedBranchMiddleware = (req, res, next) => {
  let query = { isDeleted: false }
  if (req.query.relatedBranch) query.relatedBranch = req.query.relatedBranch;

  req.mongoQuery = query;
  next();
};

module.exports = { relatedBranchMiddleware };
