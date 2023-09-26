'use strict';
const AccessoryItemRecord = require('../models/accessoryItemRecord');

exports.listAllAccessoryItemRecordes = async (req, res) => {
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
    let result = await AccessoryItemRecord.find(query).populate('accessoryItems.item_id relatedBranch')
    count = await AccessoryItemRecord.find(query).count();
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

exports.getAccessoryItemRecord = async (req, res) => {
  const result = await AccessoryItemRecord.find({ _id: req.params.id,isDeleted:false }).populate('accessoryItems.item_id relatedBranch')
  if (result.length === 0)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createAccessoryItemRecord = async (req, res, next) => {
  let newBody = req.body;
  try {
    const newAccessoryItemRecord = new AccessoryItemRecord(newBody);
    const result = await newAccessoryItemRecord.save();
    res.status(200).send({
      message: 'AccessoryItemRecord create success',
      success: true,
      data: result
    });
  } catch (error) {
    // console.log(error )
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateAccessoryItemRecord = async (req, res, next) => {
  try {
    const result = await AccessoryItemRecord.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('accessoryItems.item_id relatedBranch')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteAccessoryItemRecord = async (req, res, next) => {
  try {
    const result = await AccessoryItemRecord.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateAccessoryItemRecord = async (req, res, next) => {
  try {
    const result = await AccessoryItemRecord.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
