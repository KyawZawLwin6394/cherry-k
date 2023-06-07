'use strict';
const Doctor = require('../models/doctor');

exports.listAllDoctors = async (req, res) => {
  try {
    let query = req.mongoQuery
    let result = await Doctor.find(query).populate('relatedBranch');
    let count = await Doctor.find(query).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error:true, message:'No Record Found!'});
  }
};

exports.getDoctor = async (req, res) => {
  let query = req.mongoQuery
  if (req.params.id) query._id = req.params.id
  const result = await Doctor.find({ _id: req.params.id,isDeleted:false }).populate('relatedBranch');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createDoctor = async (req, res, next) => {
  try {
    const newDoctor = new Doctor(req.body);
    const result = await newDoctor.save();
    res.status(200).send({
      message: 'Doctor create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const result = await Doctor.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedBranch')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const result = await Doctor.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateDoctor = async (req, res, next) => {
  try {
    const result = await Doctor.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
