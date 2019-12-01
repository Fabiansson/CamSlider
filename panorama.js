var camera = require('./cam.js');
var motor = require('./arduinoDriver');

var running = null;
var pause = false;
var busy = false;
var abort = false;

var currentPanoConfig = [];

var waypoints = [];
var progress = [];

var panoInterval;
var panoCamControl;
var panoHdr;

var socket;

function initSocket(socket) {
    socket = socket;

    //for panorama and timelepase
    socket.on('requestStatus', function () {
        if (running) {
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
        if (!busy) {
            pause = false;
            panorama();
        } else {
            socket.emit('isBusy', {
                fromSingle: true
            });
        }
    })

    socket.on('retakePanoPicture', function (data) {
        if (!busy) {
            console.log('Retaking picture with index: ' + data.index);
            makePanoStep(data.index);
        } else {
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
    socket.on('panoramaInfo', function () {
        socket.emit('panoramaInfoResponse', {
            config: currentPanoConfig
        })
    })

    //for panorama
    socket.on('panorama', function (data) {
        console.log("Starting Pano Plan");
        currentPanoConfig = data.config;
        waypoints = generatePanoPoints(data.config);
        progress = Array(waypoints.length).fill(0);

        panoInterval = data.interval
        panoCamControl = data.cameraControl
        panoHdr = data.hdr
        console.log(data.config.toString() + " " + data.interval + " " + data.cameraControl + " " + data.hdr)
        panorama(data.config);
    });

    //general
    socket.on('softResetPlaner', function () {
        softReset();
    })
}

async function panorama() {
    console.log('PLAN STARTING!');
    running = 'panorama';
    abort = false;

    var limit = waypoints.length;

    for (var i = 0; i < limit; i++) {
        if (abort) {
            console.log("Pano aborted");
            await motor.driveToPosition([0, 0, 0]);
            softReset();
            return;
        }

        if (progress[i] < 1) await makePanoStep(i);

        if (pause) {
            busy = false
            return;
        }
        if (i == limit - 1) {
            console.log('PANORAMA DONE');
            running = null;
            softReset();
        }
    }
    busy = false;
}

async function makePanoStep(index) {
    return new Promise(async function (resolve, reject) {
        busy = true;
        console.log("Drive to " + waypoints[index]);
        await motor.driveToPosition(waypoints[index])
        await sleep(1000);

        if (panoCamControl && panoHdr) {
            try {
                await camera.takePictureWithHdr();
            } catch (error) {
                console.log(error.message);
            }
        } else if (panoCamControl && !panoHdr) {
            await sleep(500);
            await camera.takePicture();
            await sleep(500);
        }

        await sleep(panoInterval * 1000);
        busy = false;

        progress[index] = progress[index] + 1;
        console.log(progress);

        global.socket.emit('progress', {
            progress: progress
        })

        resolve();
    });
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
    abort = false;
    running = null;

    currentPanoConfig = [];

    waypoints = [];
    progress = [];

    panoInterval = null;
    panoCamControl = null;
    panoHdr = null;
}

module.exports = {
    panorama,
    softReset,
    initSocket
}