/* --- EMPLOYEE --- */
var bcrypt = require('bcrypt');
const fs = require('fs');

// Import Resources
const global_functions = require('../resources/globalFunctions.js');

module.exports = function(app, mysql_connection) {
    app.get('/employee/getall', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Employees: Get All Employees', ipAddress, req.method);
    
        mysql_connection.query('SELECT * FROM EMPLOYEE', function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Error getting ALL EMPLOYEE',
                    employees: '<ERROR>'
                });
            }
            else {
                res.status(200).json({
                    message: 'Success getting ALL EMPLOYEE',
                    employees: rows
                });
            }
        });
    });

    app.get('/employee/get/:employeeid', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Employees: Get Employee', ipAddress, req.method);
    
        mysql_connection.query('SELECT Employee_id, Employee_type, Employee_email, Employee_phone, Employee_name, Employee_getAnnouncements FROM EMPLOYEE WHERE Employee_id = '+req.params.Employeeid, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Error getting Employee',
                    employee: '<ERROR>'
                });
            }
            else {
                res.status(200).json({
                    message: 'Success getting Employee',
                    employee: rows
                });
            }
        });
    });
    
    app.post('/employee/add', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Employees: Add Employee', ipAddress, req.method);
        var hashedPassword = bcrypt.hashSync(req.body.password, 7);
    
        mysql_connection.query(
            `INSERT INTO EMPLOYEE (Employee_name, Employee_password, Employee_phone, Employee_email, Employee_type) VALUES ('`+req.body.username+`','`+hashedPassword+`','`+req.body.phone+`','`+req.body.email+`','`+req.body.type+`');`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error inserting into EMPLOYEE',
                        employee: req.body
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success inserting into EMPLOYEE',
                        employee: req.body
                    });
                }
        });
    });
    
    app.post('/employee/login', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Employees: Login Employee', ipAddress, req.method);
        var hashedPassword = bcrypt.hashSync(req.body.password, 7);
    
        mysql_connection.query(
            `SELECT Employee_id, Employee_type, Employee_email, Employee_phone, Employee_name, Employee_password, Employee_getAnnouncements FROM EMPLOYEE WHERE Employee_name = '`+req.body.username+`';`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: err,
                        employee: req.body.username
                    });
                }
                else {
                    // console.log(rows[0].Employee_password);
                    if(rows.length == 0) {
                        res.status(200).json({
                            message: 'Username not found!',
                            employee: req.body.username
                        });
                    }
                    else {
                        if(bcrypt.compareSync(req.body.password, rows[0].Employee_password)) {
                            res.status(200).json({
                                message: 'Login Successful!',
                                employee: {
                                    Employee_id: rows[0].Employee_id,
                                    Employee_type: rows[0].Employee_type,
                                    Employee_email: rows[0].Employee_email,
                                    Employee_phone: rows[0].Employee_phone,
                                    Employee_name: rows[0].Employee_name,
                                    Employee_getAnnouncements: rows[0].Employee_getAnnouncements,
                                }
                            });
                        }
                        else {
                            res.status(200).json({
                                message: 'Password Incorrect!',
                                employee: req.body.Employeename
                            });
                        }
                    }
                }
        });
    });
    
    app.post('/employee/delete', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Employees: Delete Employee', ipAddress, req.method);
    
        mysql_connection.query(
            `DELETE FROM EMPLOYEE WHERE Employee_id = `+req.body.id+`;`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error deleting from EMPLOYEE',
                        employee: req.body
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success deleting from EMPLOYEE',
                        employee: req.body
                    });
                }
        });
    });
}