var motor = require('./motorDriver');
var temporal = require('temporal');
var rpio = require('rpio');
var camera = require('./camera.js');

var buttonPin = 37;

var motorPin_x = 40;
var dirPin_x = 38;
var motorPin_y = 36;
var dirPin_y = 32;
var motorPin_z = 29;
var dirPin_z = 33;

var length = 0;

var positions = [];

var currentPos_x = 0;
var currentPos_y = 0;
var currentPos_z = 0;

var shouldMove;

async function initialize(mode, control) {
    if(mode == 'timelapse'){
        if(control){
            initTimelapseControl();
        }else{
            initTimelapseNoControl();
        }
    }else if(mode == 'panorama'){
        if(control){
            initPanoControl();
        }else{
            initPanoNoControl();
        }
    }else if(mode == 'movie'){
        initMovie();
    }
    
}

async function initTimelapseNoControl(){
    console.log("INIT TIMELAPSE NO CONTROL");
    await driveToEnd();
    rpio.open(motorPin_x, rpio.OUTPUT, rpio.LOW);

    motor.sleep(1);
    temporal.resolution(0.1);

    temporal.loop(0.1, function (loop) {
        rpio.write(motorPin_x, loop.called % 2 === 0 ? rpio.HIGH : rpio.LOW)

        if (!motor.checkButton(buttonPin)) {
            loop.stop();
            length = loop.called / 2;
            console.log("Total length is: " + length);
            motor.setDirRight(dirPin_x);
            motor.releaseSwitch(motorPin_x);
            currentPos_x = 0;
            currentPos_y = 0;
            currentPos_z = 0;
        }
    });
}

function initTimelapseControl(){

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
        }
    });

}

function stop() {
    shouldMove = false;
    console.log('X: ' + currentPos_x + ' Y: ' + currentPos_y + ' Z: ' + currentPos_z);
}

function add() {
    var position = [currentPos_x, currentPos_y, currentPos_z]
    positions.push(position);
    console.log("added position: " + position);
    console.log(positions);
}

function updateCurrentPos(axis, direction, amount) {
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
}

function driveToStart() {
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
}

function driveToEnd() {
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
}

function driveToPosition(position) {
    var x_position = position[0];
    var y_position = position[1];
    var z_position = position[2];

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

    motor.makeSteps(motorPin_x, dirPin_x, wayLength_x);
    motor.makeSteps(motorPin_y, dirPin_y, wayLength_y);
    motor.makeSteps(motorPin_z, dirPin_z, wayLength_z);
    updateCurrentPos('x', x_Dir, wayLength_x);
    updateCurrentPos('y', y_Dir, wayLength_y);
    updateCurrentPos('z', z_Dir, wayLength_z);
    console.log("CURRENT POS X: " + currentPos_x + " CURRENT POS Y: " + currentPos_y + " CURRENT POS Z: " + currentPos_z);
}

async function timelapse(interval, recordingTime, movieTime, cameraControl, ramping) {
    console.log('PLAN STARTING!');
    await driveToStart();

    var amountPauses = (movieTime * 25);
    var waypoints = generateWaypopints(positions, amountPauses);

    for (var i = 0; i < waypoints.length; i++) {
        console.log("Drive to " + waypoints[i]);
        driveToPosition(waypoints[i]);

        socket.emit('progress', {
            value: i,
            max: waypoints.length
        })

        if(cameraControl && ramping & i % 5 == 0){
            camera.takePictureWithRamping(true);
        }else if(cameraControl && ramping){
            camera.takePictureWithRamping(false);
        }else if(cameraControl){
            camera.takePicture();
        }

        socket.on('abort', function () {
            i = waypoints.length;
            driveToStart();
        })

        await sleep(interval * 1000);
    }
}

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

function softReset() {
    positions = [];
}

function test() {
    currentPos_x = 0;
    currentPos_y = 0;
    currentPos_z = 0;
    length = 12000;

    positions = [
        [100, 10, 24],
        [8000, 809, -1546],
        [16000, 96, -3074]
    ];
    timelapse(10, 300, 1.2);
}

module.exports = {
    initialize,
    reposition,
    stop,
    add,
    timelapse,
    softReset,
    test
}