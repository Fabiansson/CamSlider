var camera = require('./cam.js');
var motor = require('./arduinoDriver');

var running = null;
var pause = false;
var busy = false;
var abort = false;

var currentPanoConfig = [
    [1, 90],
    [7, 33],
    [7, -32],
    [1, -90]
];
var panoInterval;
var panoCamControl;
var panoHdr;
var panoIndex = 0;

var socket;

function initSocket(socket){
    socket = socket;

    //for panorama and timelepase
    socket.on('requestStatus', function() {
        if(running){
            socket.emit('status', {
                running: 'panorama'
            })
        }
    })

    //for panorama
    socket.on('pause', function () {
        pause = true;
    })
    
    //for panorama
    socket.on('resume', function () {
        if(!busy){
            pause = false;
            panorama(currentPanoConfig, panoInterval, panoCamControl, panoHdr, panoIndex);
        }else{
            socket.emit('isBusy', {
                fromSingle: true
            });
        }
    })
    
    //for panorama
    socket.on('retakePanoPicture', function (data) {
        if (!busy) {
            console.log(data.totalInRow);
            console.log(data.angle);
            var config = [[data.totalInRow, data.angle]];
            panorama(config, 5, panoCamControl, panoHdr, data.index, true);
        }else{
            socket.emit('isBusy', {
                fromSingle: false
            });
        }
    })
    
    //for panorama and timelapse
    socket.on('abort', async function () {
        abort = true;
        running = null;
    })
    
    //for panorama
    socket.on('panoramaInfo', function(){
        socket.emit('panoramaInfoResponse', {
            config: currentPanoConfig
        })
    })
    
    //for panorama
    socket.on('panorama', function (data) {
        console.log("Starting Pano Plan");
        currentPanoConfig = data.config.sort(function(a, b) {
            return b[1] - a[1];
        });
        panoInterval = data.interval
        panoCamControl = data.cameraControl
        panoHdr = data.hdr
        console.log(data.config.toString() + " " + data.interval + " " + data.cameraControl + " " + data.hdr)
        panorama(data.config, data.interval, data.cameraControl, data.hdr, 0);
    });

    //general
    socket.on('softResetPlaner', function () {
        softReset();
    })
}

async function panorama(config, interval, cameraControl, hdr, index, single) {
    console.log('PLAN STARTING!');
    running = 'panorama';

    var waypoints = generatePanoPoints(config);
    var limit = waypoints.length;

    if(single) limit = index + 1

    for (var i = index; i < limit; i++) {
        busy = true;
        console.log("Drive to " + waypoints[i]);
        await motor.driveToPosition(waypoints[i])
        await sleep(1000);
        global.socket.emit('progress', {
            value: i,
            max: waypoints.length
        })

        if (cameraControl && hdr) {
            try {
                await camera.takePictureWithHdr();
            } catch (error) {
                console.log(error.message);
            }
        } else if (cameraControl && !hdr) {
            await sleep(500);
            await camera.takePicture();
            await sleep(500);
        }

        if (abort) {
            console.log("Pano aborted");
            await motor.driveToPosition([0, 0, 0]);
            softReset();
            return;
        }

        await sleep(interval * 1000);

        if (pause && !single) {
            panoIndex = i + 1;
            busy = false
            return;
        }
        if (!single && i == limit - 1) {
            console.log('PANORAMA DONE');
            running = null;
        }
    }
    busy = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generatePanoPoints(panoConfig) {
    var yStepsPerRotation = 37080;
    var zStepsPerRotation = 37080;

    var waypoints = [];

    for (var i = 0; i < panoConfig.length; i++) {
        var picPerRow = panoConfig[i][0];
        for (var j = 0; j < panoConfig[i][0]; j++) {
            waypoints.push([(yStepsPerRotation / picPerRow) * j, zStepsPerRotation / (360 / panoConfig[i][1])]);
        }

    }
    console.log(waypoints);
    return waypoints;
}

function softReset() {
    pause = false;
    busy = false;
    panoIndex = 0;
    abort = false;
    running = null;
}

module.exports = {
    panorama,
    softReset,
    initSocket
}