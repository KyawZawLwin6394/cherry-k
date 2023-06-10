'use strict';
const StockTransfer = require('../models/stockTransfer');
const Stock = require('../models/stock');
const ProcedureMedicine = require('../models/procedureItem');
const MedicineLists = require('../models/medicineItem');
const ProcedureAccessory = require('../models/accessoryItem');

exports.listAllStockTransfers = async (req, res) => {
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
    let result = await StockTransfer.find(query)
    count = await StockTransfer.find(query).count();
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
    console.log(e)
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.listAllStockRequests = async (req, res) => {
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
    let result = await StockTransfer.find(query).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedBranch')
    count = await StockTransfer.find(query).count();
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

exports.getStockTransfer = async (req, res) => {
  let query = req.mongoQuery
  if (req.params.id) query._id = req.params.id
  const result = await StockTransfer.find(query).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedBranch')
  if (result.length === 0)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createStockTransfer = async (req, res, next) => {
  let newBody = req.body;
  const { procedureMedicine, medicineLists, procedureAccessory } = req.body;
  let procedureMedicineError = []
  let medicineListsError = []
  let procedureAccessoryError = []
  let procedureMedicineFinished = []
  let medicineListsFinished = []
  let procedureAccessoryFinished = []
  try {
    if (procedureMedicine !== undefined) {
      procedureMedicine.map(async (e, i) => {
        if (e.stockQty < e.transferQty) {
          procedureMedicineError.push(e)
        } else if (e.stockQty > e.transferQty) {
          let min = e.stockQty - e.transferQty
          try {
            procedureMedicineFinished.push(e)
            const stockResult = await Stock.findOneAndUpdate(
              { relatedProcedureItems: e.item_id, relatedBranch: req.mongoQuery.relatedBranch },
              { $inc: { currentQty: e.transferQty } }
            )
            const mainResult = await ProcedureMedicine.findOneAndUpdate(
              { _id: e.item_id },
              { $inc: { currentQuantity: -e.transferQty } }
            )
          } catch (error) {
            procedureMedicineError.push(e)
          }
        }
      })
    }
    if (medicineLists !== undefined) {
      medicineLists.map(async (e, i) => {
        if (e.stockQty < e.transferQty) {
          medicineListsError.push(e)
        } else if (e.stockQty > e.transferQty) {
          let min = e.stockQty - e.transferQty
          try {
            medicineListsFinished.push(e)
            const stockResult = await Stock.findOneAndUpdate(
              { relatedMedicineItems: e.item_id, relatedBranch: req.mongoQuery.relatedBranch },
              { $inc: { currentQty: e.transferQty } }
            )
            const mainResult = await MedicineLists.findOneAndUpdate(
              { _id: e.item_id },
              { $inc: { currentQuantity: -e.transferQty } }
            )
          } catch (error) {
            medicineListsError.push(e)
          }
        }
      })
    }
    if (procedureAccessory !== undefined) {
      procedureAccessory.map(async (e, i) => {
        if (e.stockQty < e.transferQty) {
          procedureAccessoryError.push(e)
        } else if (e.stockQty > e.transferQty) {
          let min = e.stockQty - e.transferQty
          try {
            procedureAccessoryFinished.push(e)
            const stockResult = await Stock.findOneAndUpdate(
              { relatedAccessoryItems: e.item_id, relatedBranch: req.mongoQuery.relatedBranch },
              { $inc: { currentQty: e.transferQty } }
            )
            const mainResult = await ProcedureAccessory.findOneAndUpdate(
              { _id: e.item_id },
              { $inc: { currentQuantity: -e.transferQty } }
            )
          } catch (error) {
            procedureAccessoryError.push(e)
          }
        }
      })
    }
    const newStockTransfer = new StockTransfer(newBody);
    const result = await newStockTransfer.save();

    let response = { success: true, message: 'StockTransfer create success' }
    if (procedureMedicineError.length > 0) response.procedureMedicineError = procedureMedicineError
    if (medicineListsError.length > 0) response.medicineListsError = medicineListsError
    if (procedureAccessoryError.length > 0) response.procedureAccessoryError = procedureAccessoryError
    if (procedureMedicineFinished !== undefined) response.procedureMedicineFinished = procedureMedicineFinished
    if (medicineListsFinished !== undefined) response.medicineListsFinished = medicineListsFinished
    if (procedureAccessoryFinished !== undefined) response.procedureAccessoryFinished = procedureAccessoryFinished
    response = { ...response, data: result }

    res.status(200).send(response);
  } catch (error) {
    // console.log(error )
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateStockTransfer = async (req, res, next) => {
  try {
    const result = await StockTransfer.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedBranch')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteStockTransfer = async (req, res, next) => {
  try {
    const result = await StockTransfer.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateStockTransfer = async (req, res, next) => {
  try {
    const result = await StockTransfer.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.generateCode = async (req, res) => {
  let data;
  try {
    const latestDocument = await StockTransfer.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
    console.log(latestDocument)
    if (latestDocument.length === 0) data = { ...data, seq: '1', patientID: "ST-1" } // if seq is undefined set initial patientID and seq
    console.log(data)
    if (latestDocument.length) {
      const increment = latestDocument[0].seq + 1
      data = { ...data, patientID: "ST-" + increment, seq: increment }
    }
    return res.status(200).send({
      success: true,
      data: data
    })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}
