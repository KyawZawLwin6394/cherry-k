'use strict';
const Income = require('../models/income');
const Transaction = require('../models/transaction')
const Bank = require('../models/bank');
const Accounting = require('../models/accountingList');

exports.listAllIncomes = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 30; //limit
    skip = +skip || 0;
    let query = req.mongoQuery,
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    let result = await Income.find(query).populate('relatedBranch').populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount');
    count = await Income.find(query).count();
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

exports.getIncome = async (req, res) => {
  let query = req.mongoQuery
  if (req.params.id) query._id = req.params.id
  const result = await Income.find(query).populate('relatedBranch').populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createIncome = async (req, res, next) => {
  try {
    const newBody = req.body;
    const newIncome = new Income(newBody);
    const result = await newIncome.save();
    const populatedResult = await Income.find({ _id: result._id }).populate('relatedBranch').populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
    // const bankResult = await Bank.findOneAndUpdate(
    //   { _id: req.body.id },
    //   { $inc: { balance: 50 } },
    //   { new: true },
    // ).populate('relatedAccounting');
    const firstTransaction =
    {
      "initialExchangeRate": newBody.initialExchangeRate,
      "amount": newBody.finalAmount,
      "date": newBody.date,
      "remark": newBody.remark,
      "type": "Credit",
      "relatedTreatment": newBody.relatedTreatment,
      "treatmentFlag": false,
      "relatedTransaction": null,
      "relatedAccounting": newBody.relatedAccounting,
      "relatedIncome": result._id,
      "relatedBranch": newBody.relatedBranch
    }
    const newTrans = new Transaction(firstTransaction)
    const fTransResult = await newTrans.save();
    if (newBody.relatedAccounting) {
      var amountUpdate = await Accounting.findOneAndUpdate(
        { _id: newBody.relatedAccounting },
        { $inc: { amount: newBody.finalAmount } }
      )
    }
    if (req.body.relatedCredit) {
      //credit
      const secondTransaction = {
        "initialExchangeRate": newBody.initialExchangeRate,
        "amount": newBody.finalAmount,
        "date": newBody.date,
        "remark": newBody.remark,
        "type": "Debit",
        "relatedTreatment": newBody.relatedTreatment,
        "treatmentFlag": false,
        "relatedTransaction": fTransResult._id,
        "relatedAccounting": newBody.relatedAccounting,
        "relatedIncome": result._id,
        "relatedBranch": newBody.relatedBranch,
        "relatedCredit": newBody.relatedCredit
      }
      const secTrans = new Transaction(secondTransaction)
      var secTransResult = await secTrans.save();

      var fTransUpdate = await Transaction.findOneAndUpdate(
        { _id: fTransResult._id },
        {
          relatedTransaction: secTransResult._id
        },
        { new: true }
      )
    } else {
      //bank or cash
      const secondTransaction = {
        "initialExchangeRate": newBody.initialExchangeRate,
        "amount": newBody.finalAmount,
        "date": newBody.date,
        "remark": newBody.remark,
        "type": "Debit",
        "relatedTreatment": newBody.relatedTreatment,
        "treatmentFlag": false,
        "relatedTransaction": fTransResult._id,
        "relatedAccounting": (newBody.relatedBankAccount) ? newBody.relatedBankAccount : newBody.relatedCashAccount,
        "relatedIncome": result._id,
        "relatedBank": newBody.relatedBankAccount,
        "relatedCash": newBody.relatedCashAccount,
        "relatedBranch": newBody.relatedBranch
      }
      const secTrans = new Transaction(secondTransaction)
      var secTransResult = await secTrans.save();
      var fTransUpdate = await Transaction.findOneAndUpdate(
        { _id: fTransResult._id },
        {
          relatedTransaction: secTransResult._id
        },
        { new: true }
      )
      if (newBody.relatedBankAccount) {
        var amountUpdate = await Accounting.findOneAndUpdate(
          { _id: newBody.relatedBankAccount },
          { $inc: { amount: newBody.finalAmount } }
        )
      } else if (newBody.relatedCash) {
        var amountUpdate = await Accounting.findOneAndUpdate(
          { _id: newBody.relatedCash },
          { $inc: { amount: newBody.finalAmount } }
        )
      }
    }

    console.log(result, fTransResult, secTransResult)
    res.status(200).send({
      message: 'Income create success',
      success: true,
      data: populatedResult,
      firstTrans: fTransUpdate,
      secTrans: secTransResult
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateIncome = async (req, res, next) => {
  try {
    const result = await Income.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedBranch').populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteIncome = async (req, res, next) => {
  try {
    const result = await Income.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateIncome = async (req, res, next) => {
  try {
    const result = await Income.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.getwithExactDate = async (req, res) => {
  try {
    let { date } = req.query
    let result = await Income.find({ date: date }).populate('relatedBranch').populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount');
    if (result.length === 0) return res.status(404).send({ error: true, message: 'Not Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })

  }
}

exports.incomeFilter = async (req, res) => {
  let query = { relatedBankAccount: { $exists: true } }
  try {
    const { start, end, relatedBranch, createdBy } = req.query
    if (start && end) query.date = { $gte: start, $lt: end }
    if (relatedBranch) query.relatedBranch = relatedBranch
    if (createdBy) query.createdBy = createdBy
    const bankResult = await Income.find(query).populate('relatedBankAccount')
    const { relatedBankAccount, ...query2 } = query;
    query2.relatedCashAccount = { $exists: true };
    const cashResult = await Income.find(query2).populate('relatedCashAccount')
    const BankNames = bankResult.reduce((result, { relatedBankAccount, finalAmount }) => {
      const { name } = relatedBankAccount;
      result[name] = (result[name] || 0) + finalAmount;
      return result;
    }, {});
    const CashNames = cashResult.reduce((result, { relatedCashAccount, finalAmount }) => {
      const { name } = relatedCashAccount;
      result[name] = (result[name] || 0) + finalAmount;
      return result;
    }, {});
    const BankTotal = bankResult.reduce((total, sale) => total + sale.finalAmount, 0);
    const CashTotal = cashResult.reduce((total, sale) => total + sale.finalAmount, 0);

    return res.status(200).send({
      success: true,
      data: {
        BankList: bankResult,
        CashList: cashResult,
        BankNames: BankNames,
        CashNames: CashNames,
        BankTotal: BankTotal,
        CashTotal: CashTotal
      }
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}
