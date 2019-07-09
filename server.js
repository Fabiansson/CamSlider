var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
//var motorDriver = require('./motorDriver');
var planer = require('./planer');
var camera = require('./cam.js');


var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 8000; //WARNING: app.listen(80) will NOT work here!

server.listen(port, host, function () {
    console.log("Server running on: " + host + " : " + port);
});

//Serving directory
app.use(express.static('public'));

var oldStep = null;
var currentStep = 'init';


io.on('connection', function (socket) {
    //var motor = motorDriver;

    global.socket = socket;

    socket.emit('connection_s_to_c', {
        step: currentStep
    });
    
    socket.on('updateStep', function (data) {
        console.log('Current step: ' + data.step + ' Old Step: ' + data.oldStep);
        currentStep = data.step;
        oldStep = data.oldStep;
    });

    socket.on('goBack', function () {
        socket.emit('oldStep', {
            oldStep: oldStep
        })
        var temp = currentStep;
        currentStep = oldStep;
        oldStep = temp;
    })

    //for planer
    socket.on('reposition', function (data) {
        console.log("reposition on motor: " + data.axis + " in direction: " + data.direction);
        planer.reposition(data.axis, data.direction);
    });

    //for planer
    socket.on('stop reposition', function () {
        console.log("stop reposition");
        planer.stop();
    });

    //for planer
    socket.on('add', function () {
        console.log("add position");
        planer.add();
    });

    //for planer
    socket.on('softResetPlaner', function () {
        planer.softReset();
    })

    //for planer
    socket.on('initialize', function (data) {
        planer.initialize(data.mode, data.control);
    })

    //for planer
    socket.on('timelapse', function (data) {
        console.log("Starting Plan");
        console.log(data.interval + " " + data.recordTime + " " + data.movieTime + " " + data.cameraControl + " " + data.ramping);
        planer.timelapse(data.interval, data.recordTime, data.movieTime, data.cameraControl, data.ramping);
    })

    //for planer
    socket.on('panorama', function(data){
        console.log("Starting Pano Plan");
        console.log(data.config.toString() + " " + data.interval + " " + data.cameraControl + " " + data.hdr)
        planer.panorama(data.config, data.interval, data.cameraControl, data.hdr);
    })

    //for planer
    socket.on('waterscale', function(){
        console.log("Waterscaled");
        planer.waterscale();
    })

    //for planer
    socket.on('test', function () {
        console.log("TEST RUN!");
        planer.test();
    })

    //for camera
    socket.on('takePicture', function () {
        camera.takePicture();
    })

    //for camera
    socket.on('takeReferencePicture', function () {
        console.log("Take Reference Picture");
        camera.takeReferencePicture();
    })
    //for camera
    socket.on('takePictureWithRamping', function(){
        camera.takePictureWithRamping(true);
    })
});