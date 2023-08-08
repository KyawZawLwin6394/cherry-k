'use strict';
const Transaction = require('../models/transaction');

exports.listAllTransactions = async (req, res) => {
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
    let result = await Transaction.find(query).populate('createdBy relatedAccounting').populate('relatedTreatment').populate('relatedTransaction').populate('relatedBank').populate('relatedCash');
    count = await Transaction.find(query).count();
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

exports.getTransaction = async (req, res) => {
  const result = await Transaction.find({ _id: req.params.id, isDeleted: false }).populate({
    path: 'relatedAccounting',
    model: 'AccountingLists',
    populate: {
      path: 'relatedHeader',
      model: 'AccountHeaders'
    }
  }).populate('relatedTreatment').populate({
    path: 'relatedTransaction',
    model: 'Transactions',
    populate: {
      path: 'relatedAccounting',
      model: 'AccountingLists'
    }
  }).populate('relatedBank').populate('relatedCash');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedTransaction = async (req, res) => {
  const result = await Transaction.find({ relatedAccounting: req.params.id, isDeleted: false }).populate('relatedAccounting').populate('relatedTreatment').populate('relatedBank').populate('relatedCash').populate({
    path:'relatedTransaction',
    model:'Transactions',
    populate:{
      path:'relatedAccounting',
      model:'AccountingLists'
    }
  })
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createTransaction = async (req, res, next) => {
  try {
    const newBody = req.body;
    const newTransaction = new Transaction(newBody);
    const result = await newTransaction.save();
    res.status(200).send({
      message: 'Transaction create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const result = await Transaction.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedAccounting').populate('createdBy relatedTreatment').populate('relatedTransaction').populate('relatedBank').populate('relatedCash');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const result = await Transaction.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateTransaction = async (req, res, next) => {
  try {
    const result = await Transaction.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.trialBalance = async (req, res) => {
  try {
    const result = await Transaction.find({ relatedAccounting: req.params.relatedAccounting, type: 'Debit' }).populate('createdBy relatedAccounting relatedTreatment relatedBank relatedCash relatedTransaction relatedMedicineSale');
    if (result.length === 0) return res.status(500).send({ error: true, message: 'Data Not Found!' })
    return res.status(200).send({ success: true, debit: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }

}

exports.getRelatedTransactionExpense = async (req, res) => {
  const result = await Transaction.find({ relatedExpense: req.params.id, isDeleted: false }).populate('relatedAccounting').populate('relatedTransaction').populate('relatedBank').populate('relatedCash').populate('relatedExpense');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedTransactionIncome = async (req, res) => {
  const result = await Transaction.find({ relatedIncome: req.params.id, isDeleted: false }).populate('relatedAccounting').populate('relatedTransaction').populate('relatedBank').populate('relatedCash').populate('relatedIncome');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.bankCashTransactionReport = async (req, res) => {
  let { start, end, type, account } = req.query
  let query = { isDeleted: false }
  let [name, total] = ['', 0]
  try {
    if (start && end) query.date = { $gte: start, $lte: end }
    if (type === 'Bank') query.relatedBank = account
    if (type === 'Cash') query.relatedCash = account
    console.log(query)
    const transactionResult = await Transaction.find(query).populate('relatedAccounting relatedTreatment relatedBank relatedCash relatedMedicineSale relatedBranch relatedIncome relatedExpense').populate('createdBy', 'givenName').populate({
      path: 'relatedTransaction',
      model: 'Transactions',
      populate: ('relatedAccounting relatedTreatment relatedBank relatedCash relatedMedicineSale relatedBranch relatedIncome relatedExpense')
    })
    if (type === 'Bank') {
      name = transactionResult.reduce((result, { relatedBank, amount }) => {
        const { name } = relatedBank;
        result[name] = (result[name] || 0) + parseInt(amount);
        return result;
      }, {});
      total = transactionResult.reduce((total, sale) => total + parseInt(sale.amount), 0);
    } else {
      name = transactionResult.reduce((result, { relatedCash, amount }) => {
        const { name } = relatedCash;
        result[name] = (result[name] || 0) + parseInt(amount);
        return result;
      }, {});
      total = transactionResult.reduce((total, sale) => total + parseInt(sale.amount), 0);
    }
    return res.status(200).send({ success: true, data: transactionResult, names: name, total: total })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
} 
