var rpio = require('rpio');
var temporal = require('temporal');

var direction = 0;

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

function sleep(time) {
    rpio.sleep(time);
}

function makeStep(pin) {
    rpio.open(pin, rpio.OUTPUT, rpio.LOW);

    rpio.write(pin, rpio.HIGH);
    rpio.sleep(0.001);

    rpio.write(pin, rpio.LOW);
}

function makeSteps(pin, dirPin, steps) {
    return new Promise(function (resolve) {
        if (steps > 0) {
            rpio.open(pin, rpio.OUTPUT, rpio.LOW);
            temporal.resolution(1);
    
            temporal.loop(1, function (loop) {
                rpio.write(pin, loop.called % 2 === 0 ? rpio.HIGH : rpio.LOW)
    
                if (!checkButton(37)) {
                    loop.stop();
                    changeDir(dirPin);
                    releaseSwitch(pin);
                    resolve();
                }
    
                if ((loop.called / 2) > steps) {
                    loop.stop();
                    resolve();
                }
            });
        }else resolve();
    });
    
}

function releaseSwitch(pin) {
    for (i = 0; i < 200; i++) {
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

function getDir() {
    return direction;
}

///NOT TESTED
function changeDir(dirPin) {
    rpio.open(dirPin, rpio.INPUT);
    rpio.read(dirPin) ? setDirRight(dirPin) : setDirLeft(dirPin);
}

function checkButton(pin) {
    rpio.open(pin, rpio.INPUT);
    return rpio.read(pin) ? true : false;
}

module.exports = {
    /*spin,
    stop,
    turnOnce,*/
    sleep,
    makeStep,
    makeSteps,
    releaseSwitch,
    setDirRight,
    setDirLeft,
    getDir,
    changeDir,
    checkButton
}