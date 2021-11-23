/* --- USER --- */
var bcrypt = require('bcrypt');
const fs = require('fs');

// Import Resources
const global_functions = require('../resources/globalFunctions.js');

module.exports = function(app, mysql_connection) {
    app.get('/user/getall', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Users: Get All Users', ipAddress, req.method);
    
        mysql_connection.query('SELECT * FROM USER', function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Error getting ALL USER',
                    users: '<ERROR>'
                });
            }
            else {
                res.status(200).json({
                    message: 'Success getting ALL USER',
                    users: rows
                });
            }
        });
    });

    app.get('/user/get/:userid', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Users: Get User', ipAddress, req.method);
    
        mysql_connection.query('SELECT User_id, User_type, User_status, User_email, User_phone, User_firstname, User_lastname, User_getAnnouncements FROM USER WHERE User_id = '+req.params.userid, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Error getting User',
                    user: '<ERROR>'
                });
            }
            else {
                res.status(200).json({
                    message: 'Success getting User',
                    user: rows
                });
            }
        });
    });
    
    app.post('/user/add', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Users: Add User', ipAddress, req.method);
        var hashedPassword = bcrypt.hashSync(req.body.password, 7);
        mysql_connection.query(`SELECT User_email FROM USER WHERE User_email = '`+req.body.email+`';`, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: err,
                    user: req.body.email
                });
            }
            else {
                if(rows.length >= 1) {
                    res.status(200).json({
                        message: 'Account already registered with this email!',
                        user: req.body.email
                    });
                }
                else {
                    mysql_connection.query(
                        `INSERT INTO USER (User_firstname, User_lastname, User_password, User_phone, User_email, User_type, User_status, User_getAnnouncements) VALUES ('`+req.body.firstname+`','`+req.body.lastname+`','`+hashedPassword+`','`+req.body.phone+`','`+req.body.email+`','`+req.body.type+`','`+req.body.status+`','`+req.body.getannouncements+`');`, 
                        function (err, rows, fields) {
                            if (err) {
                                console.log(err);
                                res.status(200).json({
                                    message: 'Error inserting into USER',
                                    user: req.body
                                });
                            }
                            else {
                                res.status(200).json({
                                    message: 'Success inserting into USER',
                                    user: req.body
                                });
                            }
                    });
                }
            }
        });
    });
    
    app.post('/user/login', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Users: Login User', ipAddress, req.method);
        var hashedPassword = bcrypt.hashSync(req.body.password, 7);
    
        mysql_connection.query(
            `SELECT User_id, User_type, User_status, User_email, User_phone, User_firstname, User_lastname, User_password, User_getAnnouncements FROM USER WHERE User_email = '`+req.body.email+`';`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: err,
                        user: req.body.email
                    });
                }
                else {
                    // console.log(rows[0].User_password);
                    if(rows.length == 0) {
                        res.status(200).json({
                            message: 'Account not found!',
                            user: req.body.email
                        });
                    }
                    else if(rows[0].User_status == 0) {
                        res.status(200).json({
                            message: 'Your account has been deactivated!',
                            user: req.body.email
                        });
                    }
                    else {
                        if(bcrypt.compareSync(req.body.password, rows[0].User_password)) {
                            res.status(200).json({
                                message: 'Login Successful!',
                                user: {
                                    User_id: rows[0].User_id,
                                    User_type: rows[0].User_type,
                                    User_status: rows[0].User_status,
                                    User_email: rows[0].User_email,
                                    User_phone: rows[0].User_phone,
                                    User_firstname: rows[0].User_firstname,
                                    User_lastname: rows[0].User_lastname,
                                    User_getAnnouncements: rows[0].User_getAnnouncements,
                                }
                            });
                        }
                        else {
                            res.status(200).json({
                                message: 'Password Incorrect!',
                                user: req.body.email
                            });
                        }
                    }
                }
        });
    });
    
    app.post('/user/delete', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Users: Delete User', ipAddress, req.method);
    
        mysql_connection.query(
            `UPDATE USER SET User_status = 0 WHERE User_id = `+req.body.id+`;`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error deleting from USER'
                    });
                }
                else {
                    mysql_connection.query(
                        `UPDATE RESERVATION SET Reservation_status = 0 WHERE Customer_id = `+req.body.id+`;`, 
                        function (err, rows, fields) {
                            if (err) {
                                console.log(err);
                                res.status(200).json({
                                    message: 'Error deleting from RESERVATION'
                                });
                            }
                            else {
                                res.status(200).json({
                                    message: 'Success deleting from USER and USER RESERVATIONS',
                                    user: req.body
                                });
                            }
                    });
                }
        });
    });

    app.post('/user/update-password', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('User: Update Password', ipAddress, req.method);

        var hashedPassword = bcrypt.hashSync(req.body.password, 7);
    
        mysql_connection.query(
            `UPDATE USER SET User_password = '`+hashedPassword+`' WHERE User_id = `+req.body.id+`;`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error updating USER PASSWORD',
                        user: req.body.id
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success updating USER PASSWORD',
                        user: req.body.id
                    });
                }
        });
    });

    app.post('/user/update-getannouncements', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('User: Update Get Announcements', ipAddress, req.method);
    
        mysql_connection.query(
            `UPDATE USER SET User_getAnnouncements = '`+req.body.getannouncements+`' WHERE User_id = `+req.body.id+`;`, 
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: 'Error updating USER GetAnnouncements',
                        user: req.body.id
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Success updating USER GetAnnouncements',
                        user: req.body.id
                    });
                }
        });
    });

    app.post('/user/edit', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('User: Edit User', ipAddress, req.method);
    
        if(req.body.password) {
            var hashedPassword = bcrypt.hashSync(req.body.password, 7);

            mysql_connection.query(
                `UPDATE USER SET User_firstname = '`+req.body.firstname+`', User_lastname = '`+req.body.lastname+`', User_password = '`+hashedPassword+`', User_phone = '`+req.body.phone+`', User_email = '`+req.body.email+`', User_type = `+req.body.type+`, User_status = `+req.body.status+`, User_getAnnouncements = `+req.body.getannouncements+` WHERE User_id = `+req.body.id+`;`, 
                function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        res.status(200).json({
                            message: 'Error updating USER',
                            user: req.body
                        });
                    }
                    else if(req.body.User_status == 0) {
                        mysql_connection.query(
                            `UPDATE RESERVATION SET Reservation_status = 0 WHERE Customer_id = `+req.body.id+`;`, 
                            function (err, rows, fields) {
                                if (err) {
                                    console.log(err);
                                    res.status(200).json({
                                        message: 'Error deleting from RESERVATION'
                                    });
                                }
                                else {
                                    res.status(200).json({
                                        message: 'Success updating USER and USER RESERVATIONS',
                                        user: req.body
                                    });
                                }
                        });
                    }
                    else {
                        res.status(200).json({
                            message: 'Success updating USER',
                            user: req.body
                        });
                    }
            });
        }
        else {
            mysql_connection.query(
                `UPDATE USER SET User_firstname = '`+req.body.firstname+`', User_lastname = '`+req.body.lastname+`', User_phone = '`+req.body.phone+`', User_email = '`+req.body.email+`', User_type = `+req.body.type+`, User_status = `+req.body.status+`, User_getAnnouncements = `+req.body.getannouncements+` WHERE User_id = `+req.body.id+`;`, 
                function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        res.status(200).json({
                            message: 'Error updating USER',
                            user: req.body
                        });
                    }
                    else {
                        res.status(200).json({
                            message: 'Success updating USER',
                            user: req.body
                        });
                    }
            });
        }
    });
}