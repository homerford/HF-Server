/* --- CUSTOMER --- */
var bcrypt = require('bcrypt');
const fs = require('fs');

// Import Resources
const global_functions = require('../resources/globalFunctions.js');

module.exports = function(app, mysql_connection) {
    app.get('/customer/getall', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Customers: Get All Customers', ipAddress, req.method);
    
        mysql_connection.query('SELECT * FROM CUSTOMER', function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Error getting ALL CUSTOMER',
                    customers: '<ERROR>'
                });
            }
            else {
                res.status(200).json({
                    message: 'Success getting ALL CUSTOMER',
                    customers: rows
                });
            }
        });
    });

    app.get('/customer/get/:customerid', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Customers: Get Customer', ipAddress, req.method);
    
        mysql_connection.query('SELECT Customer_id, Customer_type, Customer_email, Customer_phone, Customer_name, Customer_getAnnouncements FROM CUSTOMER WHERE Customer_id = '+req.params.Customerid, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Error getting Customer',
                    customer: '<ERROR>'
                });
            }
            else {
                res.status(200).json({
                    message: 'Success getting Customer',
                    customer: rows
                });
            }
        });
    });
    
    app.post('/customer/add', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Customers: Add Customer', ipAddress, req.method);
        var hashedPassword = bcrypt.hashSync(req.body.password, 7);
    
        mysql_connection.query(
            `INSERT INTO CUSTOMER (Customer_name, Customer_password, Customer_phone, Customer_email, Customer_type) VALUES ('`+req.body.username+`','`+hashedPassword+`','`+req.body.phone+`','`+req.body.email+`','`+req.body.type+`');`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error inserting into CUSTOMER',
                        customer: req.body
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success inserting into CUSTOMER',
                        customer: req.body
                    });
                }
        });
    });
    
    app.post('/customer/login', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Customers: Login Customer', ipAddress, req.method);
        var hashedPassword = bcrypt.hashSync(req.body.password, 7);
    
        mysql_connection.query(
            `SELECT Customer_id, Customer_type, Customer_email, Customer_phone, Customer_name, Customer_password, Customer_getAnnouncements FROM CUSTOMER WHERE Customer_name = '`+req.body.username+`';`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: err,
                        customer: req.body.username
                    });
                }
                else {
                    // console.log(rows[0].Customer_password);
                    if(rows.length == 0) {
                        res.status(200).json({
                            message: 'Username not found!',
                            customer: req.body.username
                        });
                    }
                    else {
                        if(bcrypt.compareSync(req.body.password, rows[0].Customer_password)) {
                            res.status(200).json({
                                message: 'Login Successful!',
                                customer: {
                                    Customer_id: rows[0].Customer_id,
                                    Customer_type: rows[0].Customer_type,
                                    Customer_email: rows[0].Customer_email,
                                    Customer_phone: rows[0].Customer_phone,
                                    Customer_name: rows[0].Customer_name,
                                    Customer_getAnnouncements: rows[0].Customer_getAnnouncements,
                                }
                            });
                        }
                        else {
                            res.status(200).json({
                                message: 'Password Incorrect!',
                                customer: req.body.Customername
                            });
                        }
                    }
                }
        });
    });
    
    app.post('/customer/delete', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Customers: Delete Customer', ipAddress, req.method);
    
        mysql_connection.query(
            `DELETE FROM CUSTOMER WHERE Customer_id = `+req.body.id+`;`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error deleting from CUSTOMER',
                        customer: req.body
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success deleting from CUSTOMER',
                        customer: req.body
                    });
                }
        });
    });
}