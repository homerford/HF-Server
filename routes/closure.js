/* --- cLOSURE --- */
const fs = require('fs');
const nodemailer = require('nodemailer');

// Import Resources
const global_functions = require('../resources/globalFunctions.js');

const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", 
    secure: false,
    port: 587,
    tls: {
        ciphers:'SSLv3',
        rejectUnauthorized: false
    },
    auth: {
        user: "homer-ford-tennis-autosender@outlook.com",
        // pass: "hfP@ssn0de"
        pass: "hfLim1996@!"
    }
});

module.exports = function(app, mysql_connection) {
    app.get('/closure/add/:date(*)', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Closure: Add', ipAddress, req.method);
    
        var date = req.params.date;
    
        mysql_connection.query(`SELECT Closure_date FROM CLOSURE WHERE Closure_date = '`+date+`';`, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: err,
                    closure: req.body.email
                });
            }
            else {
                if(rows.length >= 1) {
                    res.status(200).json({
                        message: 'Date already closed!'
                    });
                }
                else {
                    mysql_connection.query(`INSERT INTO CLOSURE (Closure_date) VALUES ('`+date+`');`, function (err, rows, fields) {
                        if (err) {
                            console.log(err);
                            res.status(200).json({
                                message: 'Error adding CLOSURE',
                                closure: '<ERROR>'
                            });
                        }
                        else {
                            res.status(200).json({
                                message: 'Successfully added CLOSURE',
                                closure: date
                            });
                        }
                        // else {
                        //     mysql_connection.query(
                        //         `DELETE FROM RESERVATION WHERE Reservation_date = '`+date+`';`, 
                        //         function (err, rows, fields) {
                        //             if (err) {
                        //                 console.log(err);
                        //                 res.status(200).json({
                        //                     message: 'Error deleting reservations from date'
                        //                 });
                        //             }
                        //             else {
                        //                 res.status(200).json({
                        //                     message: 'Success deleting reservations from date',
                        //                     closure: rows
                        //                 });
                        //             }
                        //     });
                        // }
                    });
                }
            }
        });
    });

    app.get('/closure/remove/:date(*)', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Closure: Remove', ipAddress, req.method);
    
        var date = req.params.date;
    
        mysql_connection.query(
            `DELETE FROM CLOSURE WHERE Closure_date = '`+date+`';`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error deleting from CLOSURE',
                        closure: date
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success deleting from CLOSURE',
                        closure: date
                    });
                }
        });
    });

    app.get('/closure/getall/', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Closure: Getall', ipAddress, req.method);
    
        mysql_connection.query('SELECT * FROM CLOSURE', function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Error getting CLOSURE',
                    closures: '<ERROR>'
                });
            }
            else {
                res.status(200).json({
                    message: 'Success getting CLOSURE',
                    closures: rows
                });
            }
        });
    });
}