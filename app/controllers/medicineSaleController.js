'use strict';
const MedicineSale = require('../models/medicineSale');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList')

exports.listAllMedicineSales = async (req, res) => {
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
    let result = await MedicineSale.find(query).limit(limit).skip(skip).populate('relatedPatient').populate('relatedAppointment').populate('medicineItems.item_id').populate('relatedTreatment');
    console.log(result)
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
    console.log(e)
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.getMedicineSale = async (req, res) => {
  const result = await MedicineSale.find({ _id: req.params.id, isDeleted: false }).populate('relatedPatient').populate('relatedAppointment').populate('medicineItems._id');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createMedicineSale = async (req, res, next) => {
  let data = req.body;
  try {
    //prepare CUS-ID
    const latestDocument =await MedicineSale.find({},{seq:1}).sort({_id: -1}).limit(1).exec();
    console.log(latestDocument)
    if (latestDocument.length === 0) data= {...data, seq:'1', voucherCode:"MVC-1"} // if seq is undefined set initial patientID and seq
    console.log(data)
    if (latestDocument.length) {
      const increment = latestDocument[0].seq+1
      data = {...data, voucherCode:"MVC-"+increment, seq:increment}
    }
    console.log(data)
    const newMedicineSale = new MedicineSale(req.body);
    const result = await newMedicineSale.save();
    res.status(200).send({
      message: 'MedicineSale create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.createMedicineSaleTransaction = async (req, res, next) => {
  try {
    //first transaction 
    const fTransaction = new Transaction({
      "amount": req.body.amount,
      "date": req.body.date,
      "remark": req.body.remark,
      "relatedAccounting": req.body.relatedAccounting,
      "type": "Credit"
    })
    const fTransResult = await fTransaction.save()
    const secTransaction = new Transaction(
      {
        "amount": req.body.amount,
        "date": req.body.date,
        "remark": req.body.remark,
        "relatedAccounting": req.body.relatedAccounting,
        "relatedBank": req.body.relatedBank,
        "relatedCash": req.body.relatedCash,
        "type": "Debit",
        "relatedTransaction":fTransResult._id
      }
    )
    const secTransResult = await secTransaction.save();
    let objID= ''
    if (req.body.relatedBank) objID=req.body.relatedBank
    if (req.body.relatedCash) objID=req.body.relatedCash
    const acc = await Accounting.find({_id:objID})
    const accResult = await Accounting.findOneAndUpdate(
      { _id: objID },
      {amount:parseInt(req.body.amount)+parseInt(acc[0].amount)},
      { new: true },
    )
    res.status(200).send({
      message: 'MedicineSale Transaction success',
      success: true,
      fTrans:fTransResult,
      sTrans:secTransResult,
      accResult:accResult
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
    );
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

