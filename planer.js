//var motor = require('./motorDriver');
var temporal = require('temporal');
var rpio = require('rpio');
var camera = require('./cam.js');
var motor = require('./arduinoDriver');

/*var buttonPin = 37;

var motorPin_x = 40;
var dirPin_x = 38;
var motorPin_y = 36;
var dirPin_y = 32;
var motorPin_z = 29;
var dirPin_z = 33;*/

var buttonPin = 40;

var motorPin_x = 5;
var dirPin_x = 3;
var motorPin_y = 11;
var dirPin_y = 7;
var motorPin_z = 15;
var dirPin_z = 13;

var length = 0;

var positions = [];

var currentPos_x = 1;
var currentPos_y = 0;
var currentPos_z = 0;

var shouldMove;
var pause = false;
var busy = false;
var abort = false;


var socket;

function initSocket(socket){
    socket = socket;

    /*socket.on('getPosition', function(){
        socket.emit('reportingPosition', {
            x: currentPos_x,
            y: currentPos_y,
            z: currentPos_z
        })
    })*/

    socket.on('points', function(data){
        positions = data.points
    })


    /*socket.on('waterscale', function(){
        console.log('waterscale');
        waterscale();
    })*/

    /*socket.on('add', function () {
        console.log("add position");
        add();
    });*/
    
    socket.on('pause', function () {
        pause = true;
    })
    
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
    
    socket.on('abort', function () {
        abort = true;
        driveToStart();
        softReset();
    })
    
    socket.on('panoramaInfo', function(){
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
        console.log("Starting Plan");
        console.log(data.interval + " " + data.recordTime + " " + data.movieTime + " " + data.cameraControl + " " + data.ramping);
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

    socket.on('test', function () {
        console.log("TEST RUN!");
        test();
    })

    /*socket.on('init', async function(){
        if(!initialized) await initTimelapse();
        socket.emit('initDone');
    })*/
}




var timelapseWaypoints;



var panoConfig = {
    "full": {
        "eight": [
            [1, 90],
            [3, 0],
            [1, -90]
        ],
        "twelve": [
            [1, 90],
            [4, 0],
            [1, -90]
        ],
        "fifteen": [
            [1, 90],
            [6, 0],
            [1, -90]
        ],
        "fifteenalt": [
            [1, 90],
            [6, 45],
            [6, -45],
            [1, -90]
        ],
        "sixteen": [
            [1, 90],
            [7, 33],
            [7, -32],
            [1, -90]
        ],
        "seventeen": [
            [1, 90],
            [8, 44],
            [8, 0],
            [8, -43][1, -90]
        ],
        "eighteen": [
            [1, 90],
            [8, 45],
            [8, 0],
            [8, -46][1, -90]
        ],
        "twenty": [
            [1, 90],
            [9, 46],
            [9, 0],
            [9, -45][1, -90]
        ],
        "twenyfour": [
            [1, 90],
            [10, 48],
            [10, 0],
            [10, -47][1, -90]
        ],
        "twenyeight": [
            [1, 90],
            [11, 56],
            [12, 19],
            [12, -18],
            [11, -55],
            [1, -90]
        ],
        "thirtyfive": [
            [1, 90],
            [13, 67],
            [17, 40],
            [18, 14],
            [18, -13],
            [17, -39],
            [13, -66],
            [1, -90]
        ]
    }
}
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

/*async function initialize(mode, control) {
    if (mode == 'timelapse') {
        if (control) {
            if (camera.hasCamera()) {
                await initTimelapse();
                socket.emit('initializeDone', {
                    success: true,
                    mode: 'timelapse',
                    control: 'true'
                })
                return;
            } else {
                socket.emit('initializeDone', {
                    success: false,
                    mode: 'timelapse',
                    control: 'false'
                })
                return;
            }
        }
        await initTimelapse();
        socket.emit('initializeDone', {
            success: true,
            mode: 'timelapse',
            control: 'false'
        })

    } else if (mode == 'panorama') {
        if (control) {
            if (camera.hasCamera()) {
                socket.emit('initializeDone', {
                    success: true,
                    mode: 'panorama',
                    control: 'true'
                })
                return
            } else {
                socket.emit('initializeDone', {
                    success: false,
                    mode: 'panorama',
                    control: 'true'
                });
                return;
            }
        }
        socket.emit('initializeDone', {
            success: true,
            mode: 'panorama',
            control: 'false'
        });

    } else if (mode == 'movie') {
        initMovie();
    }

}

async function initTimelapse() {
    return new Promise(async (resolve) => {
        console.log("INIT TIMELAPSE");
        //await driveToStart();

        await sleep(4000);
        resolve();
    });
}

function waterscale() {
    currentPos_x = 0;
    currentPos_y = 0;
    currentPos_z = 0;
}

function reposition(axis, direction) {
    shouldMove = true;
    var motorPin;
    var dirPin;

    switch (axis) {
        case 'x':
            motorPin = motorPin_x;
            dirPin = dirPin_x;
            break;
        case 'y':
            motorPin = motorPin_y;
            dirPin = dirPin_y;
            break;
        case 'z':
            motorPin = motorPin_z;
            dirPin = dirPin_z;
            break;
    }

    if (direction == 'right') {
        motor.setDirRight(dirPin);
    } else {
        motor.setDirLeft(dirPin);
    }

    rpio.open(motorPin, rpio.OUTPUT, rpio.LOW);

    var res;
    if (axis == 'x') {
        res = 0.1;
        temporal.resolution(res);
    } else {
        res = 1;
        temporal.resolution(res);
    }

    temporal.loop(res, function (loop) {
        rpio.write(motorPin, loop.called % 2 === 0 ? rpio.HIGH : rpio.LOW)

        if (!motor.checkButton(buttonPin)) {
            loop.stop();
            motor.changeDir(dirPin);
            motor.releaseSwitch(motorPin);
            updateCurrentPos(axis, direction, loop.called / 2 - 200);
        }
        if (!shouldMove) {
            loop.stop();
            updateCurrentPos(axis, direction, loop.called / 2);
            console.log('X: ' + currentPos_x + ' Y: ' + currentPos_y + ' Z: ' + currentPos_z);
        }
    });

}

function stop() {
    shouldMove = false;
}*/

/*function add() {
    var position = [currentPos_x, currentPos_y, currentPos_z]
    positions.push(position);
    console.log("added position: " + position);
    console.log(positions);
}*/

/*function updateCurrentPos(axis, direction, amount) {
    if (direction == 'right') {
        if (axis == 'x')
            currentPos_x = currentPos_x + amount;
        else if (axis == 'y')
            currentPos_y = currentPos_y + amount;
        else
            currentPos_z = currentPos_z + amount;
    } else {
        if (axis == 'x')
            currentPos_x = currentPos_x - amount;
        else if (axis == 'y')
            currentPos_y = currentPos_y - amount;
        else
            currentPos_z = currentPos_z - amount;
    }
}*/

/*function driveToStart() {
    if (currentPos_x != 0) {
        rpio.open(motorPin_x, rpio.OUTPUT, rpio.LOW);
        motor.setDirLeft(dirPin_x);

        return new Promise(function (resolve) {
            temporal.resolution(0.1);

            temporal.loop(0.1, function (loop) {
                rpio.write(motorPin_x, loop.called % 2 === 0 ? rpio.HIGH : rpio.LOW)

                if (!motor.checkButton(buttonPin)) {
                    loop.stop();
                    motor.sleep(0.3);
                    motor.setDirRight(dirPin_x);
                    motor.releaseSwitch(motorPin_x);
                    currentPos_x = 0;
                    resolve();
                    console.log("DROVE TO START!");
                }
            });
        });
    }
}*/

/*function driveToEnd() {
    rpio.open(motorPin_x, rpio.OUTPUT, rpio.LOW);
    motor.setDirRight(dirPin_x);

    return new Promise(function (resolve) {
        temporal.resolution(0.1);

        temporal.loop(0.1, function (loop) {
            rpio.write(motorPin_x, loop.called % 2 === 0 ? rpio.HIGH : rpio.LOW)

            if (!motor.checkButton(buttonPin)) {
                loop.stop();
                motor.sleep(0.3);
                motor.setDirLeft(dirPin_x);
                motor.releaseSwitch(motorPin_x);
                resolve();
                console.log("DROVE TO END!");
            }
        });
    });
}*/

/*async function driveToPosition(position) {
    return new Promise(async (resolve) => {
        if (position.length == 3) {
            var x_position = position[0];
            var y_position = position[1];
            var z_position = position[2];
        } else {
            var x_position = currentPos_x;
            var y_position = position[0];
            var z_position = position[1];
        }

        var wayLength_x = Math.abs(x_position - currentPos_x);
        var wayLength_y = Math.abs(y_position - currentPos_y);
        var wayLength_z = Math.abs(z_position - currentPos_z);

        var x_Dir;
        var y_Dir;
        var z_Dir;

        if (currentPos_x < x_position) {
            motor.setDirRight(dirPin_x);
            x_Dir = 'right';
        } else {
            motor.setDirLeft(dirPin_x);
            x_dir = 'left';
        }

        if (currentPos_y < y_position) {
            motor.setDirRight(dirPin_y);
            y_Dir = 'right';
        } else {
            motor.setDirLeft(dirPin_y);
            y_Dir = 'left';
        }

        if (currentPos_z < z_position) {
            motor.setDirRight(dirPin_z);
            z_Dir = 'right';
        } else {
            motor.setDirLeft(dirPin_z);
            z_Dir = 'left';
        }
        var xMove = motor.makeSteps(motorPin_x, dirPin_x, wayLength_x);
        var yMove = motor.makeSteps(motorPin_y, dirPin_y, wayLength_y);
        var zMove = motor.makeSteps(motorPin_z, dirPin_z, wayLength_z);
        updateCurrentPos('y', y_Dir, wayLength_y);
        updateCurrentPos('x', x_Dir, wayLength_x);
        updateCurrentPos('z', z_Dir, wayLength_z);
        console.log("CURRENT POS X: " + currentPos_x + " CURRENT POS Y: " + currentPos_y + " CURRENT POS Z: " + currentPos_z);
        await xMove;
        await yMove;
        await zMove;
        resolve();
    });

}*/

async function timelapse(interval, movieTime, cameraControl, ramping) {
    console.log('PLAN STARTING!');
    await driveToStart();

    var amountPauses = (movieTime * 25);
    timelapseWaypoints = generateWaypopints(positions, amountPauses);
    console.log(timelapseWaypoints);

    /*socket.emit('timelapseInfo', {
        waypoints: waypoints,
        amountPauses: amountPauses
    })*/

    for (var i = 0; i < timelapseWaypoints.length; i++) {
        console.log("Drive to " + timelapseWaypoints[i]);
        var timeToMove = sleep(2000);
        var move = driveToPosition(timelapseWaypoints[i]);

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
            return;
        }

        await sleep((interval - 2) * 1000);
        if (cameraControl) await camReady

        socket.emit('progress', {
            value: i + 1,
            max: timelapseWaypoints.length
        })
    }
}

async function panorama(config, interval, cameraControl, hdr, index, single) {
    console.log('PLAN STARTING!');

    var waypoints = generatePanoPoints(config);
    var limit = waypoints.length;

    if(single) limit = index + 1

    for (var i = index; i < limit; i++) {
        busy = true;
        console.log("Drive to " + waypoints[i]);
        //await driveToPosition(waypoints[i])
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
            return;
        }

        await sleep(interval * 1000);

        if (pause && !single) {
            panoIndex = i + 1;
            busy = false
            return;
        }
    }
    busy = false;
}

