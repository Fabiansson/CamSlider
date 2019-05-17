var rpio = require('rpio');

var diection = 0;

/*var looping;

function spin (pin) {
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);
        console.log("start spin");
        
        looping = setInterval(function(){
            for(var i = 1; i < 100; i++){
            rpio.write(pin, rpio.HIGH);
            rpio.sleep(0.001);
            rpio.write(pin, rpio.LOW);
        }
        },1);
    }
  
    function stop () {
        clearInterval(looping);
    }

    function turnOnce (pin) {
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);

        for(var i = 0; i < 200; i++){
            rpio.write(pin, (0,1,0))
            rpio.write(pin, rpio.HIGH);
            rpio.sleep(0.001);
            rpio.write(pin, rpio.LOW);
        }
    }*/

function makeStep(pin) {
    rpio.open(pin, rpio.OUTPUT, rpio.LOW);

    rpio.write(pin, rpio.HIGH);
    rpio.sleep(0.0001);

    rpio.write(pin, rpio.LOW);
}

function releaseSwitch(pin) {
    for (i = 0; i < 50; i++) {
        makeStep(pin)
    }
}

function setDirRight(dirPin) {
    rpio.open(dirPin, rpio.OUTPUT, rpio.LOW);
    direction = 0;
}

function setDirLeft(dirPin) {
    rpio.open(dirPin, rpio.OUTPUT, rpio.HIGH);
    direction = 1;
}

function getDir(){
    return direction;
}

function checkButton(pin) {
    rpio.open(pin, rpio.INPUT);
    return rpio.read(pin) ? true : false;
}

module.exports = {
    /*spin,
    stop,
    turnOnce,*/
    makeStep,
    releaseSwitch,
    setDirRight,
    setDirLeft,
    getDir,
    checkButton
}