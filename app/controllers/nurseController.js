'use strict';
const Nurse = require('../models/nurse');

exports.listAllNurses = async (req, res) => {
    try {
        let result = await Nurse.find({ isDeleted: false });
        let count = await Nurse.find({ isDeleted: false }).count();
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
    const result = await Nurse.find({ _id: req.params.id, isDeleted: false });
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
        );
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
