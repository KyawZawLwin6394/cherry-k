'use strict';
const PatientTreatment = require('../models/patientTreatment');

exports.listAllPatientTreatments = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 20; //limit
    skip = +skip || 0;
    let query = {isDeleted:false},
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    console.log(query)
    let result = await PatientTreatment.find(query).limit(limit).skip(skip).populate('relatedPatient').populate('relatedTreatment');
    console.log(result)
    count = await PatientTreatment.find(query).count();
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

exports.getPatientTreatment = async (req, res) => {
  const result = await PatientTreatment.find({ _id: req.params.id,isDeleted:false }).populate('relatedPatient').populate('relatedTreatment')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createPatientTreatment = async (req, res, next) => {
  try {
    let data = req.body
    if (data.leftOverAmount==0) data = {...data, fullyPaid:false}
    const newBody = data;
    const newPatientTreatment = new PatientTreatment(newBody);
    const result = await newPatientTreatment.save();
    res.status(200).send({
      message: 'PatientTreatment create success',
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error )
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updatePatientTreatment = async (req, res, next) => {
  try {
    let data = req.body;
    if (data.leftOverAmount==0) data = {...data, fullyPaid:false}
    const result = await PatientTreatment.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    )
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deletePatientTreatment = async (req, res, next) => {
  try {
    const result = await PatientTreatment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activatePatientTreatment = async (req, res, next) => {
  try {
    const result = await PatientTreatment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};