var devMode = false;
if (process.env.NODE_ENV == 'development') var devMode = true;
let { logger } = require('./logger');
const Firmata = require("firmata");
var board;
if (!devMode) {
    board = new Firmata('/dev/ttyUSB0');

    var xMotor = {
        deviceNum: 0, // <number> Device number for the stepper (range 0-9)
        type: board.STEPPER.TYPE.DRIVER, // <number> (optional) Type of stepper or controller; default is FOUR_WIRE
        //stepSize: board.STEPPER.STEP_SIZE.HALF, // <number> (optional) Size of step; default is WHOLE
        stepPin: 3, // <number> (required if type === DRIVER) The step pin for a step+direction stepper driver
        directionPin: 2, // <number> (required if type === DRIVER) The direction pin for a step+direction stepper driver
    };

    var yMotor = {
        deviceNum: 1, // <number> Device number for the stepper (range 0-9)
        type: board.STEPPER.TYPE.DRIVER, // <number> (optional) Type of stepper or controller; default is FOUR_WIRE
        //stepSize: board.STEPPER.STEP_SIZE.HALF, // <number> (optional) Size of step; default is WHOLE
        stepPin: 6, // <number> (required if type === DRIVER) The step pin for a step+direction stepper driver
        directionPin: 5, // <number> (required if type === DRIVER) The direction pin for a step+direction stepper driver
    };

    var zMotor = {
        deviceNum: 2, // <number> Device number for the stepper (range 0-9)
        type: board.STEPPER.TYPE.DRIVER, // <number> (optional) Type of stepper or controller; default is FOUR_WIRE
        //stepSize: board.STEPPER.STEP_SIZE.HALF, // <number> (optional) Size of step; default is WHOLE
        stepPin: 9, // <number> (required if type === DRIVER) The step pin for a step+direction stepper driver
        directionPin: 8, // <number> (required if type === DRIVER) The direction pin for a step+direction stepper driver
    };
}

var direction = 1;
var shouldMove;
var initialized = false;
var atEnd = 1;

var socket;

function initSocket(socket) {
    socket = socket

    socket.on('getPosition', async function () {

        var x, y, z;
        x = await getPos(0);
        y = await getPos(1);
        z = await getPos(2);

        logger.info("Current position: " + x + " " + y + " " + z);
        await x;
        await y;
        await z;

        socket.emit('reportingPosition', {
            x: x,
            y: y,
            z: z
        })
    })

    socket.on('waterscale', function () {
        logger.info('Waterscaling now...');
        if (!devMode) board.accelStepperZero(0);
        if (!devMode) board.accelStepperZero(1);
        if (!devMode) board.accelStepperZero(2);
    })

    socket.on('init', async function () {
        global.mode = 'timelapse';
        if (!initialized) {
            await initTimelapse();
        }
        socket.emit('initDone');
    })

    socket.on('reposition', function (data) {
        logger.info("Repositioning motor: " + data.axis + " in direction: " + data.direction);
        reposition(data.axis, data.direction);
    });

    socket.on('stop reposition', function () {
        logger.info("Stop repositioning");
        stop();
    });


}

if (!devMode) board.on("ready", () => {
    logger.info("Arduino ready");
    board.accelStepperConfig(xMotor);
    board.accelStepperConfig(yMotor);
    board.accelStepperConfig(zMotor);
    board.accelStepperSpeed(0, 2000);
    board.accelStepperSpeed(1, 1000);
    board.accelStepperSpeed(2, 1000);
    board.pinMode(13, board.MODES.INPUT);
    board.pinMode(4, board.MODES.OUTPUT);
    board.pinMode(7, board.MODES.OUTPUT);
    board.pinMode(10, board.MODES.OUTPUT);
    board.digitalWrite(4, board.LOW);
    board.digitalWrite(7, board.LOW);
    board.digitalWrite(10, board.LOW);


    board.digitalRead(13, async function (value) {
        if (global.mode == 'timelapse' && value == board.LOW) {
            board.reportDigitalPin(13, 0)
            board.accelStepperAcceleration(0, 0);
            board.accelStepperSpeed(0, 2000);
            atEnd = 0;
            changeDir();
            await releaseSwitch();
            if (!initialized) {
                board.accelStepperZero(0);
                initialized = true;
                global.socket.emit('initDone');
            }
            //board.reportDigitalPin(10, 1);
            atEnd = 1;
        }
    });
});

