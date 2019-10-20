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
var planer = require('./planer');
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
    planer.initSocket(socket);
    camera.initSocket(socket);
    motorDriver.initSocket(socket);

    /*socket.emit('connection_s_to_c', {
        //step: navHistory[navHistory.length - 1]
        route: currentRoute
    });

    socket.on('requestRoute', function(){
        socket.emit('route', {
            route: currentRoute
        })
    })

    socket.on('updateRoute', function (data) {
        console.log('Current step: ' + data.route);
        currentRoute = data.route;
        navHistory.push(data.route);
    });
    
    socket.on('goBack', function () {
        console.log("Before Pop: " + navHistory);
        navHistory.pop();
        socket.emit('oldStep', {
            oldStep: navHistory[navHistory.length - 1]
        })
        console.log("Before Pop: " + navHistory);
        var temp = currentStep;
        currentStep = oldStep;
        oldStep = temp;
    })*/

    socket.on('time', function(data){
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEZ'];
        var setTimeCommand = 'date -s "' + data.day + " " + months[data.month] + " " + data.year + " " + data.hour + ":" + data.minutes + ":" + data.seconds + '"';
        exec(setTimeCommand, function(error, stdout, stderr){
             console.log('Set time to ' + setTimeCommand);
             if(error) console.log(error);
         });

    })

    socket.on('update', function(){
        console.log('Updating.');
        exec(updateCommand, function(error, stdout, stderr){ 
            console.log('Updating done... restarting now...');
            socket.emit('updateDone');
            exec('reboot', function(error, stdout, stderr){ console.log(stdout); });
        });
    })

    socket.on('shutdown', function(){
        exec('shutdown now', function(error, stdout, stderr){ console.log(stdout); });
    })

    socket.on('reboot', function(){
        exec('reboot', function(error, stdout, stderr){ console.log(stdout); });
    })
    
    //for planer
    /*socket.on('reposition', function (data) {
        console.log("reposition on motor: " + data.axis + " in direction: " + data.direction);
        planer.reposition(data.axis, data.direction);
    });*/

    //for planer
    /*socket.on('stop reposition', function () {
        console.log("stop reposition");
        planer.stop();
    });*/

    //for planer
    /*socket.on('add', function () {
        console.log("add position");
        planer.add();
    });*/

    //for planer
    

    //for planer
    /*socket.on('initialize', function (data) {
        planer.initialize(data.mode, data.control);
    })*/

    //for planer
    /*socket.on('timelapse', function (data) {
        console.log("Starting Plan");
        console.log(data.interval + " " + data.recordTime + " " + data.movieTime + " " + data.cameraControl + " " + data.ramping);
        planer.timelapse(data.interval, data.movieTime, data.cameraControl, data.ramping);
    })*/

    //for planer
    /*socket.on('panorama', function(data){
        console.log("Starting Pano Plan");
        console.log(data.config.toString() + " " + data.interval + " " + data.cameraControl + " " + data.hdr)
        planer.panorama(data.config, data.interval, data.cameraControl, data.hdr, 0);
    })*/

    //for planer
    /*socket.on('waterscale', function(){
        console.log("Waterscaled");
        planer.waterscale();
    })*/

    //for planer
    /*socket.on('test', function () {
        console.log("TEST RUN!");
        planer.test();
    })*/

    //from here on was
    //for camera
    /*socket.on('requestCamera', function () {
        socket.emit('hasCamera', {
            hasCamera: camera.hasCamera()
        })
    })

    //for camera
    socket.on('takePicture', async () => {
        try{
            await camera.takePicture();
        }catch(er){
            console.log(er);
        }
        
    })

    //for camera
    socket.on('takeReferencePicture', async () => {
        console.log("Take Reference Picture");
        try{
            await camera.takeReferencePicture();
        }catch(er){
            console.log(er);
        }
        
    })
    //for camera
    socket.on('takePictureWithRamping', async () => {
        try{
            await camera.takePictureWithRamping(true);
        }catch(er){
            console.log(er);
        }
        
    })*/
});