var rpio = require('rpio');
var motor = require('./motorDriver');

var buttonPin = 37;
var motorPin = 40;
var dirPin = 38;

var length = 0;
var interval = null;
var movieTime = null;
var recordingTime = null;
var positions = [];

var currentPos = 0;

var moving;

function driveToEnd() {
    rpio.open(dirPin, rpio.OUTPUT, rpio.LOW)
    while (motor.checkButton(buttonPin)) {
        motor.makeStep(motorPin)
    }
    rpio.sleep(0.3);
}

function initialize() {
    driveToEnd();
    motor.setDirLeft(dirPin);
    motor.releaseSwitch(motorPin);

    rpio.sleep(1);

    while (motor.checkButton(buttonPin)) {
        motor.makeStep(motorPin);
        length++;
    }
    console.log("Total length is: " + length);
    rpio.sleep(0.3);
    motor.setDirRight(dirPin);
    motor.releaseSwitch(motorPin);
    length = length - 50;
    currentPos = 0;
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

function reposition(pin, direction, continuous) {
    if (direction == 'right') {
        motor.setDirRight(dirPin);
    } else {
        motor.setDirLeft(dirPin);
    }

    if(continuous){
        moving = setInterval(function () {
            if (motor.checkButton(buttonPin)) {
                motor.makeStep(pin);
                updateCurrentPos(direction);
            }
        }, 1);
    }else{
        for(var i = 0; i < 200; i++){
            if (motor.checkButton(buttonPin)) {
                motor.makeStep(pin);
                updateCurrentPos(direction);
            }
        }
    }

    
}

function stop() {
    clearInterval(moving);
    console.log(currentPos);
}

function add() {
    positions.push(currentPos);
    console.log("added position: " + currentPos);
    console.log(positions);
}

function updateCurrentPos(direction){
    if(direction == 'right'){
        currentPos++;
    }else{
        currentPos--;
    }
}

module.exports = {
    initialize,
    someSteps,
    reposition,
    stop,
    add
}