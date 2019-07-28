const Firmata = require("firmata");
const board = new Firmata('/dev/ttyUSB0');

var socket;

function initSocket(socket){
    socket = socket

    socket.on('getPosition', function(){
        socket.emit('reportingPosition',{
            x: getPos(0),
            y: getPos(1),
            z: getPos(2)
        })
    })

    socket.on('waterscale', function(){
        console.log('waterscale');
        board.accelStepperZero(0);
        board.accelStepperZero(1);
        board.accelStepperZero(2);
    })

    socket.on('init', async function(){
        if(!initialized) await initTimelapse();
        initialized = true;
        socket.emit('initDone');
    })

    socket.on('reposition', function (data) {
        console.log("reposition on motor: " + data.axis + " in direction: " + data.direction);
        reposition(data.axis, data.direction);
    });

    socket.on('stop reposition', function () {
        console.log("stop reposition");
        stop();
    });
}

board.on("ready", () => {
    console.log("Arduino ready");
});

var direction = 1;

var xMotor = {
    deviceNum: 0, // <number> Device number for the stepper (range 0-9)
    type: board.STEPPER.TYPE.DRIVER, // <number> (optional) Type of stepper or controller; default is FOUR_WIRE
    //stepSize: board.STEPPER.STEP_SIZE.HALF, // <number> (optional) Size of step; default is WHOLE
    stepPin: 2, // <number> (required if type === DRIVER) The step pin for a step+direction stepper driver
    directionPin: 3, // <number> (required if type === DRIVER) The direction pin for a step+direction stepper driver
};

var yMotor = {
    deviceNum: 1, // <number> Device number for the stepper (range 0-9)
    type: board.STEPPER.TYPE.DRIVER, // <number> (optional) Type of stepper or controller; default is FOUR_WIRE
    //stepSize: board.STEPPER.STEP_SIZE.HALF, // <number> (optional) Size of step; default is WHOLE
    stepPin: 4, // <number> (required if type === DRIVER) The step pin for a step+direction stepper driver
    directionPin: 5, // <number> (required if type === DRIVER) The direction pin for a step+direction stepper driver
};

var zMotor = {
    deviceNum: 2, // <number> Device number for the stepper (range 0-9)
    type: board.STEPPER.TYPE.DRIVER, // <number> (optional) Type of stepper or controller; default is FOUR_WIRE
    //stepSize: board.STEPPER.STEP_SIZE.HALF, // <number> (optional) Size of step; default is WHOLE
    stepPin: 6, // <number> (required if type === DRIVER) The step pin for a step+direction stepper driver
    directionPin: 7, // <number> (required if type === DRIVER) The direction pin for a step+direction stepper driver
};


var shouldMove;

var initialized = false;

/*function makeStep(pin) {
    rpio.open(pin, rpio.OUTPUT, rpio.LOW);

    rpio.write(pin, rpio.HIGH);
    rpio.sleep(0.001);

    rpio.write(pin, rpio.LOW);
}*/



async function initTimelapse() {
    return new Promise(async (resolve) => {
        console.log("INIT TIMELAPSE");
        await driveToStart();
        resolve();
    })
}

function reposition(axis, dir) {
    shouldMove = true;
    var deviceNumber;

    switch (axis) {
        case 'x':
            deviceNumber = 0;
            break;
        case 'y':
            deviceNumber = 1;
            break;
        case 'z':
            deviceNumber = 2;
            break;
    }


    if (dir == 'right') {
        setDirRight();
    } else {
        setDirLeft();
    }

    board.accelStepperStep(deviceNumber, direction * 100000);

    board.digitalRead(buttonPin, async function (value) {
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
        board.accelStepperStep(0, direction * 100000)
        board.digitalRead(buttonPin, async function (value) {
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
        board.accelStepperStep(0, direction * 100000)
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
    initSocket,
    releaseSwitch,
    setDirRight,
    setDirLeft,
    getDir,
    getPos,
    changeDir,
    checkButton
}