async function initTimelapse() {
    return new Promise(async (resolve) => {
        logger.info("Preparing timelapse...");
        await driveToStart();
        resolve();
    })
}

function reposition(axis, dir) {
    if (!shouldMove) {
        if (!devMode) {
            board.accelStepperAcceleration(0, 1000);
            board.accelStepperSpeed(0, 6000);
            board.accelStepperAcceleration(1, 1000);
            board.accelStepperSpeed(1, 6000);
            board.accelStepperAcceleration(2, 1000);
            board.accelStepperSpeed(2, 6000);
        }

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
        logger.info("Moving to: " + dir + " Motor: " + deviceNumber + " ShouldMove: " + shouldMove + " NummerDirection: " + direction)

        if (atEnd != 0 && !devMode) board.accelStepperStep(deviceNumber, direction * 100000);
    }
}

function stop() {
    shouldMove = false;
    if (!devMode) {
        board.accelStepperAcceleration(0, 0);
        board.accelStepperSpeed(0, 2000);
        board.accelStepperAcceleration(1, 0);
        board.accelStepperSpeed(1, 2000);
        board.accelStepperAcceleration(2, 0);
        board.accelStepperSpeed(2, 2000);
        board.accelStepperStop(0);
        board.accelStepperStop(1);
        board.accelStepperStop(2);
        board.accelStepperStep(0, direction * 0);
        board.accelStepperStep(1, direction * 0);
        board.accelStepperStep(2, direction * 0);
    }
}

function getPos(device) {
    return new Promise(function (resolve) {
        if (!devMode) {
            board.accelStepperReportPosition(device, value => {
                resolve(value);
            });
        } else resolve(Math.floor(Math.random() * 1000));
    })

}

function driveToStart() {
    return new Promise(async (resolve) => {
        setDirLeft();
        if (!devMode) {
            board.accelStepperStep(0, direction * 100000);
            resolve();
        } else resolve();
    });
}

async function driveToPosition(position) {
    return new Promise(async (resolve) => {
        var positionLength = position.length;
        if (positionLength == 3) {
            var x_position = position[0];
            var y_position = position[1];
            var z_position = position[2];
        } else {
            var y_position = position[0];
            var z_position = position[1];
        }

        if (!devMode) {
            board.accelStepperAcceleration(0, 1000);
            board.accelStepperAcceleration(1, 1000);
            board.accelStepperAcceleration(2, 1000);
        }
        if (positionLength == 3) var xMove = stepTo(0, x_position);
        var yMove = stepTo(1, y_position)
        var zMove = stepTo(2, z_position)

        if (positionLength == 3) await xMove;
        await yMove;
        await zMove;
        resolve();
    });
}

function stepTo(motor, position) {
    return new Promise(function (resolve) {
        if (!devMode) {
            board.accelStepperTo(motor, position, function () {
                resolve();
            })
        } else resolve();
    });
}

function releaseSwitch() {
    return new Promise(function (resolve) {
        if (!devMode) {
            board.accelStepperStep(0, direction * 200, function () {
                board.reportDigitalPin(13, 1);
                logger.info("Releasing switch...");
                resolve();
            });
        } else resolve();
    });

}

function setDirRight() {
    direction = 1;
}

function setDirLeft() {
    direction = -1;
}

function getDir() {
    return direction;
}

///NOT TESTED
function changeDir() {
    direction = direction * -1;
}

module.exports = {
    initSocket,
    releaseSwitch,
    setDirRight,
    setDirLeft,
    getDir,
    getPos,
    changeDir,
    driveToStart,
    driveToPosition
}