/*async function doPanorama(waypoints, interval, cameraControl, hdr) {
    busy = true;
    console.log("Drive to " + waypoints[0]);
    await driveToPosition(waypoints.shift())
    socket.emit('progress', {
        value: i + 1,
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
        return [];
    }

    await sleep(interval * 1000);

    if (!pause && waypoints.length > 0) return doPanorama(waypoints, interval, cameraControl, hdr);
    busy = false;
    return waypoints;
}*/

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDistance(point1, point2) {
    // speed in 3d space is mutated according only to the X distance,
    // to keep speed constant in X dimension
    return Math.abs(point1[0] - point2[0]);
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
    var yStepsPerRotation = 36000;
    var zStepsPerRotation = 36000;

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
    abort = false;
    panoIndex = 0;

    initialized = false;
}

async function test() {
    /*try {
        await camera.takeReferencePicture();
    } catch (er) {
        console.log(er);
    }*/

    currentPos_x = 0;
    currentPos_y = 0;
    currentPos_z = 0;
    length = 50000;

    positions = [
        [4521, 0, 0],
        [50000, 5580, 6000],
        [100000, -5580, -6000]
    ];
    timelapse(3, 1.2, false, false);
}

module.exports = {
    initialize,
    reposition,
    stop,
    add,
    timelapse,
    panorama,
    softReset,
    test,
    waterscale,
    initSocket
}