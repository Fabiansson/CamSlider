var camera = require('./cam.js');
var motor = require('./arduinoDriver');
var { sleep } = require('./helpers');
const { logger } = require('./logger.js');
var positions = [];
var abort = false;

var timelapseWaypoints;

var startTime = null;
var endTime = null;

var socket;

function initSocket(socket){
    socket = socket;

    //for timelapse
    socket.on('points', function(data){
        positions = data.points
    })
    
    //for panorama and timelapse
    socket.on('abort', async function () {
        abort = true;
        global.mode = null;
    })
    
    //for timelapse
    socket.on('timelapseInfo', function(){
        socket.emit('timelapseInfoResponse', {
            waypoints: timelapseWaypoints,
            startTime: startTime,
            endTime: endTime
        })
    })

    //for timelapse
    socket.on('timelapse', function (data) {
        logger.info("Starting timalapse plan...");
        logger.info("Panorama Settings - Interval: " + data.interval + " movieTime: " + data.movieTime + " cameraControl: " + data.cameraControl + " ramping: " + data.ramping);
        timelapse(data.interval, data.movieTime, data.cameraControl, data.ramping);
    })

    //general
    socket.on('softResetPlaner', function () {
        softReset();
    })
}

async function timelapse(interval, movieTime, cameraControl, ramping) {
    logger.info('Timelapse plan staring...');
    startTime = new Date();
    endTime = new Date();
    endTime.setSeconds(endTime.getSeconds() + (movieTime * interval * 25));

    global.mode = 'timelapse';
    abort = false;
    var amountPauses = (movieTime * 25);
    timelapseWaypoints = generateWaypopints(positions, amountPauses);
    logger.info("Timelapse waypoints:%o", timelapseWaypoints);

    for (var i = 0; i < timelapseWaypoints.length; i++) {
        logger.info("Drive to " + timelapseWaypoints[i]);
        var timeToMove = sleep(2000);
        var move = motor.driveToPosition(timelapseWaypoints[i]);

        await timeToMove;
        await move;

        let nthAnalyze = Math.floor(60 / interval);

        if (cameraControl && ramping && (i % nthAnalyze == 0)) {
            logger.info("Taking picture with ramping and analyzing...");
            var camReturn = camera.takePictureWithRamping(true);
        } else if (cameraControl && ramping) {
            logger.info("Taking picture without ramping and analyzing...");
            var camReturn = camera.takePictureWithRamping(false);
        } else if (cameraControl) {
            var camReturn = camera.takePictureAndDownload();
        }

        if (abort) {
            logger.info("Timelapse aborted!");
            await motor.driveToPosition([0, 0, 0]);
            softReset();
            return;
        }

        await sleep((interval - 2) * 1000);
        if (cameraControl) await camReturn;

        global.socket.emit('progress', {
            step: i + 1,
            max: timelapseWaypoints.length
        })
    }
    await motor.driveToPosition([0, 0, 0]);
    softReset();
    logger.info('Timelapse done!');
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

function softReset() {
    startTime = null;
    endTime = null;
    positions = [];
    timelapseWaypoints = [];
    abort = false;
    global.mode = null;
}

module.exports = {
    timelapse,
    softReset,
    initSocket
}