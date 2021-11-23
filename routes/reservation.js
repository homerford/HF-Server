/* --- RESERVATIONS --- */
const fs = require('fs');

// Import Resources
const global_functions = require('../resources/globalFunctions.js');

module.exports = function(app, mysql_connection) {
    app.post('/reservation/add', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Reservations: Add Reservation', ipAddress, req.method);
    
        mysql_connection.query(
            `INSERT INTO RESERVATION (Reservation_type, Reservation_status, Reservation_date, Reservation_time, Reservation_duration, Reservation_note, Court_id, Equipment_id, Customer_id, Reservation_people) VALUES ('`+req.body.type_id+`','1','`+req.body.date+`','`+req.body.timeStart+`','`+req.body.duration+`', ? ,'`+req.body.court_id+`','`+req.body.equipment_id+`','`+req.body.customer_id+`','`+req.body.people+`');`, req.body.note, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error inserting into RESERVATION',
                        reservation: req.body
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success inserting into RESERVATION',
                        reservation: req.body
                    });
                }
        });
    });

    app.post('/reservation/edit', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Reservations: Edit Reservation', ipAddress, req.method);
    
        mysql_connection.query(
            `UPDATE RESERVATION SET Reservation_type = `+req.body.type_id+`, Reservation_status = `+req.body.status_id+`, Reservation_date = '`+req.body.date+`', Reservation_time = '`+req.body.timeStart+`', Reservation_duration = `+req.body.duration+`, Reservation_note = ?, Court_id = '`+req.body.court_id+`', Equipment_id = '`+req.body.equipment_id+`', Customer_id = `+req.body.customer_id+`, Reservation_people = `+req.body.people+` WHERE Reservation_id = `+req.body.id+`;`, req.body.note,
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error updating RESERVATION',
                        reservation: req.body
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success updating RESERVATION',
                        reservation: req.body
                    });
                }
        });
    });

    app.post('/reservation/delete', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Reservations: Delete Reservation', ipAddress, req.method);
    
        mysql_connection.query(
            `UPDATE RESERVATION SET Reservation_status = 0 WHERE Reservation_id = `+req.body.id+`;`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error deleting from RESERVATION',
                        reservation: req.body
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success deleting from RESERVATION',
                        reservation: req.body
                    });
                }
        });
    });

    app.post('/reservation/delete/perm', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Reservations: Perm Delete Reservation', ipAddress, req.method);
    
        mysql_connection.query(
            `DELETE FROM RESERVATION WHERE Reservation_id = `+req.body.id+`;`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error perm deleting from RESERVATION',
                        reservation: req.body
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success perm deleting from RESERVATION',
                        reservation: req.body
                    });
                }
        });
    });
    
    app.get('/reservation/getall', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Reservations: Get All Reservations', ipAddress, req.method);
    
        mysql_connection.query('SELECT * FROM RESERVATION WHERE Reservation_status = 1', function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Error getting RESERVATION',
                    reservations: '<ERROR>'
                });
            }
            else {
                res.status(200).json({
                    message: 'Success getting RESERVATION',
                    reservations: rows
                });
            }
        });
    });

    app.get('/reservation/get-user/:userid', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Reservations: Get All User Reservations', ipAddress, req.method);
    
        mysql_connection.query(`SELECT * FROM RESERVATION WHERE Customer_id = ${req.params.userid} AND Reservation_status = 1`, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Error getting RESERVATION',
                    reservations: '<ERROR>'
                });
            }
            else {
                res.status(200).json({
                    message: 'Success getting RESERVATION',
                    reservations: rows
                });
            }
        });
    });
}