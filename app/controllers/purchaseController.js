'use strict';
const Purchase = require('../models/purchase');
const MedicineItems = require('../models/medicineItem');
const ProcedureItems = require('../models/procedureItem');
const AccessoryItems = require('../models/accessoryItem');
const Stock = require('../models/stock');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList');

exports.listAllPurchases = async (req, res) => {
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
        let result = await Purchase.find(query).populate('supplierName').populate('medicineItems.item_id').populate('procedureItems.item_id').populate('relatedBranch')
        count = await Purchase.find(query).count();
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

exports.getPurchase = async (req, res) => {
    const result = await Purchase.find({ _id: req.params.id, isDeleted: false }).populate('supplierName').populate('medicineItems.item_id').populate('procedureItems.item_id').populate('accessoryItems.item_id')
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.getCode = async (req, res) => {
    let data = {}
    try {
        let today = new Date().toISOString()
        const latestDocument = await Purchase.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
        if (latestDocument.length === 0) data = { ...data, seq: 1, code: "PC-" + "-1" } // if seq is undefined set initial patientID and seq
        if (latestDocument.length > 0) {
            const increment = latestDocument[0].seq + 1
            data = { ...data, code: "PC" + "-" + increment, seq: increment }
        }
        return res.status(200).send({ success: true, data: data })
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
}

exports.createPurchase = async (req, res, next) => {
    let data = req.body
    let { relatedBranch, relatedPurchaseAccount } = data
    try {
        if (relatedBranch !== undefined) {
            data.medicineItems.map(async function (element, index) {
                const result = await Stock.findOneAndUpdate(
                    { relatedMedicineItems: element.item_id, relatedBranch: relatedBranch },
                    { $inc: { currentQty: element.qty, totalUnit: element.totalUnit } },
                    { new: true },
                ).populate('supplierName').populate('medicineItems.item_id').populate('procedureItems.item_id')
            })
            data.procedureItems.map(async function (element, index) {
                const result = await Stock.findOneAndUpdate(
                    { relatedProcedureItems: element.item_id, relatedBranch: relatedBranch },
                    { $inc: { currentQty: element.qty, totalUnit: element.totalUnit } },
                    { new: true },
                ).populate('name').populate('relatedCategory').populate('relatedBrand').populate('relatedSubCategory')
            })
            data.accessoryItems.map(async function (element, index) {
                const result = await Stock.findOneAndUpdate(
                    { relatedAccessoryItems: element.item_id, relatedBranch: relatedBranch },
                    { $inc: { currentQty: element.qty, totalUnit: element.totalUnit } },
                    { new: true },
                ).populate('name').populate('relatedCategory').populate('relatedBrand').populate('relatedSubCategory')
            })
        } else if (relatedBranch === undefined) {
            data.medicineItems.map(async function (element, index) {
                const result = await MedicineItems.findOneAndUpdate(
                    { _id: element.item_id },
                    { $inc: { currentQuantity: element.qty, totalUnit: element.totalUnit } },
                    { new: true },
                ).populate('supplierName').populate('medicineItems.item_id').populate('procedureItems.item_id')
            })
            data.procedureItems.map(async function (element, index) {
                const result = await ProcedureItems.findOneAndUpdate(
                    { _id: element.item_id },
                    { $inc: { currentQuantity: element.qty, totalUnit: element.totalUnit } },
                    { new: true },
                ).populate('name').populate('relatedCategory').populate('relatedBrand').populate('relatedSubCategory')
            })
            data.accessoryItems.map(async function (element, index) {
                const result = await AccessoryItems.findOneAndUpdate(
                    { _id: element.item_id },
                    { $inc: { currentQuantity: element.qty, totalUnit: element.totalUnit } },
                    { new: true },
                ).populate('name').populate('relatedCategory').populate('relatedBrand').populate('relatedSubCategory')
            })
        }
        data = { ...data, relatedBranch: relatedBranch }
        const newPurchase = new Purchase(data);
        const result = await newPurchase.save();

        const transResult = await Transaction.create({
            "amount": data.totalPrice,
            "date": Date.now(),
            "remark": data.remark,
            "type": "Credit",
            "relatedTransaction": null,
            "relatedAccounting": "646733d659a9bc811d97efa9", //Opening Stock
            "relatedBranch": relatedBranch
        })
        const transResultAmtUpdate = await Accounting.findOneAndUpdate(
            { _id: '646733d659a9bc811d97efa9' },
            { $inc: { amount: data.totalPrice } }
        )
        //64ae1fea12b3d31436d4805f Purchase
        const purchaseResult = await Transaction.create({
            "amount": data.totalPrice,
            "date": Date.now(),
            "remark": data.remark,
            "type": "Debit",
            "relatedTransaction": null,
            "relatedAccounting": relatedPurchaseAccount, //Purchase
        })
        const purchaseAMTUpdate = await Accounting.findOneAndUpdate(
            { _id: relatedPurchaseAccount },
            { $inc: { amount: data.totalPrice } }
        )
        var fTransUpdate = await Transaction.findOneAndUpdate(
            { _id: transResult._id },
            {
                relatedTransaction: purchaseResult._id
            },
            { new: true }
        )
        const transUpdate = await Transaction.findOneAndUpdate({ _id: transResult._id }, { "relatedTransaction": secTranResult._id })
        res.status(200).send({
            message: 'Purchase create success',
            success: true,
            data: result,
            transResult: transResult
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updatePurchase = async (req, res, next) => {
    try {
        const result = await Purchase.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('supplierName').populate('medicineItems.item_id').populate('procedureItems.item_id')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deletePurchase = async (req, res, next) => {
    try {
        const result = await Purchase.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activatePurchase = async (req, res, next) => {
    try {
        const result = await Purchase.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
