'use strict';
const MedicineList = require('../models/medicineList');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');

exports.listAllMedicineLists = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 10; //limit
    skip = +skip || 0;
    let query = {},
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    let result = await MedicineList.find(query).limit(limit).skip(skip).populate('patientName', 'name').populate('doctor', 'name').populate('patientStatus', 'patientStatus');
    console.log(result)
    count = await MedicineList.find(query).count();
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
    //return res.status(500).send({ error: true, message: e.message });
  }
};

exports.getMedicineList = async (req, res) => {
  const result = await MedicineList.find({ _id: req.params.id }).populate('brand');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createMedicineList = async (req, res, next) => {
  try {
    if (ObjectID.isValid(req.body.patientName) === false) return res.status(500).send({
      error: true,
      message: 'MedicineList Name is not an ObjectID!'
    })

    const dateAndTime = formatDateAndTime(req.body.originalDate)
    const newBody = { ...req.body, date: dateAndTime[0], time: dateAndTime[1] }
    console.log(newBody, 'newBody')
    const newMedicineList = new MedicineList(newBody);
    const result = await newMedicineList.save();
    res.status(200).send({
      message: 'MedicineList create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateMedicineList = async (req, res, next) => {
  try {
    const result = await MedicineList.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    );
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteMedicineList = async (req, res, next) => {
  try {
    const result = await MedicineList.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateMedicineList = async (req, res, next) => {
  try {
    const result = await MedicineList.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.filterMedicineLists = async (req, res, next) => {
  try {
    let query = {}
    const { today,token,phone } = req.query
    var start = new Date();
    start.setHours(0, 0, 0, 0); // set start date
    var end = new Date();
    end.setHours(23, 59, 59, 999) //set end date to be 24 hours
    if (today) query.createdAt = {$gte:start, $lte:end}
    if (token) query.token = token
    if(phone) query.phone = phone
    if (Object.keys(query).length === 0) return res.status(404).send({error:true, message: 'Please Specify A Query To Use This Function'})
    const result = await Patient.find(query)
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.searchMedicineList = async (req, res, next) => {
  try {
    console.log(req.body.search)
    const result = await MedicineList.find({ $text: { $search: req.body.search } })
    if (result.length===0) return res.status(404).send({error:true, message:'No Record Found!'})
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}
