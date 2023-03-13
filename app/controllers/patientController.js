'use strict';
const Patient = require('../models/patient');
const Attachment = require('../models/attachment');

exports.listAllPatients = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 10; //limit
    skip = +skip || 0;
    let query = {isDeleted:false},
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    console.log(limit)
    let result = await Patient.find(query).limit(limit).skip(skip).populate('img');
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
  const result = await Patient.find({ _id: req.params.id, isDeleted:false }).populate('img');
  if (!result)
    return res.status(500).json({ error: true, message: 'Query Failed!' });
  if (result.length === 0) return res.status(404).send({error:true, message: 'No Record Found!'})
  return res.status(200).send({ success: true, data: result });
};

exports.createPatient = async (req, res, next) => {
  let data = req.body;
  let files = req.files;
  try {
    //prepare CUS-ID
    const latestDocument =await Patient.find({},{seq:1}).sort({_id: -1}).limit(1).exec();
    if (!latestDocument[0].seq) data= {...data, seq:'1', patientID:"CUS-001"} // if seq is undefined set initial patientID and seq
    console.log('here')
    if (latestDocument[0].seq) {
      const increment = latestDocument[0].seq+1
      data = {...data, patientID:"CUS-"+increment, seq:increment}
    }
    console.log(data)
    if (files.img !== undefined) {
      let imgPath = files.img[0].path.split('cherry-k')[1];
      const attachData = {
        fileName: files.img[0].originalname,
        imgUrl: imgPath,
      };
      const newAttachment = new Attachment(attachData);
      const attachResult = await newAttachment.save();
      data = { ...data, img: attachResult._id.toString()};
    } //prepare img and save it into attachment schema

    const newPatient = new Patient(data);
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
  let data = req.body;
  let files = req.files;
  try {
    if (files.img !== undefined) {
      let imgPath = files.img[0].path.split('cherry-k')[1];
      const attachData = {
        fileName: files.img[0].originalname,
        imgUrl: imgPath,
      };
      const newAttachment = new Attachment(attachData);
      const attachResult = await newAttachment.save();
      data = { ...data, img: attachResult._id.toString()};
    } //prepare img and save it into attachment schema

    const result = await Patient.findOneAndUpdate(
      { _id: req.body.id },
      {$set: data},
      { new: true },
    ).populate('img');
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
    let query = {}
    let { gender, startDate, endDate, status } = req.query
    if (gender) query.gender = gender
    if (status) query.patientStatus = status
    if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await Patient.find(query)
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.searchPatients = async (req, res, next) => {
  try {
    const result = await Patient.find({ $text: { $search: req.body.search } })
    if (result.length===0) return res.status(404).send({error:true, message:'No Record Found!'})
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}
