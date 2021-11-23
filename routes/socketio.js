/* --- SOCKETIO --- */
const fs = require('fs');
const { isObject } = require('util');

// Import Resources
const global_functions = require('../resources/globalFunctions.js');

module.exports = function(app, mysql_connection, io) {
    io.on('connection', (socket) => {
        console.log("Socket Connection Detected: "+socket.request.connection.remoteAddress);
        
        socket.on('logout', (user_id) => {
            io.emit(`logout-user-${user_id}`);
            console.log("Logging out user id: "+user_id);
        });

        socket.on('add-reservation', () => {
            io.emit(`reservation-refresh`);
        });

        socket.on('edit-reservation', () => {
            io.emit(`reservation-refresh`);
        });

        socket.on('delete-reservation', () => {
            io.emit(`reservation-refresh`);
        });
    });
}