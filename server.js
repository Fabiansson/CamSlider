var SegfaultHandler = require('segfault-handler');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var exec = require('child_process').exec;
const process = require('process');
var path = require('path');
const updateCommand = require('./config').updateCommand;

process.on('beforeExit', (code) => {
    console.log('Process beforeExit event with code: ', code);
});

process.on('exit', (code) => {
    console.log('Process exit event with code: ', code);
});

process.on('uncaughtException', (err, origin) => {
    console.log('Error ' + err);
    console.log('Origin: ' + origin);
});

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

var motorDriver = require('./arduinoDriver');
var timelapse = require('./timelapse');
var panorama = require('./panorama');
var camera = require('./cam.js');


var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 8000; //WARNING: app.listen(80) will NOT work here!

server.listen(port, host, function () {
    console.log("Server running on: " + host + " : " + port);
});

//Serving directory
app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

SegfaultHandler.registerHandler("crash.log");


io.on('connection', function (socket) {
    console.log("Hallo client");

    global.socket = socket;
    timelapse.initSocket(socket);
    panorama.initSocket(socket);
    camera.initSocket(socket);
    motorDriver.initSocket(socket);

    if (process.env.NODE_ENV == 'production') {
        socket.on('time', function (data) {
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEZ'];
            var setTimeCommand = 'date -s "' + data.day + " " + months[data.month] + " " + data.year + " " + data.hour + ":" + data.minutes + ":" + data.seconds + '"';
            exec(setTimeCommand, function (error, stdout, stderr) {
                console.log('Set time to ' + setTimeCommand);
                if (error) console.log(error);
            });

        })
    }

    socket.on('update', function () {
        console.log('Updating.');
        exec(updateCommand, function (error, stdout, stderr) {
            console.log('Updating done... restarting now...');
            socket.emit('updateDone');
            exec('reboot', function (error, stdout, stderr) { console.log(stdout); });
        });
    })

    socket.on('shutdown', function () {
        exec('shutdown now', function (error, stdout, stderr) { console.log(stdout); });
    })

    socket.on('reboot', function () {
        exec('reboot', function (error, stdout, stderr) { console.log(stdout); });
    })
});