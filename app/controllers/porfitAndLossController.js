'use strict';
const Log = require('../models/log');
const MedicineSale = require('../models/medicineSale');
const TreatmentVoucher = require('../models/treatmentVoucher');
const Expense = require('../models/expense');
const Income = require('../models/income');

exports.getTotal = async (req, res) => {
    try {
        const MSTotal = await MedicineSale.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$totalAmount' // Replace 'totalAmount' with the desired field name
                    }
                }
            }
        ]);

        const pipeline = [
            {
                $group: {
                    _id: '$paymentMethod',
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ];

        const pipeline2 = [
            {
                $group: {
                    _id: '$paymentMethod',
                    totalAmount: { $sum: '$amount' } // Replace 'amount' with the desired field name
                }
            },
            {
                $project: {
                    _id: 0,
                    paymentMethod: '$_id',
                    totalAmount: 1
                }
            }
        ];
        const tvPaymentMethod = await TreatmentVoucher.aggregate(pipeline2);
        const msPaymentMethod = await MedicineSale.aggregate(pipeline);

        const TVTotal = await TreatmentVoucher.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$amount' // Replace 'amount' with the desired field name
                    }
                }
            }
        ]);

        const expenseTotal = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$finalAmount' // Replace 'finalAmount' with the desired field name
                    }
                }
            }
        ]);
        let response = {
            msPaymentMethod: msPaymentMethod,
            tvPaymentMethod: tvPaymentMethod
        }
        if (MSTotal.length > 0) response.MSTotal = MSTotal[0].totalAmount
        if (TVTotal.length > 0) response.TVTotal = TVTotal[0].totalAmount
        if (expenseTotal.length > 0) response.expenseTotal = expenseTotal[0].totalAmount
        if (MSTotal.length > 0 && TVTotal.length > 0 && expenseTotal.length > 0) response.profit = MSTotal[0].totalAmount + TVTotal[0].totalAmount - expenseTotal[0].totalAmount
        return res.status(200).send({
            success: true,
            data: response
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: true, message: 'Internal Server Error!' });
    }
};

exports.getTotalWithDateFilter = async (req, res) => {
    try {
        let { start, end, weekName, monthName } = req.query
        let query = { ...req.mongoQuery }
        let exquery = { ...req.mongoQuery }
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let startDate, endDate;

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // let { weekName, monthName } = req.body;
        // Determine the start and end dates based on the weekName
        if (weekName) {
            switch (weekName) {
                case 'First Week':
                    startDate = new Date(year, month, 1);
                    endDate = new Date(year, month, 7);
                    break;
                case 'Second Week':
                    startDate = new Date(year, month, 8);
                    endDate = new Date(year, month, 14);
                    break;
                case 'Third Week':
                    startDate = new Date(year, month, 15);
                    endDate = new Date(year, month, 21);
                    break;
                case 'Fourth Week':
                    startDate = new Date(year, month, 22);
                    endDate = new Date(year, month, getLastDayOfMonth(year, month));
                    break;
                default:
                    res.status(400).json({ error: 'Invalid week name' });
                    return;
            }
        }

        // Check if the provided month value is valid
        if (monthName && !months.includes(monthName)) {
            return res.status(400).json({ error: 'Invalid month' });
        }

        // Get the start and end dates for the specified month
        const startedDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName), 1));
        const endedDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName) + 1, 1));

        if (start && end) {
            query.createdAt = { $gte: start, $lte: end }
            exquery.date = { $gte: start, $lte: end }
            console.log('here1')
        }
        else if (weekName) {
            query.createdAt = { $gte: startDate, $lte: endDate }
            exquery.date = { $gte: startDate, $lte: endDate }
            console.log('here2')
        }
        else if (monthName) {
            query.createdAt = { $gte: startedDate, $lte: endedDate }
            exquery.date = { $gte: startedDate, $lte: endedDate }
            console.log('here3')
        }
        console.log(query, exquery)


        const MedicineSaleResult = await MedicineSale.find(query).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment').populate({
            path: 'relatedTransaction',
            populate: [{
                path: 'relatedAccounting',
                model: 'AccountingLists'
            }, {
                path: 'relatedBank',
                model: 'AccountingLists'
            }, {
                path: 'relatedCash',
                model: 'AccountingLists'
            }]
        });
        const TreatmentVoucherResult = await TreatmentVoucher.find(query).populate('relatedTreatment relatedAppointment relatedPatient')
        const ExpenseResult = await Expense.find(exquery).populate('relatedAccounting relatedBankAccount relatedCashAccount')
        const IncomeResult = await Income.find(exquery).populate('relatedAccounting relatedBankAccount relatedCashAccount')

        const msTotalAmount = MedicineSaleResult.reduce((total, sale) => total + sale.grandTotal, 0);
        const tvTotalAmount = TreatmentVoucherResult.reduce((total, sale) => total + sale.amount, 0);
        const exTotalAmount = ExpenseResult.reduce((total, sale) => total + sale.finalAmount, 0);
        const inTotalAmount = IncomeResult.reduce((total, sale) => total + sale.finalAmount, 0);

        const tvPaymentMethod = TreatmentVoucherResult.reduce((result, { paymentMethod, amount }) => {
            result[paymentMethod] = (result[paymentMethod] || 0) + amount;
            return result;
        }, {});

        const msPaymentMethod = MedicineSaleResult.reduce((result, { paymentMethod, totalAmount }) => {
            result[paymentMethod] = (result[paymentMethod] || 0) + totalAmount;
            return result;
        }, {});

        // Printing the results
        console.log(tvPaymentMethod);
        console.log(msPaymentMethod);

        return res.status(200).send({ succes: true, msPaymentMethod: msPaymentMethod, tvPaymentMethod: tvPaymentMethod, MedicineSaleResult: MedicineSaleResult, TreatmentVoucherResult: TreatmentVoucherResult, ExpenseResult: ExpenseResult, IncomeResult: IncomeResult, MSTotal: msTotalAmount, TVTotal: tvTotalAmount, expenseTotal: exTotalAmount, incomeTotal: inTotalAmount })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: true, message: 'Internal Server Error!' });
    }
};

