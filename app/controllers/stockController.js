'use strict';
const Stock = require('../models/stock');

exports.listAllStocks = async (req, res) => {
    let query = req.mongoQuery
    try {
        let result = await Stock.find(query).populate('relatedBranch relatedProcedureItems relatedMedicineItems relatedAccessoryItems relatedMachine')
        let count = await Stock.find(query).count();
        res.status(200).send({
            success: true,
            count: count,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ error: true, message: 'No Record Found!' });
    }
};

exports.getStock = async (req, res) => {
    let query = req.mongoQuery
    if (req.params.id) query._id = req.params.id
    const result = await Stock.find(query).populate('relatedBranch relatedProcedureItems relatedMedicineItems relatedAccessoryItems relatedMachine')
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createStock = async (req, res, next) => {
    try {
        const newStock = new Stock(req.body);
        const result = await newStock.save();
        res.status(200).send({
            message: 'Stock create success',
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateStock = async (req, res, next) => {
    try {
        const result = await Stock.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedBranch relatedProcedureItems relatedMedicineItems relatedAccessoryItems relatedMachine')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteStock = async (req, res, next) => {
    try {
        const result = await Stock.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
};

exports.activateStock = async (req, res, next) => {
    try {
        const result = await Stock.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
