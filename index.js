console.log('');
const dotenv = require('dotenv').config();
const http = require('http').createServer();
const fs = require('fs');
// var ffmpeg = require('ffmpeg');
const path = require('path');
var express = require('express');
const bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var mysql = require('mysql2');
var cors = require('cors');
const { ObjectID } = require('bson');
var bcrypt = require('bcrypt');
const app = express();
var corsOptions = {
    'origin': '*'
}

const expressPort = 3040;
const socketPort = 4001;

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(pino);

const logFolder = './logs/';

/* MySQL Setup */
var mysql_connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'msql@1O',
    database: 'project_db'
});
mysql_connection.connect();

/* SocketIO Setup */
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

// Import Routes
//const route_customer = require('./routes/customer.js')(app, mysql_connection);
//const route_employee = require('./routes/employee.js')(app, mysql_connection);
const route_user = require('./routes/user.js')(app, mysql_connection);
const route_reservation = require('./routes/reservation.js')(app, mysql_connection);
const route_reports = require('./routes/reports.js')(app, mysql_connection);
const route_email = require('./routes/email.js')(app, mysql_connection);
const route_closure = require('./routes/closure.js')(app, mysql_connection);
const route_feedback = require('./routes/feeback.js')(app, mysql_connection);
const route_socket = require('./routes/socketio.js')(app, mysql_connection, io);

// Import Resources
const global_functions = require('./resources/globalFunctions.js');

/* */
console.log(global_functions.dateTimeNow()+'[Database connection successful]');
global_functions.writeToLog(global_functions.dateTimeNow()+'[Database connection successful]');

// Express Landing Page
app.get('/', (req, res) => {
    var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
    global_functions.logConnectionRecord('Landing Page', ipAddress, req.method);

    res.status(200).send('Project Server');
});

// Logging Route - Get All Logs
app.get('/logs/getall', (req, res) => {
    var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
    global_functions.logConnectionRecord('Logs: Get All', ipAddress, req.method);

    var resBufferFiles = [];

    fs.readdirSync(logFolder).forEach(file => {
        resBufferFiles.push(file);
    });

    res.status(200).json({
        message: 'Success getting LOGS',
        files: resBufferFiles
    });
});

// Logging Route - Get Log By ID
app.get('/logs/get/:logname', (req, res) => {
    var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
    global_functions.logConnectionRecord('Logs: Get One', ipAddress, req.method);

    res.sendFile(__dirname + '/logs/'+req.params.logname);
});

app.listen(expressPort, () => {
    console.log(global_functions.dateTimeNow()+'[Express listening on port '+expressPort+']');
    global_functions.writeToLog(global_functions.dateTimeNow()+'[Express listening on port '+expressPort+']');
});

http.listen(socketPort, () => console.log('[Socket listening on port '+socketPort+']'));