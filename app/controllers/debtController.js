'use strict';
const Debt = require('../models/debt');

exports.listAllDebts = async (req, res) => {
    try {
        const { isPaid } = req.query
        let query = { isDeleted: false }
        if (isPaid) query.isPaid = isPaid
        let result = await Debt.find(query);
        let count = await Debt.find(query).count();
        res.status(200).send({
            success: true,
            count: count,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ error: true, message: 'No Record Found!' });
    }
};

exports.getDebt = async (req, res) => {
    const result = await Debt.find({ relatedPatient: req.params.id, isDeleted: false });
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createDebt = async (req, res, next) => {
    try {
        const newDebt = new Debt(req.body);
        const result = await newDebt.save();
        res.status(200).send({
            message: 'Debt create success',
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateDebt = async (req, res, next) => {
    try {
        const result = await Debt.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        );
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteDebt = async (req, res, next) => {
    try {
        const result = await Debt.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
};

exports.activateDebt = async (req, res, next) => {
    try {
        const result = await Debt.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};