'use strict';
const Log = require('../models/log');
const MedicineSale = require('../models/medicineSale');
const TreatmentVoucher = require('../models/treatmentVoucher');
const Expense = require('../models/expense');

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

        return res.status(200).send({
            success: true,
            data: {
                MSTotal: MSTotal[0].totalAmount,
                TVTotal: TVTotal[0].totalAmount,
                expenseTotal: expenseTotal[0].totalAmount,
                profit: MSTotal[0].totalAmount + TVTotal[0].totalAmount - expenseTotal[0].totalAmount,
                msPaymentMethod: msPaymentMethod,
                tvPaymentMethod: tvPaymentMethod // Access the result from the first element of the array
            }
        });
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
        let mstotal = MSTotal[0].totalAmount
        let tvtotal = TVTotal[0].totalAmount
        let exptotal = expenseTotal[0].totalAmount
        let profit = mstotal + tvtotal - exptotal
        let data = {
            MSTotal: MSTotal,
            TVTotal: TVTotal,
            expenseTotal: expenseTotal,
            msPaymentMethod: msPaymentMethod,
            tvPaymentMethod: tvPaymentMethod // Access the result from the first element of the array
        }
        if (profit) { data.profit = profit } else { data.profit = 0 }
        if (MSTotal.length > 0 || TVTotal.length > 0 || expenseTotal.length > 0) {
            return res.status(200).send({
                success: true,
                data: 
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