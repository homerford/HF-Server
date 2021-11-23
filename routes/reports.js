/* --- REPORTS --- */
const fs = require('fs');

// Import Resources
const global_functions = require('../resources/globalFunctions.js');

module.exports = function(app, mysql_connection) {
    app.post('/report/download', (req, res) => {
        var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
        global_functions.logConnectionRecord('Report: Download', ipAddress, req.method);
        var query = req.body.report_query;

        mysql_connection.query(query, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: 'Error downloading REPORT',
                    report: '<ERROR>'
                });
            }
            else {
                res.status(200).json({
                    message: 'Success downloading REPORT',
                    report: rows
                });
            }
        });
    });
}