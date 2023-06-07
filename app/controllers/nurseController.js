'use strict';
const Nurse = require('../models/nurse');

exports.listAllNurses = async (req, res) => {
    try {
        let query = req.mongoQuery
        let result = await Nurse.find(query).populate('relatedBranch')
        let count = await Nurse.find(query).count();
        res.status(200).send({
            success: true,
            count: count,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ error: true, message: 'No Record Found!' });
    }
};

exports.getNurse = async (req, res) => {
    let query = req.mongoQuery
    if (req.params.id) query._id = req.params.id
    const result = await Nurse.find({ _id: req.params.id, isDeleted: false }).populate('relatedBranch');
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createNurse = async (req, res, next) => {
    try {
        const newNurse = new Nurse(req.body);
        const result = await newNurse.save();
        res.status(200).send({
            message: 'Nurse create success',
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateNurse = async (req, res, next) => {
    try {
        const result = await Nurse.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedBranch');
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteNurse = async (req, res, next) => {
    try {
        const result = await Nurse.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
};

exports.activateNurse = async (req, res, next) => {
    try {
        const result = await Nurse.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
