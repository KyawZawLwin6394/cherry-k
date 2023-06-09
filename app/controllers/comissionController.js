'use strict';
const Comission = require('../models/comission');
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');

exports.listAllComissiones = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 10; //limit
        skip = +skip || 0;
        let query = {},
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await Comission.find(query)
        count = await Comission.find(query).count();
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

exports.getComission = async (req, res) => {
    const result = await Comission.find({ _id: req.params.id, isDeleted: false }).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedComission')
    if (result.length === 0)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createComission = async (req, res, next) => {
    let percent = 0.02
    let appointmentResult = await Appointment.find({ _id: req.body.appointmentID })
    if (appointmentResult[0].isCommissioned === true) return res.status(500).send({ error: true, message: 'Alread Commissioned!' })
    let comission = (req.body.totalAmount / req.body.treatmentTimes) * percent
    let doctorUpdate = await Doctor.findOneAndUpdate(
        { _id: req.body.doctorID },
        { commissionAmount: comission }
    )
    let appointmentUpdate = await Appointment.findOneAndUpdate(
        { _id: req.body.appointmentID },
        { isCommissioned: true }
    )
    let newBody = req.body;
    try {
        const newComission = new Comission(newBody);
        const result = await Comission.create({
            relatedAppointment: req.body.appointmentID,
            appointmentAmount: req.body.totalAmount / req.body.treatmentTimes,
            commissionAmount: comission,
            relatedDoctor: req.body.doctorID,
            percent: percent
        });
        res.status(200).send({
            message: 'Comission create success',
            success: true,
            data: result,
            doctorResult: doctorUpdate
        });
    } catch (error) {
        // console.log(error )
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateComission = async (req, res, next) => {
    try {
        const result = await Comission.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedComission')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteComission = async (req, res, next) => {
    try {
        const result = await Comission.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateComission = async (req, res, next) => {
    try {
        const result = await Comission.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
