'use strict';
const Patient = require('../models/Patient');
var mongoose = require('mongoose');

exports.listAllPatients = async (req, res) => {
  try {

    let result = await Patient.find(req.query);
    count = await Patient.find(query).count();
    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).send(await respond(false, error));
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
    return res.status(500).send({"error":true, message:error.message})
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
    return res.status(500).send({"error":true,"message":error.message})
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const result = await Patient.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: {isDeleted:result.isDeleted} });
  } catch (error) {
    return res.status(500).send({"error":true,"message":error.message})

  }
};

exports.activatePatient = async (req, res, next) => {
  try {
    const result = await Patient.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: {isDeleted:result.isDeleted} });
  } catch (error) {
    return res.status(500).send({"error":true,"message":error.message})
  }
};
