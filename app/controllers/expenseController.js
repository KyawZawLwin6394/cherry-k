'use strict';
const Expense = require('../models/expense');
const Transaction = require('../models/transaction');

exports.listAllExpenses = async (req, res) => {
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
        let result = await Expense.find(query).limit(limit).skip(skip).populate('initialCurrency').populate('finalCurrency').populate('relatedAccounting');
        console.log(result)
        count = await Expense.find(query).count();
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

exports.getExpense = async (req, res) => {
    const result = await Expense.find({ _id: req.params.id, isDeleted: false }).populate('initialCurrency').populate('finalCurrency').populate('relatedAccounting')
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createExpense = async (req, res, next) => {
    try {
        const newBody = req.body;
        const newExpense = new Expense(newBody);
        const result = await newExpense.save();
        const firstTransaction =
        {
            "initialExchangeRate":newBody.initialExchangeRate,
            "amount": newBody.finalAmount,
            "date": newBody.date,
            "remark": newBody.remark,
            "type": "Debit",
            "relatedTreatment": newBody.relatedTreatment,
            "treatmentFlag": false,
            "relatedTransaction": null,
            "relatedAccounting": newBody.relatedAccounting
        }
        const newTrans = new Transaction(firstTransaction)
        const fTransResult = await newTrans.save();
        console.log(fTransResult)
        const secondTransaction = {
            "initialExchangeRate":newBody.initialExchangeRate,
            "amount": newBody.finalAmount,
            "date": newBody.date,
            "remark": newBody.remark,
            "type": "Debit",
            "relatedTreatment": newBody.relatedTreatment,
            "treatmentFlag": false,
            "relatedTransaction": fTransResult._id,
            "relatedAccounting": newBody.relatedAccounting,
            "relatedBank": newBody.relatedBank,
            "relatedCash": newBody.relatedCash
        }
        const secTrans = new Transaction(secondTransaction)
        const secTransResult = await secTrans.save();
        console.log(secTransResult)

        res.status(200).send({
            message: 'Expense create success',
            success: true,
            data: result,
            firstTrans: fTransResult,
            secTrans : secTransResult
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateExpense = async (req, res, next) => {
    try {
        const result = await Expense.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedAccounting').populate('initialCurrency').populate('finalCurrency');
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteExpense = async (req, res, next) => {
    try {
        const result = await Expense.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateExpense = async (req, res, next) => {
    try {
        const result = await Expense.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
