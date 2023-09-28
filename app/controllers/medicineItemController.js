'use strict';
const MedicineItem = require('../models/medicineItem');
const Branch = require('../models/branch');
const Stock = require('../models/stock');
const Log = require('../models/log');

exports.listAllMedicineItems = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 10; //limit
    skip = +skip || 0;
    let query = req.mongoQuery,
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    let result = await MedicineItem.find(query).populate({
      path: 'name',
      model: 'MedicineLists',
      populate: {
        path: 'relatedBrand',
        model: 'Brands'
      }
    })
    count = await MedicineItem.find(query).count();
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
    // console.log(e)
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.getMedicineItem = async (req, res) => {
  let query = req.mongoQuery;
  query = { ...query, _id: req.params.id }
  const result = await MedicineItem.find(query).populate('name');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedMedicineItem = async (req, res) => {
  let query = req.mongoQuery;
  query = { ...query, name: req.params.id }
  const result = await MedicineItem.find(query).populate('name');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};


exports.createMedicineItem = async (req, res, next) => {
  try {
    const newMedicineItem = new MedicineItem(req.body);
    const result = await newMedicineItem.save()
    const getAllBranches = await Branch.find();
    for (let i = 0; i < getAllBranches.length; i++) {
      let data = {
        "relatedMedicineItems": result._id,
        "currentQty": 0,
        "fromUnit": result.fromUnit,
        "toUnit": result.toUnit,
        "reorderQty": 1,
        "totalUnit": 0,
        "relatedBranch": getAllBranches[i]._id //branch_id
      }
      console.log(data)
      const stockResult = await Stock.create(data)
    }
    res.status(200).send({
      message: 'MedicineItem create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateMedicineItem = async (req, res, next) => {
  try {
    const getResult = await MedicineItem.find({ _id: req.body.id })

    const result = await MedicineItem.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('name')
    const logResult = await Log.create({
      "relatedMedicineItems": req.body.id,
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

exports.deleteMedicineItem = async (req, res, next) => {
  try {
    const result = await MedicineItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    const deleteStocks = await Stock.updateMany(
      { relatedMedicineItems: req.params.id },
      { isDeleted: true },
      { new: true }
    )
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted }, message: 'Stocks are deleted' });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateMedicineItem = async (req, res, next) => {
  try {
    const result = await MedicineItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.filterMedicineItems = async (req, res, next) => {
  try {
    let query = req.mongoQuery
    let { gender, startDate, endDate, status } = req.query
    if (gender) query.gender = gender
    if (status) query.patientStatus = status
    if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await MedicineItem.find(query).populate('name')
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.searchMedicineItems = async (req, res, next) => {
  try {
    let query = req.mongoQuery
    let { search } = req.body
    if (search) query.$text = { $search: search }
    const result = await MedicineItem.find(query).populate('name')
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

