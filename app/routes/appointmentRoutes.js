"use strict";

const appointment = require("../controllers/appointmentController");
const { catchError } = require("../lib/errorHandler");

module.exports = (app) => {

    app.route('/api/appointment')
        .post(catchError(appointment.createAppointment))
        .put(catchError(appointment.updateAppointment))
        
    app.route('/api/appointment/:id')
        .get(catchError(appointment.getAppointment))
        .delete(catchError(appointment.deleteAppointment)) 
        .post(catchError(appointment.activateAppointment))

    app.route('/api/appointments').get(catchError(appointment.listAllAppointments))

};
