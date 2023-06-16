'use strict';
const Stock = require('../models/stock');
const ProcedureItems = require('../models/procedureItem');
const MedicineItems = require('../models/medicineItem');
const AccessoryItems = require('../models/accessoryItem');
const Branch = require('../models/branch');
const branch = require('../models/branch');

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

exports.copyStock = async (req, res) => {
    try {
        const procedureItems = await ProcedureItems.find({ isDeleted: false })
        const accessoryItems = await AccessoryItems.find({ isDeleted: false })
        const medicineItems = await MedicineItems.find({ isDeleted: false })
        const branches = await Branch.find({})
        for (let i = 0; i < procedureItems.length; i++) {
            console.log('here')
            for (let b = 0; b < branches.length; b++) {
                console.log('here2')
                var stockResult = await Stock.create(
                    {
                        "relatedBranch": branches[b]._id,
                        "relatedProcedureItems": procedureItems[i]._id,
                        "currentQty": procedureItems[i].currentQuantity,
                        "fromUnit": procedureItems[i].fromUnit,
                        "toUnit": procedureItems[i].toUnit,
                        "totalUnit": (procedureItems[i].currentQuantity * procedureItems[i].toUnit) / procedureItems[i].fromUnit
                    }
                )
                console.log(stockResult)
            }
        }

        for (let i = 0; i < medicineItems.length; i++) {
            console.log('here')
            for (let b = 0; b < branches.length; b++) {
                console.log('here2')
                var stockResult = await Stock.create(
                    {
                        "relatedBranch": branches[b]._id,
                        "relatedMedicineItems": medicineItems[i]._id,
                        "currentQty": medicineItems[i].currentQuantity,
                        "fromUnit": medicineItems[i].fromUnit,
                        "toUnit": medicineItems[i].toUnit,
                        "totalUnit": (medicineItems[i].currentQuantity * medicineItems[i].toUnit) / medicineItems[i].fromUnit
                    }
                )
                console.log(stockResult)
            }
        }

        for (let i = 0; i < accessoryItems.length; i++) {
            console.log('here')
            for (let b = 0; b < branches.length; b++) {
                console.log('here2')
                var stockResult = await Stock.create(
                    {
                        "relatedBranch": branches[b]._id,
                        "relatedAccessoryItems": accessoryItems[i]._id,
                        "currentQty": accessoryItems[i].currentQuantity,
                        "fromUnit": accessoryItems[i].fromUnit,
                        "toUnit": accessoryItems[i].toUnit,
                        "totalUnit": (accessoryItems[i].currentQuantity * accessoryItems[i].toUnit) / accessoryItems[i].fromUnit
                    }
                )
                console.log(stockResult)
            }
        }

        return res.status(200).send({ success: true, data: 'data' })
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
}

exports.checkReorder = async (req, res) => {
    let { relatedBranch } = req.query
}
