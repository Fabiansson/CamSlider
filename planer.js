var motor = require('./motorDriver');

var buttonPin = 37;

var motorPin_x = 40;
var dirPin_x = 38;
var motorPin_y = 36;
var dirPin_y = 32;
var motorPin_z = 29;
var dirPin_z = 33;

var length = 0;
var length_y = 0;
var length_z = 0;

var positions = [];

var currentPos_x = 0;
var currentPos_y = 0;
var currentPos_z = 0;

var moving;

/*function driveToEnd() {
    rpio.open(dirPin, rpio.OUTPUT, rpio.LOW)
    while (motor.checkButton(buttonPin)) {
        motor.makeStep(motorPin)
    }
    rpio.sleep(0.3);
}*/

function initialize() {
    motor.setDirRight(dirPin_x);

    while (motor.checkButton(buttonPin)) {
        motor.makeStep(motorPin_x)
    }
    motor.sleep(0.3);

    motor.setDirLeft(dirPin_x);
    motor.releaseSwitch(motorPin_x);

    motor.sleep(1);

    while (motor.checkButton(buttonPin)) {
        motor.makeStep(motorPin_x);
        length++;
    }
    console.log("Total length is: " + length);
    motor.sleep(0.3);
    motor.setDirRight(dirPin_x);
    motor.releaseSwitch(motorPin_x);
    length = length - 50;
    currentPos_x = 0;
}

/*function someSteps(pin, direction) {
    if (direction == 'right') {
        motor.setDirRight(dirPin);
    } else {
        motor.setDirLeft(dirPin);
    }

    for(var i = 0; i < 200; i++){
        if (motor.checkButton(buttonPin)) {
            motor.makeStep(pin);
            if(direction == 'right'){
                currentPos++;
            }else{
                currentPos--;
            }
        }
    }
    
}*/

function reposition(axis, direction, continuous) {
    var motorPin = 0;
    var dirPin = 0;

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

    if (continuous == 'true') {
        moving = setInterval(function () {
            if (motor.checkButton(buttonPin)) {
                motor.makeStep(motorPin);
                updateCurrentPos(axis, direction);
            }
        }, 1);
    } else {
        for (var i = 0; i < 200; i++) {
            if (motor.checkButton(buttonPin)) {
                motor.makeStep(motorPin);
                updateCurrentPos(axis, direction);
            }
        }
    }
}

function stop() {
    clearInterval(moving);
    console.log('X: ' + currentPos_x + ' Y: ' + currentPos_y + ' Z: ' + currentPos_z);
}

function add() {
    var position = [currentPos_x, currentPos_y, currentPos_z]
    positions.push(position);
    console.log("added position: " + position);
    console.log(positions);
}

function updateCurrentPos(axis, direction) {
    if (direction == 'right') {
        if (axis == 'x')
            currentPos_x++;
        else if (axis == 'y')
            currentPos_y++;
        else
            currentPos_z++;
    } else {
        if (axis == 'x')
            currentPos_x--;
        else if (axis == 'y')
            currentPos_y--;
        else
            currentPos_z--;
    }
}

function driveToStart() {
    if (currentPos_x != 0) {
        motor.setDirLeft(dirPin_x);
        while (motor.checkButton(buttonPin)) {
            motor.makeStep(motorPin_x)
        }
        motor.sleep(0.3);
        motor.setDirRight(dirPin_x);
        motor.releaseSwitch(motorPin_x);
        currentPos_x = 0;
    }
}

async function go(interval, recordingTime, movieTime) {
    console.log('PLAN STARTING!');
    driveToStart();
    positions.push([length, 0, 0])

    //stepInterval = recordingTime / length;
    //stepInterval = (recordingTime - (movieTime * 25 * (interval / 2))) / length
    stepInterval = (recordingTime / interval * (4/2)) / length; //Processing Time = 4
    console.log("stepInterval: " + stepInterval)

    var numberOfPositions = positions.length;
    console.log(positions)

    var amountPauses = (movieTime * 25) - 1;
    var pauseRatio = amountPauses / length;
    var xToPauseRatioSteps = 0;

    for (var i = 0; i < numberOfPositions; i++) {
        var x_position = positions[i][0];
        var y_position = positions[i][1];
        var z_position = positions[i][2];

        var wayLength_x = Math.abs(x_position - currentPos_x);
        var wayLength_y = Math.abs(y_position - currentPos_y);
        var wayLength_z = Math.abs(z_position - currentPos_z);
        console.log("WAY X: " + wayLength_x + "WAY Y: " + wayLength_y + "WAY Z: " + wayLength_z)

        var y_ratio = wayLength_y / wayLength_x
        var z_ratio = wayLength_z / wayLength_x
        console.log("Y RATIO: " + y_ratio + "Z RATIO: " + z_ratio)

        var xStepsMade = 0;
        var xToYRatioSteps = 0;
        var xToZRatioSteps = 0;

        while (xStepsMade != wayLength_x) {
            if (currentPos_x < x_position) {
                motor.setDirRight(dirPin_x);
                motor.makeStep(motorPin_x);
                updateCurrentPos('x', 'right');
                xStepsMade++;
                xToYRatioSteps++;
                xToZRatioSteps++;
                xToPauseRatioSteps++;
            } else if (currentPos_x > x_position) {
                motor.setDirLeft(dirPin_x);
                motor.makeStep(motorPin_x);
                updateCurrentPos('x', 'left');
                xStepsMade++;
                xToYRatioSteps++;
                xToZRatioSteps++;
                xToPauseRatioSteps++;
            }

            if (xToYRatioSteps * y_ratio > 1 && currentPos_y < y_position) {
                motor.setDirRight(dirPin_y);
                motor.makeStep(motorPin_y);
                updateCurrentPos('y', 'right')
                xToYRatioSteps = 0;
            } else if (xToYRatioSteps * y_ratio > 1 && currentPos_y > y_position) {
                motor.setDirLeft(dirPin_y);
                motor.makeStep(motorPin_y);
                updateCurrentPos('y', 'left')
                xToYRatioSteps = 0;
            }

            if (xToZRatioSteps * z_ratio > 1 && currentPos_z < z_position) {
                motor.setDirRight(dirPin_z);
                motor.makeStep(motorPin_z);
                updateCurrentPos('z', 'right')
                xToZRatioSteps = 0;
            } else if (xToZRatioSteps * z_ratio > 1 && currentPos_z > z_position) {
                motor.setDirLeft(dirPin_z);
                motor.makeStep(motorPin_z);
                updateCurrentPos('z', 'left')
                xToZRatioSteps = 0;
            }
            await sleep(stepInterval * 1000);
            if(pauseRatio * xToPauseRatioSteps > 1){
                await sleep(interval * 800); //WAITING TIME DONT MOVE
                xToPauseRatioSteps = 0;
            }
        }
    }
    console.log('PLAN END!');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

module.exports = {
    initialize,
    reposition,
    stop,
    add,
    go
}