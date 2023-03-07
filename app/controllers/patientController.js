'use strict';
const Patient = require('../models/patient');

exports.listAllPatients = async (req, res) => {
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
    console.log(limit)
    let result = await Patient.find(query).limit(limit).skip(skip);
    count = await Patient.find(query).count();
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

  exports.getPatient = async (req, res) => {
    const result = await Patient.find({ _id: req.params.id });
    if (!result)
      return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
  };

  exports.createPatient = async (req, res, next) => {
    try {
      const newPatient = new Patient(req.body);
      const result = await newPatient.save();
      res.status(200).send({
        message: 'Patient create success',
        success: true,
        data: result
      });
    } catch (error) {
      return res.status(500).send({ "error": true, message: error.message })
    }
  };

  exports.updatePatient = async (req, res, next) => {
    try {
      const result = await Patient.findOneAndUpdate(
        { _id: req.body.id },
        req.body,
        { new: true },
      );
      return res.status(200).send({ success: true, data: result });
    } catch (error) {
      return res.status(500).send({ "error": true, "message": error.message })
    }
  };

  exports.deletePatient = async (req, res, next) => {
    try {
      const result = await Patient.findOneAndUpdate(
        { _id: req.params.id },
        { isDeleted: true },
        { new: true },
      );
      return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
      return res.status(500).send({ "error": true, "message": error.message })

    }
  };

  exports.activatePatient = async (req, res, next) => {
    try {
      const result = await Patient.findOneAndUpdate(
        { _id: req.params.id },
        { isDeleted: false },
        { new: true },
      );
      return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
      return res.status(500).send({ "error": true, "message": error.message })
    }
  };

  exports.filterPatients = async (req, res, next) => {
    try {
      let query={}
      let {gender,startDate,endDate,status} = req.query
      if (gender) query.gender= gender
      if (status) query.patientStatus = status
      if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
      const result = await Patient.find(query)
      if (result.length===0) return res.status(404).send({error:true, message:"No Record Found!"})
      res.status(200).send({success:true, data:result})
    } catch (err) {
      return res.status(500).send({error:true, message:err.message})
    }
  }
