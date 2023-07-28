'use strict';
const PurchaseRequest = require('../models/purchaseRequest');
const MedicineItems = require('../models/medicineItem');
const ProcedureItems = require('../models/procedureItem');
const AccessoryItems = require('../models/accessoryItem');
const Stock = require('../models/stock');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList');

exports.listAllPurchaseRequests = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 10; //limit
        skip = +skip || 0;
        let query = { isDeleted: false },
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await PurchaseRequest.find(query).populate('medicineItems.item_id').populate('procedureItems.item_id').populate('relatedBranch').populate('accessoryItems.item_id')
        count = await PurchaseRequest.find(query).count();
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

exports.getPurchaseRequest = async (req, res) => {
    const result = await PurchaseRequest.find({ _id: req.params.id, isDeleted: false }).populate('medicineItems.item_id').populate('procedureItems.item_id').populate('accessoryItems.item_id relatedBranch')
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.getCode = async (req, res) => {
    let data = {}
    try {
        let today = new Date().toISOString()
        const latestDocument = await PurchaseRequest.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
        if (latestDocument.length === 0) data = { ...data, seq: 1, code: "PR-" + "-1" } // if seq is undefined set initial patientID and seq
        if (latestDocument.length > 0) {
            const increment = latestDocument[0].seq + 1
            data = { ...data, code: "PR" + "-" + increment, seq: increment }
        }
        return res.status(200).send({ success: true, data: data })
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
}

exports.createPurchaseRequest = async (req, res, next) => {
    let data = req.body
    let { relatedBranch } = data
    try {
        data = { ...data, relatedBranch: relatedBranch }
        const newPurchaseRequest = new PurchaseRequest(data);
        const result = await newPurchaseRequest.save();
        res.status(200).send({
            message: 'PurchaseRequest create success',
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updatePurchaseRequest = async (req, res, next) => {
    try {
        const result = await PurchaseRequest.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('medicineItems.item_id').populate('procedureItems.item_id').populate('accessoryItems.item_id')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deletePurchaseRequest = async (req, res, next) => {
    try {
        const result = await PurchaseRequest.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activatePurchaseRequest = async (req, res, next) => {
    try {
        const result = await PurchaseRequest.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
