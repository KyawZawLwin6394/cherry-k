'use strict';
const Log = require('../models/log');
const ProcedureItem = require('../models/procedureItem');
const AccessoryItem = require('../models/accessoryItem');
const Machine = require('../models/fixedAsset');
const Usage = require('../models/usage');
const Stock = require('../models/stock')
const UsageRecords = require('../models/usageRecord');
const Appointment = require('../models/appointment')

exports.listAllLog = async (req, res) => {
  try {
    let result = await Log.find({ isDeleted: false }).populate('createdBy relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedAccessoryItems relatedMachine').populate({
      path: 'relatedTreatmentSelection',
      populate: [{
        path: 'relatedTreatment',
        model: 'Treatments'
      }]
    });
    let count = await Log.find({ isDeleted: false }).count();
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

exports.getRelatedUsage = async (req, res) => {
  try {
    let result = await Log.find({ isDeleted: false }).populate('createdBy relatedTreatmentSelection relatedAppointment');
    let count = await Log.find({ isDeleted: false }).count();
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

exports.filterLogs = async (req, res, next) => {
  try {
    let query = { isDeleted: false }
    const { start, end, id } = req.query
    if (start && end) query.date = { $gte: start, $lte: end }
    if (id) {
      query.$or = []
      query.$or.push(...[{ relatedProcedureItems: id }, { relatedAccessoryItems: id }, { relatedMachine: id }])
    }
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await Log.find(query).populate('createdBy relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedAccessoryItems relatedMachine');
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

// exports.createUsage = async (req, res) => {
//   const { relatedTreatmentSelection, relatedAppointment, procedureMedicine, procedureAccessory, machine } = req.body;
//   const { relatedBranch } = req.mongoQuery;
//   const machineError = [];
//   const procedureItemsError = [];
//   const accessoryItemsError = [];

//   try {
//     const processItems = async (items, Model, relatedField) => {
//       for (const item of items) {
//         if (item.stock < item.actual) {
//           procedureItemsError.push(item);
//         } else {
//           const min = item.stock - item.actual;
//           try {
//             await Model.findOneAndUpdate(
//               { _id: item.item_id, ...(relatedBranch && { relatedBranch }) },
//               { currentQuantity: min },
//               { new: true }
//             );
//             await Log.create({
//               relatedTreatmentSelection,
//               relatedAppointment,
//               [relatedField]: item.item_id,
//               currentQty: item.stock,
//               actualQty: item.actual,
//               finalQty: min,
//               ...(relatedBranch && { relatedBranch })
//             });
//           } catch (error) {
//             procedureItemsError.push(item);
//           }
//         }
//       }
//     };

//     if (relatedBranch === undefined) {
//       if (procedureMedicine) {
//         await processItems(procedureMedicine, Stock, "relatedProcedureItems");
//       }

//       if (procedureAccessory) {
//         await processItems(procedureAccessory, AccessoryItem, "relatedAccessoryItems");
//       }

//       if (machine) {
//         await processItems(machine, Machine, "relatedMachine");
//       }
//     } else if (relatedBranch) {
//       if (procedureMedicine) {
//         await processItems(procedureMedicine, Stock, "relatedProcedureItems");
//       }

//       if (procedureAccessory) {
//         await processItems(procedureAccessory, Stock, "relatedAccessoryItems");
//       }

//       if (machine) {
//         await processItems(machine, Stock, "relatedMachine");
//       }
//     }

//     const usageResult = await Usage.create(req.body);
//     const response = { success: true };

//     if (machineError.length > 0) {
//       response.machineError = machineError;
//     }

//     if (procedureItemsError.length > 0) {
//       response.procedureItemsError = procedureItemsError;
//     }

//     if (accessoryItemsError.length > 0) {
//       response.accessoryItemsError = accessoryItemsError;
//     }

//     if (usageResult) {
//       response.usageResult = usageResult;
//     }

//     return res.status(200).send(response);
//   } catch (error) {
//     return res.status(500).send({ error: true, message: error.message });
//   }
// };


exports.createUsage = async (req, res) => {
  let { relatedTreatmentSelection, relatedAppointment, procedureMedicine, procedureAccessory, machine } = req.body;
  let { relatedBranch } = req.mongoQuery;
  let machineError = []
  let procedureItemsError = []
  let accessoryItemsError = []
  let machineFinished = []
  let procedureItemsFinished = []
  let accessoryItemsFinished = []
  let createdBy = req.credentials.id
  try {

    //procedureMedicine
    if (relatedBranch === undefined) {
      console.log('here branch undefined')
      if (procedureMedicine !== undefined) {
        procedureMedicine.map(async (e, i) => {
          if (e.stock < e.actual) {
            procedureItemsError.push(e)
          } else if (e.stock > e.actual) {
            let min = e.stock - e.actual
            try {
              procedureItemsFinished.push(e)
              const result = await Stock.findOneAndUpdate(
                { _id: e.item_id },
                { currentQuantity: min },
                { new: true },
              )

            } catch (error) {
              procedureItemsError.push(e);
            }
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedProcedureItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": min,
              "createdBy": createdBy
            })
          }
        })
      }

      //procedureAccessory

      if (procedureAccessory !== undefined) {
        procedureAccessory.map(async (e, i) => {
          if (e.stock < e.actual) {
            accessoryItemsError.push(e)
          } else if (e.stock > e.actual) {
            console.log('here', e.stock, e.actual)
            let min = e.stock - e.actual
            try {
              accessoryItemsFinished.push(e)
              const result = await AccessoryItem.findOneAndUpdate(
                { _id: e.item_id },
                { currentQuantity: min },
                { new: true },
              )


            } catch (error) {
              accessoryItemsError.push(e)
            }
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedAccessoryItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": min,
              "createdBy": createdBy
            })
          }
        })
      }

      // //machine

      if (machine !== undefined) {
        machine.map(async (e, i) => {
          if (e.stock < e.actual) {
            machineError.push(e)
          } else if (e.stock > e.actual) {
            let min = e.stock - e.actual
            try {
              machineFinished.push(e)
              const result = await Machine.findOneAndUpdate(
                { _id: e.item_id },
                { currentQuantity: min },
                { new: true },
              )


            } catch (error) {
              machineError.push(e)
            }
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedMachine": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": min,
              "createdBy": createdBy
            })
          }
        })
      }
    } else if (relatedBranch) {
      if (procedureMedicine !== undefined) {
        procedureMedicine.map(async (e, i) => {
          if (e.stock < e.actual) {
            procedureItemsError.push(e)
          } else if (e.stock > e.actual) {
            let min = e.stock - e.actual
            try {
              procedureItemsFinished.push(e)
              const result = await Stock.findOneAndUpdate(
                { _id: e.item_id, relatedBranch: relatedBranch },
                { currentQuantity: min },
                { new: true },
              )

            } catch (error) {
              procedureItemsError.push(e);
            }
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedProcedureItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": min,
              "relatedBranch": relatedBranch,
              "createdBy": createdBy
            })
          }
        })
      }

      //procedureAccessory

      if (procedureAccessory !== undefined) {
        procedureAccessory.map(async (e, i) => {
          if (e.stock < e.actual) {
            accessoryItemsError.push(e)
          } else if (e.stock > e.actual) {
            let min = e.stock - e.actual
            try {
              accessoryItemsFinished.push(e)
              const result = await Stock.findOneAndUpdate(
                { _id: e.item_id, relatedBranch: relatedBranch },
                { currentQuantity: min },
                { new: true },
              )

            } catch (error) {
              accessoryItemsError.push(e)
            }
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedAccessoryItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": min,
              "relatedBranch": relatedBranch,
              "createdBy": createdBy
            })
          }
        })
      }

      //machine

      if (machine !== undefined) {
        machine.map(async (e, i) => {
          if (e.stock < e.actual) {
            machineError.push(e)
          } else if (e.stock > e.actual) {
            let min = e.stock - e.actual
            try {
              machineFinished.push(e)
              const result = await Stock.findOneAndUpdate(
                { _id: e.item_id, relatedBranch: relatedBranch },
                { currentQuantity: min },
                { new: true },
              )

            } catch (error) {
              machineError.push(e)
            }
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedMachine": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": min,
              "relatedBranch": relatedBranch,
              "createdBy": createdBy
            })
          }
        })
      }
    }

    const appResult = await Appointment.find({ _id: req.body.relatedAppointment })
    console.log(appResult[0].relatedUsage)
    let status;
    if (appResult[0].relatedUsage === undefined) {
      //usage create
      req.body = { ...req.body, machineError: machineError, procedureItemsError: procedureItemsError, accessoryItemsError: accessoryItemsError }
      var usageResult = await Usage.create(req.body);
      var appointmentUpdate = await Appointment.findOneAndUpdate(
        { _id: req.body.relatedAppointment },
        { usageStatus: status, relatedUsage: usageResult._id },
        { new: true }
      )

      if (machineError.length > 0 || procedureItemsError.length > 0 || accessoryItemsError.length > 0) status = 'In Progress'
      if (machineError.length === 0 && procedureItemsError.length === 0 && accessoryItemsError.length === 0) status = 'Finished'
      var usageRecordResult = await UsageRecords.create({
        relatedUsage: usageResult._id,
        usageStatus: status,
        procedureMedicine: procedureItemsFinished,
        procedureAccessory: accessoryItemsFinished,
        machine: machineFinished,
        relatedBranch: req.mongoQuery.relatedBranch,
        machineError: machineError,
        procedureItemsError: procedureItemsError,
        accessoryItemsError: accessoryItemsError
      })
    }
    // else {
    //   req.body = { ...req.body, machineError: machineError, procedureItemsError: procedureItemsError, accessoryItemsError: accessoryItemsError }
    //   if (machineError.length > 0 || procedureItemsError.length > 0 || accessoryItemsError.length > 0) status = 'In Progress'
    //   if (machineError.length === 0 && procedureItemsError.length === 0 && accessoryItemsError.length === 0) status = 'Finished'
    //   var usageRecordResult = await UsageRecords.findOneAndUpdate(
    //     { relatedUsage: appResult[0].relatedUsage },
    //     {
    //       $addToSet: {
    //         procedureMedicine: {
    //           $each: procedureItemsFinished,
    //           $elemMatch: { item_id: { $ne: { $each: procedureItemsFinished.map(obj => obj.item_id) } } }
    //         },
    //         procedureAccessory: {
    //           $each: accessoryItemsFinished,
    //           $elemMatch: { item_id: { $ne: { $each: accessoryItemsFinished.map(obj => obj.item_id) } } }
    //         },
    //         machine: {
    //           $each: machineFinished,
    //           $elemMatch: { item_id: { $ne: { $each: machineFinished.map(obj => obj.item_id) } } }
    //         },
    //         machineError: {
    //           $each: machineError,
    //           $elemMatch: { item_id: { $ne: { $each: machineError.map(obj => obj.item_id) } } }
    //         },
    //         procedureItemsError: {
    //           $each: procedureItemsError,
    //           $elemMatch: { item_id: { $ne: { $each: procedureItemsError.map(obj => obj.item_id) } } }
    //         },
    //         accessoryItemsError: {
    //           $each: accessoryItemsError,
    //           $elemMatch: { item_id: { $ne: { $each: accessoryItemsError.map(obj => obj.item_id) } } }
    //         },
    //       },
    //       usageStatus: status,
    //     },
    //     { new: true }
    //   )
    // }


    //error handling
    let response = { success: true }
    if (machineError.length > 0) response.machineError = machineError
    if (procedureItemsError.length > 0) response.procedureItemsError = procedureItemsError
    if (accessoryItemsError.length > 0) response.accessoryItemsError = accessoryItemsError
    if (usageResult !== undefined) response.usageResult = usageResult
    if (usageRecordResult !== undefined) response.usageRecordResult = usageRecordResult
    if (appointmentUpdate !== undefined) response.appointmentUpdate = appointmentUpdate

    return res.status(200).send(response)
  } catch (error) {
    // console.log(error)
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.getUsageRecordsByUsageID = async (req, res) => {
  try {
    let query = req.mongoQuery;
    if (req.params.id) query.relatedUsage = req.params.id
    const result = await UsageRecords.find(query).populate('relatedUsage procedureMedicine.item_id procedureAccessory.item_id machine.item_id machineError.item_id procedureItemsError.item_id accessoryItemsError.item_id')
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}