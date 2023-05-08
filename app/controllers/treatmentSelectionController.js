'use strict';
const TreatmentSelection = require('../models/treatmentSelection');
const Appointment = require('../models/appointment');
const Transaction = require('../models/transaction');
const Treatment = require('../models/treatment');
const Patient = require('../models/patient');
const TreatmentVoucher = require('../models/treatmentVoucher');
const treatment = require('../models/treatment');
const treatmentVoucher = require('../models/treatmentVoucher');

exports.listAllTreatmentSelections = async (req, res) => {
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
        let result = await TreatmentSelection.find(query).limit(limit).skip(skip).populate('relatedTreatment').populate({
            path: 'relatedTreatment',
            model: 'Treatments',
            populate: {
                path: 'relatedDoctor',
                model: 'Doctors'
            }
        })
        let count = await TreatmentSelection.find(query).count();
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
    } catch (error) {
        return res.status(500).send({ error: true, message: 'No Record Found!' });
    }
};

exports.getTreatmentSelection = async (req, res) => {
    const result = await TreatmentSelection.find({ _id: req.params.id, isDeleted: false }).populate('relatedTreatment').populate('relatedAppointments');
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.getTreatementSelectionByTreatmentID = async (req, res) => {
    const result = await TreatmentSelection.find({ relatedTreatment: req.params.id, isDeleted: false }).populate('relatedTreatment').populate('relatedAppointments');
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createTreatmentSelection = async (req, res, next) => {
    let data = req.body;
    try {

        const treatmentResult = await Treatment.find({ _id: req.body.relatedTreatment })
        const appointmentConfig = {
            relatedPatient: req.body.relatedPatient,
            relatedDoctor: req.body.relatedDoctor,
            originalDate: req.body.originalDate,
            phone: req.body.phone
        }
        var dataconfigs = []
        var relatedAppointments = []
        for (let i = 0; i < treatmentResult[0].treatmentTimes; i++) {
            console.log(i)
            dataconfigs.push(appointmentConfig) //perparing for insertMany
        }
        const appointmentResult = await Appointment.insertMany(dataconfigs)
        appointmentResult.map(function (element, index) {
            relatedAppointments.push(element._id)
        })
        data = { ...data, relatedAppointments: relatedAppointments }
        if (data.paidAmount) {
            data = { ...data, leftOverAmount: data.totalAmount - data.paidAmount } // leftOverAmount Calculation
        }
        if (data.paidAmount === 0) data = { ...data, leftOverAmount: data.totalAmount }

        //first transaction 
        const fTransResult = await Transaction.create({
            "amount": req.body.paidAmount,
            "date": Date.now(),
            "remark": null,
            "relatedAccounting": "6458a7ede6bbaf516d2f0da7", //Treatment Sale Revenue
            "type": "Credit"
        }) 
        //sec transaction
        const secTransResult = await Transaction.create({
            "amount": req.body.paidAmount,
            "date": Date.now(),
            "remark":null,
            "relatedBank": req.body.relatedBank,
            "relatedCash": req.body.relatedCash,
            "type": "Debit",
            "relatedTransaction": fTransResult._id
        });
        data = {...data, relatedTransaction:[fTransResult._id, secTransResult]} //adding relatedTransactions to treatmentSelection model
        const newTreatmentSelection = new TreatmentSelection(data);
        const result = await newTreatmentSelection.save();
        const accResult = await Appointment.findOneAndUpdate(
            { _id: req.body.appointment },
            { $addToSet: { relatedTreatmentSelection: result._id } },
            { new: true },
        )
        if (data.relatedPatient) {
            const patientResult = await Patient.findOneAndUpdate(
                { _id: req.body.relatedPatient },
                { $addToSet: { relatedTreatmentSelection: result._id } },
                { new: true }
            )
            console.log(patientResult)
        }
        res.status(200).send({
            message: 'Treatment Selection create success',
            success: true,
            data: result,
            appointmentAutoGenerate: appointmentResult,
            fTransResult:fTransResult,
            secTransResult:secTransResult
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateTreatmentSelection = async (req, res, next) => {
    try {
        let data = req.body;
        if (data.paidAmount) {
            data = { ...data, leftOverAmount: data.totalAmount - data.paidAmount } // leftOverAmount Calculation
        }
        if (data.paidAmount === 0) data = { ...data, leftOverAmount: data.totalAmount }
        const result = await TreatmentSelection.findOneAndUpdate(
            { _id: req.body.id },
            data,
            { new: true },
        ).populate('relatedTreatment');
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.treatmentPayment = async (req, res, next) => {
    let data = req.body;
    try {
        let { paidAmount, totalAmount } = data;
        const treatmentSelectionQuery = await TreatmentSelection.find({ _id: req.body.id, isDeleted: false }).populate('relatedTreatment').populate('relatedAppointments');
        if (treatmentSelectionQuery[0].leftOverAmount <= 0) return res.status(500).send({ error: true, message: 'Fully Paid!' })
        const result = await TreatmentSelection.findOneAndUpdate(
            { _id: req.body.id },
            { $inc: { leftOverAmount: -paidAmount, paidAmount: paidAmount } },
            { new: true },
        ).populate('relatedTreatment');
        const treatmentVoucherResult = await TreatmentVoucher.create(
            {
                "relatedTreatment": req.body.relatedTreatment,
                "relatedAppointment": req.body.relatedAppointment,
                "relatedPatient": req.body.relatedPatient,
                "paymentMethod": req.body.paymentMethod, //enum: ['by Appointment','Lapsum','Total','Advanced']
                "amount": paidAmount,
                "relatedBank": req.body.relatedBank, //must be bank acc from accounting accs
                "paymentType": req.body.paymentType, //enum: ['Bank','Cash']
                "relatedCash": req.body.relatedCash //must be cash acc from accounting accs
            }
        )
        return res.status(200).send({
            success: true, data: result,
            treatmentVoucherResult: treatmentVoucherResult
        });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteTreatmentSelection = async (req, res, next) => {
    try {
        const result = await TreatmentSelection.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
};

exports.activateTreatmentSelection = async (req, res, next) => {
    try {
        const result = await TreatmentSelection.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.createTreatmentTransaction = async (req, res) => {
    try {
        //first transaction 
        const fTransaction = new Transaction({
            "amount": req.body.amount,
            "date": req.body.date,
            "remark": req.body.remark,
            "relatedAccounting": req.body.firstAccount,
            "type": "Credit"
        })
        const fTransResult = await fTransaction.save()
        const secTransaction = new Transaction(
            {
                "amount": req.body.amount,
                "date": req.body.date,
                "remark": req.body.remark,
                "relatedAccounting": req.body.secondAccount,
                "type": "Debit",
                "relatedTransaction": fTransResult._id
            }
        )
        const secTransResult = await secTransaction.save()
        res.status(200).send({
            message: 'MedicineSale Transaction success',
            success: true,
            fTrans: fTransResult,
            sTrans: secTransResult
        });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
}
