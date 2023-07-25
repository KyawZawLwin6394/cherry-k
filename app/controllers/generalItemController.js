'use strict';
const GeneralItem = require('../models/generalItem');
const Branch = require('../models/branch');
const Stock = require('../models/stock');
const Log = require('../models/log')
exports.listAllGeneralItems = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 10; //limit
    skip = +skip || 0;
    let query = { isDeleted: false },
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    let result = await GeneralItem.find(query).populate('name relatedCategory relatedBrand relatedSubCategory relatedBranch')
    count = await GeneralItem.find(query).count();
    const division = count / limit;
    page = Math.ceil(division);

    res.status(200).send({
      success: true,
      count: count,
      _metadata: {
        current_page: skip / limit + 1,
        per_page: limit,
        page_count: page,
        total_count: count,
      },
      list: result,
    });
  } catch (e) {
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.getGeneralItem = async (req, res) => {
  const result = await GeneralItem.find({ _id: req.params.id, isDeleted: false }).populate('name relatedCategory relatedBrand relatedSubCategory relatedBranch')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedGeneralItem = async (req, res) => {
  const result = await GeneralItem.find({ name: req.params.id, isDeleted: false }).populate('name relatedCategory relatedBrand relatedSubCategory relatedBranch')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createGeneralItem = async (req, res, next) => {
  try {
    const newBody = req.body;
    const newGeneralItem = new GeneralItem(newBody);
    const result = await newGeneralItem.save();
    const getAllBranches = await Branch.find();
    for (let i = 0; i < getAllBranches.length; i++) {
      const stockResult = await Stock.create({
        "relatedGeneralItems": result._id,
        "currentQty": 1,
        "fromUnit": result.fromUnit,
        "toUnit": result.toUnit,
        "reorderQty": 1,
        "totalUnit": 1,
        "relatedBranch": getAllBranches[i]._id //branch_id
      })
    }
    res.status(200).send({
      message: 'GeneralItem create success',
      success: true,
      data: result
    });
  } catch (error) {
    // console.log(error)
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateGeneralItem = async (req, res, next) => {
  try {
    const getResult = await GeneralItem.find({ _id: req.body.id })
    const result = await GeneralItem.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('name relatedCategory relatedBrand relatedSubCategory relatedBranch')
    const logResult = await Log.create({
      "relatedGeneralItems": req.body.id,
      "currentQty": getResult[0].totalUnit,
      "finalQty": req.body.totalUnit,
      "type": "Stock Update",
      "relatedBranch": req.mongoQuery.relatedBranch,
      "createdBy": req.credentials.id
    })
    return res.status(200).send({ success: true, data: result, log: logResult });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteGeneralItem = async (req, res, next) => {
  try {
    const result = await GeneralItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateGeneralItem = async (req, res, next) => {
  try {
    const result = await GeneralItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.searchGeneralItems = async (req, res, next) => {
  try {
    const result = await GeneralItem.find({ $text: { $search: req.body.search } }).populate('name')
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}
