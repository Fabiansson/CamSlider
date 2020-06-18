var camera = require('./cam.js');
var motor = require('./arduinoDriver');
var { sleep } = require('./helpers');
var positions = [];
var running = null;
var abort = false;

var timelapseWaypoints;

var startTime = null;
var endTime = null;

var socket;

function initSocket(socket){
    socket = socket;

    //for panorama and timelepase
    socket.on('requestStatus', function() {
        if(running){
            socket.emit('status', {
                running: 'timelapse'
            })
        }
    })

    //for timelapse
    socket.on('points', function(data){
        positions = data.points
    })
    
    //for panorama and timelapse
    socket.on('abort', async function () {
        abort = true;
        running = null;
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
        console.log("Starting Plan");
        console.log(data.interval + " " + data.movieTime + " " + data.cameraControl + " " + data.ramping);
        timelapse(data.interval, data.movieTime, data.cameraControl, data.ramping);
    })

    //general
    socket.on('softResetPlaner', function () {
        softReset();
    })
}

async function timelapse(interval, movieTime, cameraControl, ramping) {
    console.log('PLAN STARTING!');
    startTime = new Date();
    endTime = new Date();
    endTime.setSeconds(endTime.getSeconds() + (movieTime * interval * 25));

    running = 'timelapse';
    abort = false;
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
            var camReturn = camera.takePictureWithRamping(true);
        } else if (cameraControl && ramping) {
            console.log("takePictureWithRamping false");
            var camReturn = camera.takePictureWithRamping(false);
        } else if (cameraControl) {
            var camReturn = camera.takePictureAndDownload();
        }

        if (abort) {
            console.log("Timelapse aborted!");
            await motor.driveToPosition([0, 0, 0]);
            softReset();
            global.socket.emit('initDone');
            return;
        }

        await sleep((interval - 2) * 1000);
        if (cameraControl) await camReturn;

        global.socket.emit('progress', {
            step: i + 1,
            max: timelapseWaypoints.length
        })
    }
    running = null;
    console.log('Timelapse done!');
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
    running = null;
}

module.exports = {
    timelapse,
    softReset,
    initSocket
}