exports.getTotalwithBranch = async (req, res) => {
    try {
        const relatedBranchId = req.mongoQuery.relatedBranch; // Assuming you're passing the relatedBranch ID as a query parameter

        const MSTotal = await MedicineSale.aggregate([
            {
                $match: {
                    relatedBranch: relatedBranchId // Filter documents by relatedBranch ID
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$totalAmount' // Replace 'totalAmount' with the desired field name
                    }
                }
            }
        ]);

        const pipeline = [
            {
                $match: {
                    relatedBranch: relatedBranchId // Filter documents by relatedBranch ID
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ];

        const pipeline2 = [
            {
                $match: {
                    relatedBranch: relatedBranchId // Filter documents by relatedBranch ID
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    totalAmount: { $sum: '$amount' } // Replace 'amount' with the desired field name
                }
            },
            {
                $project: {
                    _id: 0,
                    paymentMethod: '$_id',
                    totalAmount: 1
                }
            }
        ];
        const tvPaymentMethod = await TreatmentVoucher.aggregate(pipeline2);
        const msPaymentMethod = await MedicineSale.aggregate(pipeline);

        const TVTotal = await TreatmentVoucher.aggregate([
            {
                $match: {
                    relatedBranch: relatedBranchId // Filter documents by relatedBranch ID
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$amount' // Replace 'amount' with the desired field name
                    }
                }
            }
        ]);

        const expenseTotal = await Expense.aggregate([
            {
                $match: {
                    relatedBranch: relatedBranchId // Filter documents by relatedBranch ID
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$finalAmount' // Replace 'finalAmount' with the desired field name
                    }
                }
            }
        ]);
        console.log(MSTotal)
        let data = {
            MSTotal: MSTotal,
            TVTotal: TVTotal,
            expenseTotal: expenseTotal,
            msPaymentMethod: msPaymentMethod,
            tvPaymentMethod: tvPaymentMethod // Access the result from the first element of the array
        }
        if (MSTotal.length > 0 || TVTotal.length > 0 || expenseTotal.length > 0) {
            return res.status(200).send({
                success: true,
                data: data
            });
        }

        return res.status(200).send({
            success: true,
            data: {
                MSTotal: 0,
                TVTotal: 0,
                expenseTotal: 0,
                profit: 0,
                msPaymentMethod: msPaymentMethod,
                tvPaymentMethod: tvPaymentMethod // Access the result from the first element of the array
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: true, message: 'Internal Server Error!' });
    }
};



exports.listAllLog = async (req, res) => {
    try {
        let query = req.mongoQuery
        let result = await Log.find(query).populate('relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedAccessoryItems relatedMachine').populate({
            path: 'relatedTreatmentSelection',
            populate: [{
                path: 'relatedTreatment',
                model: 'Treatments'
            }]
        });
        let count = await Log.find(query).count();
        if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' });
        res.status(200).send({
            success: true,
            count: count,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ error: true, message: 'No Record Found!' });
    }
};

