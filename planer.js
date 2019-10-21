var camera = require('./cam.js');
var motor = require('./arduinoDriver');

var positions = [];

var running = null;
var pause = false;
var busy = false;
var abort = false;

var timelapseWaypoints;

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

    socket.on('requestStatus', function() {
        socket.emit('status', {
            running: running
        })
    })

    //submit positions for timelapse
    socket.on('points', function(data){
        positions = data.points
    })

    //pause for panorama
    socket.on('pause', function () {
        pause = true;
    })
    
    //resume for panorama
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
    
    //abort for timelapse and panorama
    socket.on('abort', async function () {
        abort = true;
        running = null;
    })
    
    socket.on('panoramaInfo', function(){
        console.log(currentPanoConfig);
        socket.emit('panoramaInfoResponse', {
            config: currentPanoConfig
        })
    })
    
    socket.on('timelapseInfo', function(){
        socket.emit('timelapseInfoResponse', {
            waypoints: timelapseWaypoints
        })
    })

    socket.on('timelapse', function (data) {
        console.log("Starting Timelapse Plan");
        console.log(data.interval + " " + data.movieTime + " " + data.cameraControl + " " + data.ramping);
        timelapse(data.interval, data.movieTime, data.cameraControl, data.ramping);
    })
    
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

    socket.on('softResetPlaner', function () {
        softReset();
    })
}

async function timelapse(interval, movieTime, cameraControl, ramping) {
    console.log('PLAN STARTING!');
    running = 'timelapse';
    var amountPauses = (movieTime * 25);
    timelapseWaypoints = generateWaypopints(positions, amountPauses);
    console.log(timelapseWaypoints);

    for (var i = 0; i < timelapseWaypoints.length; i++) {
        console.log("Drive to " + timelapseWaypoints[i]);
        var timeToMove = sleep(2000);
        var move = motor.driveToPosition(timelapseWaypoints[i]);

        await timeToMove;
        await move;

        if (cameraControl && ramping && (i % 5 == 0)) {
            console.log("takePictureWithRamping true");
            var camReady = camera.takePictureWithRamping(true);
        } else if (cameraControl && ramping) {
            console.log("takePictureWithRamping false");
            var camReady = camera.takePictureWithRamping(false);
        } else if (cameraControl) {
            var camReady = camera.takePicture();
        }

        if (abort) {
            console.log("Timelapse aborted!");
            await motor.driveToPosition([0, 0, 0]);
            softReset();
            global.socket.emit('initDone');
            return;
        }

        await sleep((interval - 2) * 1000);
        if (cameraControl) await camReady

        global.socket.emit('progress', {
            value: i + 1,
            max: timelapseWaypoints.length
        })
    }
    running = null;
    console.log('Timelapse done!');
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

function getDistance(point1, point2) {
    // speed in 3d space is mutated according only to the X distance,
    // to keep speed constant in X dimension
    return point2[0] - point1[0];
}

function generateWaypopints(points, n) {
    const pointDistances = points.slice(1).map((point, index) => getDistance(points[index], point));

    const fullDistance = pointDistances.reduce((sum, distance) => sum + distance, 0);

    const distancePerSection = fullDistance / n;

    return points.slice(1)
        .reduce((last, point, index) => {
            const thisDistance = pointDistances[index];

            const numRestPoints = Math.max(0, Math.floor(thisDistance / distancePerSection) - 1);

            if (!numRestPoints) {
                return last.concat([point]);
            }

            const thisYVector = point[1] - points[index][1];
            const thisZVector = point[2] - points[index][2];

            return last.concat(new Array(numRestPoints).fill(0)
                .reduce((section, item, restIndex) => {
                    return section.concat([
                        [
                            Math.round(points[index][0] + (restIndex + 1) * distancePerSection),
                            Math.round(points[index][1] + (restIndex + 1) * thisYVector * distancePerSection / thisDistance),
                            Math.round(points[index][2] + (restIndex + 1) * thisZVector * distancePerSection / thisDistance)
                        ]
                    ]);
                }, [])
                .concat([point])
            );

        }, points.slice(0, 1));
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
    positions = [];
    currentPos_x = 1;
    currentPos_y = 0;
    currentPos_z = 0;

    pause = false;
    busy = false;
    panoIndex = 0;
    abort = false;
}

module.exports = {
    timelapse,
    panorama,
    softReset,
    initSocket
}