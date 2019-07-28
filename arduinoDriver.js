const Serialport = require("serialport");
const Firmata = require("firmata");
const board = new Firmata(new Serialport(...));

board.on("ready", () => {

});

var direction = 1;

var xMotor = {
    deviceNum: 0, // <number> Device number for the stepper (range 0-9)
    type: board.STEPPER.TYPE.DRIVER, // <number> (optional) Type of stepper or controller; default is FOUR_WIRE
    stepSize: board.STEPPER.STEP_SIZE.HALF, // <number> (optional) Size of step; default is WHOLE
    stepPin: 2, // <number> (required if type === DRIVER) The step pin for a step+direction stepper driver
    directionPin: 3, // <number> (required if type === DRIVER) The direction pin for a step+direction stepper driver
    motorPin1: 2, // <number> (required if type !== DRIVER) Motor control pin 1
    motorPin2: 3, // <number> (required if type !== DRIVER) Motor control pin 2
    motorPin3: 4, // <number> (required if type === THREE_WIRE or FOUR_WIRE) Motor control pin 3
    motorPin4: 5, // <number> (required if type === FOUR_WIRE) Motor control pin 4
    enablePin: 6, // <number> (optional) Enable pin for motor controller pin
    invertPins: 0 // <number> (optional) Controls which pins to invert (see table below); default is 0
};

var yMotor = {
    deviceNum: 0, // <number> Device number for the stepper (range 0-9)
    type: board.STEPPER.TYPE.DRIVER, // <number> (optional) Type of stepper or controller; default is FOUR_WIRE
    stepSize: board.STEPPER.STEP_SIZE.HALF, // <number> (optional) Size of step; default is WHOLE
    stepPin: 2, // <number> (required if type === DRIVER) The step pin for a step+direction stepper driver
    directionPin: 3, // <number> (required if type === DRIVER) The direction pin for a step+direction stepper driver
    motorPin1: 2, // <number> (required if type !== DRIVER) Motor control pin 1
    motorPin2: 3, // <number> (required if type !== DRIVER) Motor control pin 2
    motorPin3: 4, // <number> (required if type === THREE_WIRE or FOUR_WIRE) Motor control pin 3
    motorPin4: 5, // <number> (required if type === FOUR_WIRE) Motor control pin 4
    enablePin: 6, // <number> (optional) Enable pin for motor controller pin
    invertPins: 0 // <number> (optional) Controls which pins to invert (see table below); default is 0
};

var zMotor = {
    deviceNum: 0, // <number> Device number for the stepper (range 0-9)
    type: board.STEPPER.TYPE.DRIVER, // <number> (optional) Type of stepper or controller; default is FOUR_WIRE
    stepSize: board.STEPPER.STEP_SIZE.HALF, // <number> (optional) Size of step; default is WHOLE
    stepPin: 2, // <number> (required if type === DRIVER) The step pin for a step+direction stepper driver
    directionPin: 3, // <number> (required if type === DRIVER) The direction pin for a step+direction stepper driver
    motorPin1: 2, // <number> (required if type !== DRIVER) Motor control pin 1
    motorPin2: 3, // <number> (required if type !== DRIVER) Motor control pin 2
    motorPin3: 4, // <number> (required if type === THREE_WIRE or FOUR_WIRE) Motor control pin 3
    motorPin4: 5, // <number> (required if type === FOUR_WIRE) Motor control pin 4
    enablePin: 6, // <number> (optional) Enable pin for motor controller pin
    invertPins: 0 // <number> (optional) Controls which pins to invert (see table below); default is 0
};


var shouldMove;

/*function makeStep(pin) {
    rpio.open(pin, rpio.OUTPUT, rpio.LOW);

    rpio.write(pin, rpio.HIGH);
    rpio.sleep(0.001);

    rpio.write(pin, rpio.LOW);
}*/


async function initTimelapse() {
    await driveToStart();
    board.accelStepperZero(yMotor);
    board.accelStepperZero(zMotor);
    socket.emit('initializeDone', {
        success: true
    })
}

function reposition(axis, dir) {
    shouldMove = true;
    var deviceNumber;

    switch (axis) {
        case 'x':
            deviceNumber = xMotor;
            break;
        case 'y':
            deviceNumber = yMotor;
            break;
        case 'z':
            deviceNumber = zMotor;
            break;
    }


    if (dir == 'right') {
        setDirRight();
    } else {
        setDirLeft();
    }

    board.accelStepperStep(deviceNumber, direction * 100000);

    board.digitalRead(buttonPin, function (value) {
        board.reportDigitalPin(buttonPin, 0)
        board.accelStepperStop(deviceNum);
        changeDir();
        await releaseSwitch();
        
    });

    temporal.loop(1, function (loop) {
        if (!shouldMove) {
            loop.stop();
            board.accelStepperStop(deviceNum);
        }
    });
}

function stop() {
    shouldMove = false;
}

function getPos(device) {
    return board.accelStepperReportPosition(device);
}

function driveToStart() {
    return new Promise(async (resolve) => {
        setDirLeft();
        board.accelStepperStep(deviceNum, direction * 100000)
        board.digitalRead(buttonPin, function (value) {
            board.reportDigitalPin(buttonPin, 0)
            board.accelStepperStop(deviceNum);
            changeDir();
            await releaseSwitch();
            board.accelStepperZero(xMotor);
            resolve();
        });
    });
}

function driveToEnd() {
    return new Promise(async (resolve) => {
        setDirRight();
        board.accelStepperStep(deviceNum, direction * 100000)
        while (true) {
            if (!checkButton()) {
                board.accelStepperStop(deviceNum);
                break;
            }
        }
        setDirLeft();
        await releaseSwitch();
        resolve();
    });
}

async function driveToPosition(position) {
    return new Promise(async (resolve) => {
        if (position.length == 3) {
            var x_position = position[0];
            var y_position = position[1];
            var z_position = position[2];
        } else {
            var x_position = getPos(xMotor);
            var y_position = position[0];
            var z_position = position[1];
        }

        var xMove = stepTo(xMotor, x_position)
        var yMove = stepTo(yMotor, y_position)
        var zMove = stepTo(zMotor, z_position)

        await xMove;
        await yMove;
        await zMove;
        resolve();
    });
}

function stepTo(motor, position) {
    return new Promise(function (resolve) {
        board.accelStepperTo(motor, position, function () {
            resolve();
        })
    });
}

function releaseSwitch() {
    return new Promise(function (resolve) {
        board.accelStepperStep(xMotor, direction * 200, function () {
            resolve();
        });
    });

}

function setDirRight(dirPin) {
    direction = 1;
}

function setDirLeft(dirPin) {
    direction = -1;
}

function getDir() {
    return direction;
}

///NOT TESTED
function changeDir() {
    direction = direction * -1;
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