var SegfaultHandler = require('segfault-handler');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var exec = require('child_process').exec;
const process = require('process');
var path = require('path');
const commands = require('./config');
const { logger } = require('./logger');

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
    logger.info("Server running on: " + host + " : " + port);
    logger.info('ENV: ' + process.env.NODE_ENV);
    logger.info('VERSION: ' + process.env.REACT_APP_VERSION);
});

//Serving directory
app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.get('/logs', function (req, res) {
    res.sendFile(path.join(__dirname, 'combined.log'));
});

SegfaultHandler.registerHandler("crash.log");


io.on('connection', function (socket) {
    logger.info("Client connected...");

    global.socket = socket;
    timelapse.initSocket(socket);
    panorama.initSocket(socket);
    camera.initSocket(socket);
    motorDriver.initSocket(socket);

    if (process.env.NODE_ENV != 'development') {
        socket.on('time', function (data) {
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEZ'];
            var setTimeCommand = 'sudo date -s "' + data.day + " " + months[data.month] + " " + data.year + " " + data.hour + ":" + data.minutes + ":" + data.seconds + '"';
            exec(setTimeCommand, function (error, stdout, stderr) {
                logger.info('Set time to ' + setTimeCommand);
                if (error) console.log(error);
            });

        })
    }

    socket.on('update', function () {
        logger.info('Starting Update...');
        logger.info('Downloading new Software.');
        exec(commands.gitPull, function (error, stdout, stderr) {
            logger.info('Installing Server Files.');
            if (stdout) logger.info(stdout);
            exec(commands.serverInstall, function (error, stdout, stderr) {
                logger.info('Installing Client Files.');
                if (stdout) logger.info(stdout);
                exec(commands.clientInstall, function (error, stdout, stderr) {
                    logger.info('Building Client.');
                    if (stdout) logger.info(stdout);
                    exec(commands.clientBuild, function (error, stdout, stderr) {
                        logger.info('Updating done... restarting now...');
                        if (stdout) logger.info(stdout);
                        socket.emit('updateDone');
                        exec('reboot', function (error, stdout, stderr) { if (stdout) logger.info(stdout); });
                    })
                })
            })
        });
    })

    socket.on('shutdown', function () {
        exec('shutdown now', function (error, stdout, stderr) { logger.info(stdout); });
    })

    socket.on('reboot', function () {
        exec('reboot', function (error, stdout, stderr) { logger.info(stdout); });
    })

    socket.on('restartServices', function() {
        exec('sudo systemctl restart slider.service', function (error, stdout, stderr) { logger.info(stdout); });
    })
});