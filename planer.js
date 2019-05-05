var rpio = require('rpio');
var motorDriver = require('./motorDriverr');
var length = 0;

var buttonPin = 37;
var motorPin = 40;
var dirPin = 38;

function driveToEnd(){
    rpio.open(dirPin, rpio.OUTPUT, rpio.LOW)
    while (motorDriver.checkButton(buttonPin)){
        motorDriver.makeStep(motorPin)
    }
    rpio.sleep(0.3);
}

function initialize(){
    driveToEnd();
    rpio.open(dirPin, rpio.OUTPUT, rpio.HIGH);
    motorDriver.releaseSwitch(motorPin);

    rpio.sleep(1);

    while (motorDriver.checkButton(buttonPin)){
        motorDriver.makeStep(motorPin);
        length++;
    }
    console.log("Total length is: " + length);
    rpio.sleep(0.3);
    rpio.write(dirPin, rpio.LOW);
    motorDriver.releaseSwitch(motorPin);
    var templength = length;
    
    /*while(motorDriver.checkButton(buttonPin) && templength != 0){
        templength--;
        motorDriver.makeStep(motorPin);
    }*/
}

module.exports = {
    initialize
}