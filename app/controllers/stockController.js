'use strict';
const Stock = require('../models/stock');
const ProcedureItems = require('../models/procedureItem');
const MedicineItems = require('../models/medicineItem');
const AccessoryItems = require('../models/accessoryItem');
const Branch = require('../models/branch');
const Log = require('../models/log');
const RecievedRecords = require('../models/recievedRecord');

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
        const getResult = await Stock.find({ _id: req.body.id })
        const result = await Stock.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedBranch relatedProcedureItems relatedMedicineItems relatedAccessoryItems relatedMachine')
        const logResult = await Log.create({
            "relatedStock": req.body.id,
            "currentQty": getResult[0].totalUnit,
            "finalQty": req.body.totalUnit,
            "type": "Stock Update",
            "relatedBranch": req.mongoQuery.relatedBranch,
            "createdBy": req.credentials.id
        })
        return res.status(200).send({ success: true, data: result, log: logResult });
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
                        "reOrderQuantity": procedureItems[i].reOrderQuantity,
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
                        "reOrderQuantity": medicineItems[i].reOrderQuantity,
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
                        "totalUnit": (accessoryItems[i].currentQuantity * accessoryItems[i].toUnit) / accessoryItems[i].fromUnit,
                        "reOrderQuantity": accessoryItems[i].reOrderQuantity
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
    try {
        let { relatedBranch } = req.query
        const PIquery = { relatedProcedureItems: { $exists: true }, relatedBranch: relatedBranch };
        const MIquery = { relatedMedicineItems: { $exists: true }, relatedBranch: relatedBranch };
        const AIquery = { relatedAccessoryItems: { $exists: true }, relatedBranch: relatedBranch };
        const relatedProcedureItems = await Stock.find(PIquery).populate('relatedProcedureItems')
        const relatedAccessoryItems = await Stock.find(AIquery).populate('relatedAccessoryItems')
        const relatedMedicineItems = await Stock.find(MIquery).populate('relatedMedicineItems')
        const ProcedureItems = relatedProcedureItems.filter(item => item.currentQty <= item.reOrderQuantity);
        const AccessoryItems = relatedAccessoryItems.filter(item => item.currentQty <= item.reOrderQuantity);
        const MedicineItems = relatedMedicineItems.filter(item => item.currentQty <= item.reOrderQuantity);

        return res.status(200).send({
            success: true, data: {
                ProcedureItems: ProcedureItems,
                AccessoryItems: AccessoryItems,
                MedicineItems: MedicineItems
            },
        })
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
}


// exports.checkReorder = async (req, res) => {
//     try {
//         const { relatedBranch } = req.query;

//         const query = { relatedBranch };
//         const projection = { _id: 0, relatedBranch: 0 };

//         const items = await Stock.find(query, projection)
//             .populate('relatedProcedureItems')
//             .populate('relatedAccessoryItems')
//             .populate('relatedMedicineItems')
//             .lean()
//             .exec();

//         const ProcedureItems = items.filter(item => item.relatedProcedureItems && item.totalUnit <= item.reOrderQuantity);
//         const AccessoryItems = items.filter(item => item.relatedAccessoryItems && item.totalUnit <= item.reOrderQuantity);
//         const MedicineItems = items.filter(item => item.relatedMedicineItems && item.totalUnit <= item.reOrderQuantity);

//         return res.status(200).send({
//             success: true,
//             data: {
//                 ProcedureItems,
//                 AccessoryItems,
//                 MedicineItems
//             }
//         });
//     } catch (error) {
//         return res.status(500).send({ error: true, message: error.message });
//     }
// };

exports.stockRecieved = async (req, res) => {
    try {
        let createdBy = req.credentials.id
        const { procedureItemID, medicineItemID, accessoryItemID, relatedBranch, recievedQty, requestedQty } = req.body
        if (procedureItemID) {
            var result = await Stock.findOneAndUpdate(
                { relatedProcedureItems: stock_id, relatedBranch: relatedBranch },
                {
                    currentQty: recievedQty
                },
                { new: true }
            ).populate('relatedBranch relatedProcedureItems relatedMedicineItems relatedAccessoryItems relatedMachine').populate('createdBy', 'givenName')
            var RecievedRecordsResult = await RecievedRecords.create({
                createdAt: Date.now(),
                createdBy: createdBy,
                relatedBranch: relatedBranch,
                requestedQty: requestedQty,
                recievedQty: recievedQty,
                relatedProcedureItems: procedureItemID
            })
        }
        if (medicineItemID) {
            var result = await Stock.findOneAndUpdate(
                { relatedMedicineItems: stock_id, relatedBranch: relatedBranch },
                {
                    currentQty: recievedQty
                },
                { new: true }
            ).populate('relatedBranch relatedProcedureItems relatedMedicineItems relatedAccessoryItems relatedMachine').populate('createdBy', 'givenName')
            var RecievedRecordsResult = await RecievedRecords.create({
                createdAt: Date.now(),
                createdBy: createdBy,
                relatedBranch: relatedBranch,
                requestedQty: requestedQty,
                recievedQty: recievedQty,
                relatedMedicineItems: medicineItemID
            })
        }
        if (accessoryItemID) {
            var result = await Stock.findOneAndUpdate(
                { relatedAccessoryItems: stock_id, relatedBranch: relatedBranch },
                {
                    currentQty: recievedQty
                },
                { new: true }
            ).populate('relatedBranch relatedProcedureItems relatedMedicineItems relatedAccessoryItems relatedMachine').populate('createdBy', 'givenName')
            var RecievedRecordsResult = await RecievedRecords.create({
                createdAt: Date.now(),
                createdBy: createdBy,
                relatedBranch: relatedBranch,
                requestedQty: requestedQty,
                recievedQty: recievedQty,
                relatedAccessoryItems: accessoryItemID
            })
        }

        const logResult = await Log.create({
            "relatedStock": stock_id,
            "currentQty": requestedQty,
            "actualQty": recievedQty,
            "finalQty": recievedQty,
            "type": "Request Recieved",
            "relatedBranch": relatedBranch,
            "createdBy": createdBy
        })
        return res.status(200).send({ success: true, data: result, log: logResult, RecievedRecordsResult: RecievedRecordsResult })
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
}
