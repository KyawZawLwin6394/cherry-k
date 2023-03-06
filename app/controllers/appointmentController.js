'use strict';
const Appointment = require('../models/appointment');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
var ObjectID = require("mongodb").ObjectID; //to check if the value is objectid or not

exports.listAllAppointments = async (req, res) => {
  try {
    let result = await Appointment.find({}).populate('patientName', 'name').populate('doctor','name');
    let count = await Appointment.find({}).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error:true, message:'No Record Found!'});
  }
};

exports.getAppointment = async (req, res) => {
  const result = await Appointment.find({ _id: req.params.id }).populate('patientName', 'name').populate('doctor','name');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createAppointment = async (req, res, next) => {
  try {
    if (req.body.patientStatus === 'New') {
      const newPatient=new Patient({
        name: req.body.patientName,
        phone:req.body.phone,
        patientStatus:req.body.patientStatus
      })
      console.log('here',newPatient)
      const patientResult = await newPatient.save();
      console.log(patientResult,'patientResult')
      req.body = { ...req.body, patientName:patientResult._id}
    }
    console.log(req.body)
    if (ObjectID.isValid(req.body.patientName) === false) return res.status(500).send({
      error:true,
      message:'Patient Name is not an ObjectID!'
    })
    const newAppointment = new Appointment(req.body);
    const result = await newAppointment.save();
    res.status(200).send({
      message: 'Appointment create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const result = await Appointment.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    );
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const result = await Appointment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateAppointment = async (req, res, next) => {
  try {
    const result = await Appointment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
