'use strict';
const AdvanceRecord = require('../models/advanceRecord');

exports.listAllAdvanceRecords = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 10; //limit
        skip = +skip || 0;
        let query = req.mongoQuery,
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await AdvanceRecord.find(query).populate('relatedPatient recievedPatient')
        count = await AdvanceRecord.find(query).count();
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

exports.getAdvanceRecord = async (req, res) => {
    try {
        let query = req.mongoQuery
        if (req.params.id) query._id = req.params.id
        const result = await AdvanceRecord.find(query).populate('relatedPatient recievedPatient')
        if (result.length === 0)
            return res.status(500).json({ error: true, message: 'No Record Found' });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
};

exports.createAdvanceRecord = async (req, res, next) => {
    let newBody = req.body;
    newBody = { ...newBody, createdBy: req.credentials.id }
    try {
        const newAdvanceRecord = new AdvanceRecord(newBody);
        const result = await newAdvanceRecord.save();
        res.status(200).send({
            message: 'AdvanceRecord create success',
            success: true,
            data: result
        });
    } catch (error) {
        // console.log(error )
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateAdvanceRecord = async (req, res, next) => {
    try {
        const result = await AdvanceRecord.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedPatient recievedPatient')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteAdvanceRecord = async (req, res, next) => {
    try {
        const result = await AdvanceRecord.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateAdvanceRecord = async (req, res, next) => {
    try {
        const result = await AdvanceRecord.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
