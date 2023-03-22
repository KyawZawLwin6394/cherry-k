'use strict';
const Treatment = require('../models/treatment');
const Appointment = require('../models/appointment');

exports.listAllTreatments = async (req, res) => {
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
    let result = await Treatment.find(query).limit(limit).skip(skip).populate('relatedAppointment').populate('relatedDoctor').populate('relatedTherapist').populate('relatedPatient').populate('procedureMedicine.item_id');
    console.log(result)
    count = await Treatment.find(query).count();
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

exports.getTreatment = async (req, res) => {
  const result = await Treatment.find({ _id: req.params.id, isDeleted: false }).populate('relatedAppointment').populate('relatedDoctor').populate('relatedTherapist').populate('relatedPatient').populate('procedureMedicine.item_id')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createTreatment = async (req, res, next) => {
  let data = req.body;
  try {
    console.log(data)
    const newBody = data;
    const newTreatment = new Treatment(newBody);
    const result = await newTreatment.save();
    res.status(200).send({
      message: 'Treatment create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateTreatment = async (req, res, next) => {
  try {
    const result = await Treatment.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedAppointment').populate('relatedDoctor').populate('relatedTherapist').populate('relatedPatient').populate('procedureMedicine.item_id')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteTreatment = async (req, res, next) => {
  try {
    const result = await Treatment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateTreatment = async (req, res, next) => {
  try {
    const result = await Treatment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
