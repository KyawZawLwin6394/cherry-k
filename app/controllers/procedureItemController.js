'use strict';
const ProcedureItem = require('../models/procedureItem')
const Branch = require('../models/branch');
const Stock = require('../models/stock');
const Log = require('../models/log');

exports.listAllProcedureItems = async (req, res) => {
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
    let result = await ProcedureItem.find(query).populate({
      path: 'name',
      model: 'ProcedureMedicines',
      populate: {
        path: 'relatedBrand',
        model: 'Brands'
      }
    })
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
    //console.log(e)

    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.getProcedureItem = async (req, res) => {
  const result = await ProcedureItem.find({ _id: req.params.id, isDeleted: false }).populate('name')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedProcedureItem = async (req, res) => {
  const result = await ProcedureItem.find({ name: req.params.id, isDeleted: false }).populate('name')
  if (result.length == 0)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createProcedureItem = async (req, res, next) => {
  try {
    const { toUnit, currentQuantity } = req.body;
    req.body = { ...req.body, totalUnit: toUnit * currentQuantity } //calculating total unit 
    const newProcedureItem = new ProcedureItem(req.body);
    const result = await newProcedureItem.save();

    const getAllBranches = await Branch.find();
    for (let i = 0; i < getAllBranches.length; i++) {
      const stockResult = await Stock.create({
        "relatedProcedureItems": result._id,
        "currentQty": 10,
        "fromUnit": result.fromUnit,
        "toUnit": result.toUnit,
        "reorderQty": 1,
        "totalUnit": 10,
        "relatedBranch": getAllBranches[i]._id //branch_id
      })
    }
    res.status(200).send({
      message: 'ProcedureItem create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateProcedureItem = async (req, res, next) => {
  try {
    const getResult = await ProcedureItem.find({ _id: req.body.id })
    const result = await ProcedureItem.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('name');
    const logResult = await Log.create({
      "relatedProcedureItems": req.body.id,
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

exports.deleteProcedureItem = async (req, res, next) => {
  try {
    const result = await ProcedureItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateProcedureItem = async (req, res, next) => {
  try {
    const result = await ProcedureItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.searchProcedureItems = async (req, res, next) => {
  try {
    const result = await ProcedureItem.find({ $text: { $search: req.body.search } }).populate('name')
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

