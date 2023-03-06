'use strict';
const Appointment = require('../models/appointment');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
var ObjectID = require("mongodb").ObjectID; //to check if the value is objectid or not

function formatDateAndTime(dateString) { // format mongodb ISO 8601 date format into two readable var {date, time}.
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // add 1 to zero-indexed month
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  const formattedDate = `${year}-${month}-${day}`;
  const formattedTime = `${hour}:${minute}`;

  return [formattedDate, formattedTime];
}

exports.listAllAppointments = async (req, res) => {
  try {
    let result = await Appointment.find({}).populate('patientName', 'name').populate('doctor', 'name');
    let count = await Appointment.find({}).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.getAppointment = async (req, res) => {
  const result = await Appointment.find({ _id: req.params.id }).populate('patientName', 'name').populate('doctor', 'name');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  /*const dateAndTime = formatDateAndTime(result[0].date)
  const { date, ...rest } = result[0].toObject() //deleting date from result[0] and putting it back into rest
  //adding toObject so that it dosen't spread everything from mongodb result
  const newResult = { ...rest, date: dateAndTime[0], time: dateAndTime[1] } //adding date and time to the body of res */
  return res.status(200).send({ success: true, data: result });
};

exports.createAppointment = async (req, res, next) => {
  try {
    if (req.body.patientStatus === 'New') { //If the patientStatus is new We'll save patient info first
      const newPatient = new Patient({
        name: req.body.patientName,
        phone: req.body.phone,
        patientStatus: req.body.patientStatus
      })
      const patientResult = await newPatient.save();
      req.body = { ...req.body, patientName: patientResult._id } //updating patientName into patientID so that we can ref it later
    }
    // After that we can create appointments with related patient id 
    // PatientName needs to be an ObjectID if the PatientStatus is 'Old'
    if (ObjectID.isValid(req.body.patientName) === false) return res.status(500).send({
      error: true,
      message: 'Patient Name is not an ObjectID!'
    })

    const dateAndTime = formatDateAndTime(req.body.originalDate)
    const newBody = { ...req.body, date: dateAndTime[0], time: dateAndTime[1] }
    console.log(newBody,'newBody')
    const newAppointment = new Appointment(newBody);
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
}

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
