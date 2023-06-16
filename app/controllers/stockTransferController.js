'use strict';
const StockTransfer = require('../models/stockTransfer');
const Stock = require('../models/stock');
const ProcedureMedicine = require('../models/procedureItem');
const MedicineLists = require('../models/medicineItem');
const ProcedureAccessory = require('../models/accessoryItem');
const Branch = require('../models/branch');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList');
const Log = require('../models/log');

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
  const procedureMedicineRes = procedureMedicine.reduce((total, sale) => total + sale.purchasePrice, 0);
  const medicineListsRes = medicineLists.reduce((total, sale) => total + sale.purchasePrice, 0);
  const procedureAccessoryRes = procedureAccessory.reduce((total, sale) => total + sale.purchasePrice, 0);
  console.log(procedureMedicineRes, medicineListsRes, procedureAccessoryRes)
  const total = procedureAccessoryRes + medicineListsRes + procedureAccessoryRes;
  console.log(total, 'total')
  const firstTransaction =
  {
    "amount": total,
    "date": Date.now(),
    "remark": null,
    "type": "Credit",
    "relatedAccounting": "646733c359a9bc811d97ef09", //closing stock
    "relatedBranch": req.body.relatedBranch
  }
  const newTrans = new Transaction(firstTransaction)
  var fTransResult = await newTrans.save();
  var amountUpdate = await Accounting.findOneAndUpdate(
    { _id: "646733c359a9bc811d97ef09" },
    { $inc: { amount: -total } }
  )
  const getBranch = await Branch.find({ _id: req.body.relatedBranch })
  const branch = getBranch[0].name
  let secID = ''
  switch (branch) {
    case 'SOK':
      secID = '648ac0b45a6bb1362e43c3e3'
      break; //SOK Purchase COGS
    case '8MILE':
      secID = '648ac0d05a6bb1362e43c3e9'
      break; //8 Mile Purchase COGS
    case 'NPT':
      secID = '648ac1365a6bb1362e43c401'
      break; // NPT Purchase COGS
    case 'LSH':
      secID = '648ac3845a6bb1362e43e288'
      break; // MDY Purchase COGS
    case 'MDY':
      secID = '648ac3645a6bb1362e43e1ea'
      break; // MDY Purchase COGS
    default:
      return null
  }
  console.log(secID, 'secID')
  if (secID) {
    const secTransaction =
    {
      "amount": total,
      "date": Date.now(),
      "remark": null,
      "type": "Debit",
      "relatedAccounting": secID, //closing stock
      "relatedBranch": req.body.relatedBranch
    }
    const newTrans = new Transaction(secTransaction)
    var sTransResult = await newTrans.save();
    var amountUpdate2 = await Accounting.findOneAndUpdate(
      { _id: secID },
      { $inc: { amount: total } }
    )
  }
  try {
    if (procedureMedicine !== undefined) {
      procedureMedicine.map(async (e, i) => {
        if (e.stockQty < e.transferQty) {
          procedureMedicineError.push(e)
        } else if (e.stockQty > e.transferQty) {
          let currentQty = e.stockQty - e.transferQty //both must be currentQty
          const result = await ProcedureMedicine.find({ _id: e.item_id })
          const from = result[0].fromUnit
          const to = result[0].toUnit
          let totalUnit = (to * currentQty) / from
          try {
            procedureMedicineFinished.push(e)
            // const stockResult = await Stock.findOneAndUpdate(
            //   { relatedProcedureItems: e.item_id, relatedBranch: req.mongoQuery.relatedBranch },
            //   { $inc: { currentQty: e.transferQty } }
            // )
            const mainResult = await ProcedureMedicine.findOneAndUpdate(
              { _id: e.item_id },
              { totalUnit: totalUnit, currentQuantity: currentQty }
            )
            const logResult = await Log.create({
              "relatedProcedureItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": min,
              "type": "Stock Transfer",
              "relatedBranch": relatedBranch,
              "createdBy": createdBy
            })
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
          let currentQty = e.stockQty - e.transferQty //both must be currentQty
          const result = await ProcedureMedicine.find({ _id: e.item_id })
          const from = result[0].fromUnit
          const to = result[0].toUnit
          let totalUnit = (to * currentQty) / from
          try {
            medicineListsFinished.push(e)
            // const stockResult = await Stock.findOneAndUpdate(
            //   { relatedMedicineItems: e.item_id, relatedBranch: req.mongoQuery.relatedBranch },
            //   { $inc: { currentQty: e.transferQty } }
            // )
            const mainResult = await MedicineLists.findOneAndUpdate(
              { _id: e.item_id },
              { currentQuantity: currentQty, totalUnit: totalUnit }
            )
            const logResult = await Log.create({
              "relatedMedicineItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": min,
              "type": "Stock Transfer",
              "relatedBranch": relatedBranch,
              "createdBy": createdBy
            })
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
          const result = await ProcedureAccessory.find({ _id: e.item_id })
          const from = result[0].fromUnit
          const to = result[0].toUnit
          const totalUnit = result[0].totalUnit
          let currentQuantity = (from * totalUnit) / to
          try {
            procedureAccessoryFinished.push(e)
            // const stockResult = await Stock.findOneAndUpdate(
            //   { relatedAccessoryItems: e.item_id, relatedBranch: req.mongoQuery.relatedBranch },
            //   { $inc: { currentQty: e.transferQty } }
            // )
            const mainResult = await ProcedureAccessory.findOneAndUpdate(
              { _id: e.item_id },
              { $inc: { currentQuantity: -currentQuantity } }
            )
            const logResult = await Log.create({
              "relatedAccessoryItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": min,
              "type": "Stock Transfer",
              "relatedBranch": relatedBranch,
              "createdBy": createdBy
            })
            // const log = await Log.create({

            // })
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
    if (fTransResult !== undefined) response.fTransResult = fTransResult
    if (sTransResult !== undefined) response.sTransResult = sTransResult
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
