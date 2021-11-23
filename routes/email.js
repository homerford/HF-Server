/* --- EMAIL --- */
const fs = require('fs');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
var CryptoJS = require("crypto-js");
var aws = require('aws-sdk');

const aws_email = "homerfordsender@gmail.com";

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});

const ses = new aws.SES();

// aws.config = new aws.Credentials({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io", 
    secure: false,
    port: 2525,
    auth: {
        user: "3fbee01fa9f57c",
        pass: "12c95e8d3c335e"
    }
});

// Import Resources
const global_functions = require('../resources/globalFunctions.js');
const { errorMonitor } = require('events');

// function sesEmailTo(toEmail, fromEmail, subject, message) {
//     const params = {
//         Destination: {
//             ToAddresses: [toEmail]
//         },
//         Message: {
//             Body: {
//                 Text: {
//                     Data: message,
//                 }
//             },
//             Subject: {
//                 Data: subject
//             },
//         },
//         Source: fromEmail,
//     };
//     return ses.sendEmail(params).promise();
// }

module.exports = function(app, mysql_connection) {

    app.get('/traptest', (req, res) => {

    });

    app.get('/email/send-verification/:email(*)', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Email: Send Verification', ipAddress, req.method);

        const user_email = req.params.email;
        const email_code = CryptoJS.AES.encrypt(user_email, process.env.EMAIL_SECRET.toString());

        const options = {
            from: "homer-ford-tennis-autosender@outlook.com",
            to: user_email,
            subject: "Please Verify Your Account - Homer Ford Tennis Center",
            // text: `Please click this link to verify your account: http://52.4.223.125:3040/email/verify/${email_code}`,
            html: `
                <div>
                    <span>
                        Please click this link to verify your account: 
                        <a href="http://52.4.223.125:3040/email/verify/${email_code}">Verify Now</a>
                    </span>
                </div>
            `
        };
        
        transporter.sendMail(options, function(err, data) {
            if(err) {
                console.log(err);
                return;
            }
            console.log("SENT: "+data.response);
            res.status(200).send("SENT: "+data.response);
        });
    });

    app.get('/email/reset-password/:email(*)', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Email: Send Password Reset', ipAddress, req.method);

        const user_email = req.params.email;
        const email_code = CryptoJS.AES.encrypt(user_email, process.env.EMAIL_SECRET.toString());

        const options = {
            from: "homer-ford-tennis-autosender@outlook.com",
            to: user_email,
            subject: "Password Reset - Homer Ford Tennis Center",
            // text: `Please click this link to verify your account: http://52.4.223.125:3040/email/verify/${email_code}`,
            html: `
                <div>
                    <span>
                        Please click this link to reset your password: 
                        <a href="http://52.4.223.125:3040/email/verify-password-reset/${email_code}">Reset Now</a>
                    </span>
                </div>
            `
        };
        
        transporter.sendMail(options, function(err, data) {
            if(err) {
                console.log(err);
                return;
            }
            console.log("SENT: "+data.response);
            res.status(200).send("SENT: "+data.response);
        });
    });

    app.get('/email/verify/:code(*)', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Email: Verify', ipAddress, req.method);
        
        const decrypted_code = CryptoJS.AES.decrypt(req.params.code, process.env.EMAIL_SECRET.toString());
        const decrypted_email = decrypted_code.toString(CryptoJS.enc.Utf8);

        mysql_connection.query(`UPDATE USER SET User_status = 1 WHERE User_email = '`+decrypted_email+`';`, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Verfiy Error: '+err,
                    data: rows
                });
            }
            else {
                res.redirect('http://35.175.59.32:3000/login');
            }
        });
    });

    app.get('/email/verify-password-reset/:code(*)', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Email: Verify Password Reset', ipAddress, req.method);
        
        const decrypted_code = CryptoJS.AES.decrypt(req.params.code, process.env.EMAIL_SECRET.toString());
        const decrypted_email = decrypted_code.toString(CryptoJS.enc.Utf8);

        mysql_connection.query(`SELECT User_id FROM USER WHERE User_email = '`+decrypted_email+`';`, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Could not find account to reset password: '+err
                });
            }
            else {
                res.redirect('http://35.175.59.32:3000/password-reset/'+rows[0].User_id);
            }
        });
    });

    // app.post('/alert/closure/', (req, res) => {
    //     var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
    //     global_functions.logConnectionRecord('Email: Send Reservation Alert', ipAddress, req.method);

    //     const user_email = req.body.email;

    //     const options = {
    //         from: "homer-ford-tennis-autosender@outlook.com",
    //         to: user_email,
    //         subject: "Your Reservation Was Removed - Homer Ford Tennis Center",
    //         text: `Your reservations on ${req.body.date} was removed because of an unexpected business closure on our end. If you would like more information, please contact us at: 832-373-8798`
    //     };
        
    //     transporter.sendMail(options, function(err, data) {
    //         if(err) {
    //             console.log(err);
    //             return;
    //         }
    //         console.log("SENT: "+data.response);
    //         res.status(200).send("SENT: "+data.response);
    //     });
    // });

    app.post('/alert/send/', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Email: Send Reservation Alert', ipAddress, req.method);

        const user_email = req.body.email;

        const options = {
            from: "homer-ford-tennis-autosender@outlook.com",
            to: user_email,
            subject: "Your Reservation Info - Homer Ford Tennis Center",
            text: `Your new reservation has been made at ${req.body.start} on ${req.body.date}. You've been assigned court(s): ${req.body.court}`
        };
        
        transporter.sendMail(options, function(err, data) {
            if(err) {
                console.log(err);
                return;
            }
            console.log("SENT: "+data.response);
            res.status(200).send("SENT: "+data.response);
        });
    });

    app.post('/alert/edit/', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Email: Send Reservation Update Alert', ipAddress, req.method);

        const user_email = req.body.email;

        const options = {
            from: "homer-ford-tennis-autosender@outlook.com",
            to: user_email,
            subject: "Reservation Update - Homer Ford Tennis Center",
            text: `Your reservation at ${req.body.date} has been updated. Please see our website for updated details.`
        };
        
        transporter.sendMail(options, function(err, data) {
            if(err) {
                console.log(err);
                return;
            }
            console.log("SENT: "+data.response);
            res.status(200).send("SENT: "+data.response);
        });
    });

    app.post('/alert/delete/', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Email: Send Reservation Deletion Alert', ipAddress, req.method);

        const user_email = req.body.email;

        const options = {
            from: "homer-ford-tennis-autosender@outlook.com",
            to: user_email,
            subject: "Reservation Deletion - Homer Ford Tennis Center",
            text: `Your reservation at ${req.body.date} has been removed. If you did not make this cancellation, 
                there may have been an unexpected business closure. Please see our website for further details.`
        };
        
        transporter.sendMail(options, function(err, data) {
            if(err) {
                console.log(err);
                return;
            }
            console.log("SENT: "+data.response);
            res.status(200).send("SENT: "+data.response);
        });
    });
}