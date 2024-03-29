'use strict';
const TreatmentSelection = require('../models/treatmentSelection');

exports.listAllTreatmentSelections = async (req, res) => {
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
        let result = await TreatmentSelection.find(query).limit(limit).skip(skip).populate('relatedTreatment');
        let count = await TreatmentSelection.find(query).count();
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
    } catch (error) {
        return res.status(500).send({ error: true, message: 'No Record Found!' });
    }
};

exports.getTreatmentSelection = async (req, res) => {
    const result = await TreatmentSelection.find({ _id: req.params.id,isDeleted:false }).populate('relatedTreatment');
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createTreatmentSelection = async (req, res, next) => {
    try {
        let data = req.body;
        if (data.paidAmount) {
            data= {...data, leftOverAmount:data.totalAmount-data.paidAmount} // leftOverAmount Calculation
        }
        if (data.paidAmount===0) data={...data, leftOverAmount:data.totalAmount}
        console.log(data)
        const newTreatmentSelection = new TreatmentSelection(data);
        const result = await newTreatmentSelection.save();
        res.status(200).send({
            message: 'Treatment Selection create success',
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateTreatmentSelection = async (req, res, next) => {
    try {
        let data = req.body; 
        if (data.paidAmount) {
            data= {...data, leftOverAmount:data.totalAmount-data.paidAmount} // leftOverAmount Calculation
        }
        if (data.paidAmount===0) data={...data, leftOverAmount:data.totalAmount}
        const result = await TreatmentSelection.findOneAndUpdate(
            { _id: req.body.id },
            data,
            { new: true },
        ).populate('relatedTreatment');
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteTreatmentSelection = async (req, res, next) => {
    try {
        const result = await TreatmentSelection.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
};

exports.activateTreatmentSelection = async (req, res, next) => {
    try {
        const result = await TreatmentSelection.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
