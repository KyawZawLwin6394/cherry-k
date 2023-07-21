'use strict';
const MedicineSale = require('../models/medicineSale');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList');
const Patient = require('../models/patient');
const Stock = require('../models/stock');
const Log = require('../models/log')

exports.listAllMedicineSales = async (req, res) => {
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
    if (req.query.createdBy) query.createdBy = req.query.createdBy
    console.log(query)

    let result = await MedicineSale.find(query).populate('relatedPatient relatedBranch').populate('relatedAppointment').populate('medicineItems.item_id').populate('relatedTreatment').populate('createdBy').populate({
      path: 'relatedTransaction',
      populate: [{
        path: 'relatedAccounting',
        model: 'AccountingLists'
      }, {
        path: 'relatedBank',
        model: 'AccountingLists'
      }, {
        path: 'relatedCash',
        model: 'AccountingLists'
      }]
    });
    count = await MedicineSale.find(query).count();
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

exports.getMedicineSale = async (req, res) => {
  let query = req.mongoQuery
  if (req.params.id) query._id = req.params.id
  const result = await MedicineSale.find(query).populate('relatedPatient relatedTransaction').populate('relatedAppointment').populate('medicineItems.item_id').populate('relatedTreatment').populate('createdBy')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createMedicineSale = async (req, res, next) => {
  let data = req.body;
  let createdBy = req.credentials.id
  try {
    let { medicineItems, relatedBranch } = data
    //prepare CUS-ID
    const latestDocument = await MedicineSale.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
    if (latestDocument.length == 0) data = { ...data, seq: 1, voucherCode: "MVC-1" } // if seq is undefined set initial patientID and seq
    if (latestDocument.length) {
      const increment = latestDocument[0].seq + 1
      data = { ...data, voucherCode: "MVC-" + increment, seq: increment }
    }

    const patientUpdate = await Patient.findOneAndUpdate(
      { _id: req.body.relatedPatient },
      { $inc: { conditionAmount: req.body.grandTotal, conditionPurchaseFreq: 1, conditionPackageQty: 1 } },
      { new: true }
    )

    let objID = ''
    if (req.body.relatedBank) objID = req.body.relatedBank
    if (req.body.relatedCash) objID = req.body.relatedCash
    //transaction
    const acc = await Accounting.find({ _id: objID })
    const accResult = await Accounting.findOneAndUpdate(
      { _id: objID },
      { amount: parseInt(req.body.payAmount) + parseInt(acc[0].amount) },
      { new: true },
    )
    data = { ...data, relatedTransaction: [fTransResult._id, secTransResult._id], createdBy: createdBy, relatedBranch: req.body.relatedBranch }
    console.log(data)

    if (medicineItems !== undefined) {
      for (const e of medicineItems) {

        let totalUnit = e.stock - e.quantity
        const result = await Stock.find({ relatedMedicineItems: e.item_id, relatedBranch: relatedBranch })
        const from = result[0].fromUnit
        const to = result[0].toUnit
        const currentQty = (from * totalUnit) / to
        try {
          const result = await Stock.findOneAndUpdate(
            { relatedMedicineItems: e.item_id, relatedBranch: relatedBranch },
            { totalUnit: totalUnit, currentQty: currentQty },
            { new: true },
          )
        } catch (error) {
          return res.status(500).send({ error: true, message: error.message })
        }
        const logResult = await Log.create({
          "relatedTreatmentSelection": null,
          "relatedAppointment": null,
          "relatedMedicineItems": e.item_id,
          "currentQty": e.stock,
          "actualQty": e.actual,
          "finalQty": totalUnit,
          "type": "Medicine Sale",
          "relatedBranch": relatedBranch,
          "createdBy": createdBy
        })
      }
    }
    const newMedicineSale = new MedicineSale(data)
    const medicineSaleResult = await newMedicineSale.save()

    //first transaction 
    const fTransaction = new Transaction({
      "amount": data.payAmount,
      "date": Date.now(),
      "remark": req.body.remark,
      "relatedAccounting": "646739c059a9bc811d97fa8b", //Sales (Medicines),
      "relatedMedicineSale": medicineSaleResult._id,
      "type": "Credit",
      "createdBy": createdBy
    })
    const fTransResult = await fTransaction.save()
    var amountUpdate = await Accounting.findOneAndUpdate(
      { _id: "646739c059a9bc811d97fa8b" },
      { $inc: { amount: -data.payAmount } }
    )
    //sec transaction
    const secTransaction = new Transaction(
      {
        "amount": data.payAmount,
        "date": Date.now(),
        "remark": req.body.remark,
        "relatedBank": req.body.relatedBank,
        "relatedCash": req.body.relatedCash,
        "type": "Debit",
        "relatedTransaction": fTransResult._id,
        "createdBy": createdBy
      }
    )
    const secTransResult = await secTransaction.save();
    var fTransUpdate = await Transaction.findOneAndUpdate(
      { _id: fTransResult._id },
      {
        relatedTransaction: secTransResult._id
      },
      { new: true }
    )
    if (req.body.relatedBankAccount) {
      var amountUpdate = await Accounting.findOneAndUpdate(
        { _id: req.body.relatedBankAccount },
        { $inc: { amount: data.payAmount } }
      )
    } else if (req.body.relatedCash) {
      var amountUpdate = await Accounting.findOneAndUpdate(
        { _id: req.body.relatedCash },
        { $inc: { amount: data.payAmount } }
      )
    }
    res.status(200).send({
      message: 'MedicineSale Transaction success',
      success: true,
      fTrans: fTransUpdate,
      sTrans: secTransResult,
      accResult: accResult,
      data: medicineSaleResult
    });

  } catch (error) {
    console.log(error)
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.createMedicineSaleTransaction = async (req, res, next) => {
  try {
    let createdBy = req.credentials.id
    let relatedBranch = req.body.relatedBranch
    let medicineItemError = []
    let medicineItemFinished = []
    //first transaction 
    const fTransaction = new Transaction({
      "amount": req.body.amount,
      "date": req.body.date,
      "remark": req.body.remark,
      "relatedAccounting": "6423eb395fb841d5566db36d",
      "type": "Credit",
      "createdBy": createdBy,
      "relatedBranch": relatedBranch


    })
    const fTransResult = await fTransaction.save()
    var amountUpdate = await Accounting.findOneAndUpdate(
      { _id: "6423eb395fb841d5566db36d" },
      { $inc: { amount: data.payAmount } }
    )
    //sec transaction
    const secTransaction = new Transaction(
      {
        "amount": req.body.amount,
        "date": req.body.date,
        "remark": req.body.remark,
        "relatedBank": req.body.relatedBank,
        "relatedCash": req.body.relatedCash,
        "type": "Debit",
        "relatedTransaction": fTransResult._id,
        "createdBy": createdBy,
        "relatedBranch": relatedBranch
      }
    )
    const secTransResult = await secTransaction.save();
    var fTransUpdate = await Transaction.findOneAndUpdate(
      { _id: fTransResult._id },
      {
        relatedTransaction: secTransResult._id
      },
      { new: true }
    )
    if (req.body.relatedBankAccount) {
      var amountUpdate = await Accounting.findOneAndUpdate(
        { _id: req.body.relatedBankAccount },
        { $inc: { amount: req.body.amount } }
      )
    } else if (req.body.relatedCash) {
      var amountUpdate = await Accounting.findOneAndUpdate(
        { _id: req.body.relatedCash },
        { $inc: { amount: req.body.amount } }
      )
    }
    let objID = ''
    if (req.body.relatedBank) objID = req.body.relatedBank
    if (req.body.relatedCash) objID = req.body.relatedCash
    //transaction
    const acc = await Accounting.find({ _id: objID })
    const accResult = await Accounting.findOneAndUpdate(
      { _id: objID },
      { amount: parseInt(req.body.amount) + parseInt(acc[0].amount) },
      { new: true },
    )
    req.body = { ...req.body, createdBy: createdBy, relatedBranch: relatedBranch }
    console.log(req.body)
    let { medicineItems } = req.body
    if (medicineItems !== undefined) {
      medicineItems.map(async (e, i) => {
        if (e.stock < e.quantity) {
          medicineItemError.push(e)
        } else if (e.stock > e.quantity) {
          const result = await Stock.find({ _id: e.item_id, relatedBranch: relatedBranch })
          let totalUnit = e.stock - e.quantity
          let from = result[0].fromUnit
          let to = result[0].toUnit
          let currentQty = (from * totalUnit) / to
          try {
            medicineItemFinished.push(e)
            const result = await Stock.findOneAndUpdate(
              { _id: e.item_id, relatedBranch: relatedBranch },
              { totalUnit: totalUnit, currentQty: currentQty },
              { new: true },
            )

          } catch (error) {
            medicineItemError.push(e);
          }
          const logResult = await Log.create({
            "relatedProcedureItems": e.item_id,
            "currentQty": e.stock,
            "actualQty": e.quantity,
            "finalQty": totalUnit,
            "relatedBranch": relatedBranch,
            "type": "Medicine Sale",
            "createdBy": createdBy
          })
        }
      })
    }
    const newMedicineSale = new MedicineSale(req.body)
    const medicineSaleResult = newMedicineSale.save()
    res.status(200).send({
      message: 'MedicineSale Transaction success',
      success: true,
      fTrans: fTransUpdate,
      sTrans: secTransResult,
      accResult: accResult,
      data: medicineSaleResult,
      medicineItemFinished: medicineItemFinished,
      medicineItemError: medicineItemError
    });


  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};


exports.updateMedicineSale = async (req, res, next) => {
  try {
    const result = await MedicineSale.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedPatient relatedTransaction').populate('relatedAppointment').populate('medicineItems.item_id').populate('relatedTreatment').populate('createdBy');
    if (!result) return res.status(500).send({ error: true, message: 'Query Error!' })
    if (result === 0) return res.status(500).send({ error: true, message: 'No Records!' })
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteMedicineSale = async (req, res, next) => {
  try {
    const result = await MedicineSale.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateMedicineSale = async (req, res, next) => {
  try {
    const result = await MedicineSale.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.createCode = async (req, res, next) => {
  let data = {}
  try {
    const latestDocument = await MedicineSale.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
    if (latestDocument.length == 0) data = { ...data, seq: 1, voucherCode: "MVC-1" } // if seq is undefined set initial patientID and seq
    if (latestDocument.length) {
      const increment = latestDocument[0].seq + 1
      data = { ...data, voucherCode: "MVC-" + increment, seq: increment }
    }
    return res.status(200).send({
      success: true,
      data: data
    })
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err
    })
  }
}
exports.filterMedicineSales = async (req, res, next) => {
  try {
    let query = req.mongoQuery
    const { start, end } = req.query
    if (start && end) query.createdAt = { $gte: start, $lte: end }
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await MedicineSale.find(query).populate('relatedPatient relatedTransaction relatedBranch').populate('relatedAppointment').populate('medicineItems.item_id').populate('relatedTreatment').populate('createdBy', 'givenName');
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.getwithExactDate = async (req, res) => {
  try {
    let { exact } = req.query;
    const date = new Date(exact);
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Set start date to the beginning of the day
    const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1); // Set end date to the beginning of the next day
    let result = await MedicineSale.find({ createdAt: { $gte: startDate, $lt: endDate } }).populate('relatedPatient relatedTransaction relatedCash').populate('relatedAppointment').populate('medicineItems.item_id').populate('relatedTreatment').populate('createdBy')
    if (result.length === 0) return res.status(404).send({ error: true, message: 'Not Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}



exports.searchMedicineSale = async (req, res, next) => {
  try {
    let query = req.mongoQuery
    let { search } = req.body
    if (search) query.$text = { $search: search }
    const result = await MedicineSale.find(query).populate('relatedPatient medicineItems.item_id')
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.MedicineSaleFilter = async (req, res) => {
  let query = { relatedBank: { $exists: true }, isDeleted: false }
  try {
    const { start, end, relatedBranch, createdBy } = req.query
    if (start && end) query.createdAt = { $gte: start, $lt: end }
    if (relatedBranch) query.relatedBranch = relatedBranch
    if (createdBy) query.createdBy = createdBy
    const bankResult = await MedicineSale.find(query).populate('relatedBank relatedTreatment relatedPatient relatedAppointment medicineItems.item_id relatedCash relatedAccount relatedTransaction relatedBranch').populate('createdBy', 'givenName')
    const { relatedBank, ...query2 } = query;
    query2.relatedCash = { $exists: true };
    const cashResult = await MedicineSale.find(query2).populate('relatedBank relatedTreatment relatedPatient relatedAppointment medicineItems.item_id relatedCash relatedAccount relatedTransaction relatedBranch').populate('createdBy', 'givenName')
    const BankNames = bankResult.reduce((result, { relatedBank, totalAmount }) => {
      const { name } = relatedBank;
      result[name] = (result[name] || 0) + totalAmount;
      return result;
    }, {});
    const CashNames = cashResult.reduce((result, { relatedCash, totalAmount }) => {
      const { name } = relatedCash;
      result[name] = (result[name] || 0) + totalAmount;
      return result;
    }, {});
    const BankTotal = bankResult.reduce((total, sale) => total + sale.totalAmount, 0);
    const CashTotal = cashResult.reduce((total, sale) => total + sale.totalAmount, 0);

    return res.status(200).send({
      success: true,
      data: {
        BankList: bankResult,
        CashList: cashResult,
        BankNames: BankNames,
        CashNames: CashNames,
        BankTotal: BankTotal,
        CashTotal: CashTotal
      }
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}