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
    let result = await Appointment.find(query).limit(limit).skip(skip).populate('patientName', 'name').populate('doctor', 'name').populate('patientStatus', 'patientStatus');
    console.log(result)
    count = await Appointment.find(query).count();
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

exports.getAppointment = async (req, res) => {
  const result = await Appointment.find({ _id: req.params.id }).populate('patientName', 'name').populate('doctor', 'name').populate('patientStatus', 'patientStatus');
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
    if (ObjectID.isValid(req.body.patientName) === false) return res.status(500).send({
      error: true,
      message: 'Appointment Name is not an ObjectID!'
    })

    const dateAndTime = formatDateAndTime(req.body.originalDate)
    const newBody = { ...req.body, date: dateAndTime[0], time: dateAndTime[1] }
    console.log(newBody, 'newBody')
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

exports.filterAppointments = async (req, res, next) => {
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

exports.searchAppointment = async (req, res, next) => {
  try {
    console.log(req.body.search)
    const result = await Appointment.find({ $text: { $search: req.body.search } })
    if (result.length===0) return res.status(404).send({error:true, message:'No Record Found!'})
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}
