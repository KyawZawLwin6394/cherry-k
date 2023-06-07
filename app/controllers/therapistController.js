'use strict';
const Therapist = require('../models/therapist');

exports.listAllTherapists = async (req, res) => {
  try {
    let query = req.mongoQuery
    let result = await Therapist.find(query).populate('relatedBranch');
    let count = await Therapist.find(query).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.getTherapist = async (req, res) => {
  let query = req.mongoQuery
  if (req.params.id) query._id = req.params.id
  const result = await Therapist.find(query).populate('relatedBranch');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createTherapist = async (req, res, next) => {
  try {
    const newTherapist = new Therapist(req.body);
    const result = await newTherapist.save();
    res.status(200).send({
      message: 'Therapist create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateTherapist = async (req, res, next) => {
  try {
    const result = await Therapist.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedBranch');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteTherapist = async (req, res, next) => {
  try {
    const result = await Therapist.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateTherapist = async (req, res, next) => {
  try {
    const result = await Therapist.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