exports.getDay = async (req, res) => {
    let { startDate, endDate } = req.body
    try {
        let query = req.mongoQuery
        if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
        const meidicineSaleWeek = await MedicineSale.find(query).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment').populate({
            path: 'relatedTransaction',
            populate: [{
                path: 'relatedAccounting',
                model: 'AccountingLists'
            }, {
                path: 'relatedBank',
                model: 'AccountingLists'
            }, {
                path: 'relatedCash',
                model: 'AccountingLists'
            }]
        });
        const treatmentVoucherWeek = await TreatmentVoucher.find(query).populate('relatedTreatment relatedAppointment relatedPatient')
        let query2 = { date: { $gte: startDate, $lte: endDate }, isDeleted: false }
        if (req.mongoQuery.relatedBranch) query.relatedBranch = req.mongoQuery.relatedBranch
        const expenseWeek = await Expense.find(query2).populate('relatedAccounting relatedBankAccount relatedCashAccount')
        res.status(200).send({
            succes: true,
            data: {
                meidicineSaleWeek: meidicineSaleWeek,
                treatmentVoucherWeek: treatmentVoucherWeek,
                expenseWeek: expenseWeek
            }
        })
    } catch (error) {
        // console.log(error)
        res.status(500).json({ error: true, message: 'Internal Server Error!' });
    }
}

exports.getMonth = async (req, res) => {
    try {
        const { month } = req.body;
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        // Check if the provided month value is valid
        if (!months.includes(month)) {
            return res.status(400).json({ error: 'Invalid month' });
        }

        // Get the start and end dates for the specified month
        const startDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month), 1));
        const endDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month) + 1, 1));

        let query = req.mongoQuery
        if (month) query.createdAt = { $gte: startDate, $lte: endDate }

        const meidicineSaleWeek = await MedicineSale.find(query).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment').populate({
            path: 'relatedTransaction',
            populate: [{
                path: 'relatedAccounting',
                model: 'AccountingLists'
            }, {
                path: 'relatedBank',
                model: 'AccountingLists'
            }, {
                path: 'relatedCash',
                model: 'AccountingLists'
            }]
        });
        const treatmentVoucherWeek = await TreatmentVoucher.find(query).populate('relatedTreatment relatedAppointment relatedPatient')
        let query2 = { date: { $gte: startDate, $lte: endDate }, isDeleted: false }
        if (req.mongoQuery.relatedBranch) query.relatedBranch = req.mongoQuery.relatedBranch
        const expenseWeek = await Expense.find(query2).populate('relatedAccounting relatedBankAccount relatedCashAccount')
        res.status(200).send({
            succes: true,
            data: {
                meidicineSaleWeek: meidicineSaleWeek,
                treatmentVoucherWeek: treatmentVoucherWeek,
                expenseWeek: expenseWeek
            }
        })
    } catch (error) {
        res.status(500).json({ error: true, message: 'Internal Server Error!' });
    }
}

exports.getWeek = async (req, res) => {
    // Get the current month and year
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    let startDate, endDate;
    let { weekName, monthName } = req.body;
    // Determine the start and end dates based on the weekName
    switch (weekName) {
        case 'First Week':
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month, 7);
            break;
        case 'Second Week':
            startDate = new Date(year, month, 8);
            endDate = new Date(year, month, 14);
            break;
        case 'Third Week':
            startDate = new Date(year, month, 15);
            endDate = new Date(year, month, 21);
            break;
        case 'Fourth Week':
            startDate = new Date(year, month, 22);
            endDate = new Date(year, month, getLastDayOfMonth(year, month));
            break;
        default:
            res.status(400).json({ error: 'Invalid week name' });
            return;
    }

    try {
        //preparing query
        let query = req.mongoQuery
        if (weekName) query.createdAt = { $gte: startDate, $lte: endDate }

        const meidicineSaleWeek = await MedicineSale.find(query).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment').populate({
            path: 'relatedTransaction',
            populate: [{
                path: 'relatedAccounting',
                model: 'AccountingLists'
            }, {
                path: 'relatedBank',
                model: 'AccountingLists'
            }, {
                path: 'relatedCash',
                model: 'AccountingLists'
            }]
        });
        const treatmentVoucherWeek = await TreatmentVoucher.find(query).populate('relatedTreatment relatedAppointment relatedPatient')
        let query2 = { date: { $gte: startDate, $lte: endDate }, isDeleted: false }
        if (req.mongoQuery.relatedBranch) query2.relatedBranch = req.mongoQuery.relatedBranch
        const expenseWeek = await Expense.find(query2).populate('relatedAccounting relatedBankAccount relatedCashAccount')

        res.status(200).send({
            succes: true,
            data: {
                meidicineSaleWeek: meidicineSaleWeek,
                treatmentVoucherWeek: treatmentVoucherWeek,
                expenseWeek: expenseWeek
            }
        })
    } catch (error) {
        res.status(500).json({ error: true, message: 'Internal Server Error!' });
    }
}

function getLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}