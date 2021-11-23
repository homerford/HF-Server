const fs = require('fs');

// Import Resources
const global_functions = require('../resources/globalFunctions.js');

module.exports = function(app, mysql_connection) {
    app.post('/feedback/add/', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Feedback: Add Feedback', ipAddress, req.method);

        mysql_connection.query(
            `INSERT INTO FEEDBACK (Feedback_type, Feedback_rating, Feedback_note, Feedback_date, Customer_id) VALUES ('`+req.body.type+`','`+req.body.rating+`', ?,'`+req.body.date+`','`+req.body.customer_id+`');`, req.body.note,
            function (err, rows, fields) {
                if (!err) {
                    res.status(200).json({
                        message: 'Successfully inserted into FEEDBACK',
                        item: req.body
                    });
                } else {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error inserting into FEEDBACK',
                        item: req.body
                    });
                }
            }
        );
    });

    app.post('/feedback/edit/', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Feedback: Edit Feedback', ipAddress, req.method);

        mysql_connection.query(
            `UPDATE FEEDBACK SET Feedback_type = `+req.body.type+`, Feedback_rating = `+req.body.rating+`, Feedback_note = ? WHERE Feedback_id = `+req.body.id+`;`, req.body.note,
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error updating FEEDBACK',
                        item: req.body
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success updating FEEDBACK',
                        item: req.body
                    });
                }
        });
    });

    app.post('/feedback/delete/', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Feedback: Delete Feedback', ipAddress, req.method);

        mysql_connection.query(
            `DELETE FROM FEEDBACK WHERE Feedback_id = `+req.body.id+`;`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error perm deleting from FEEDBACK',
                        item: req.body
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success perm deleting from FEEDBACK',
                        item: req.body
                    });
                }
        });
    });

    app.get('/feedback/getall/', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Feedback: Get All', ipAddress, req.method);

        mysql_connection.query('SELECT * FROM FEEDBACK', function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Error getting ALL FEEDBACK',
                    items: '<ERROR>'
                });
            }
            else {
                res.status(200).json({
                    message: 'Success getting ALL FEEDBACK',
                    items: rows
                });
            }
        });
    });
}