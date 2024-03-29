let devMode = (process.env.NODE_ENV == 'development');
const { spawn } = require('child_process');
var usb = require('usb');
var fs = require('fs');
var im = require('imagemagick');
var camData = require('./camData.json');
var { getTime, sleep } = require('./helpers');
const { logger } = require('./logger');

var folder_name = getTime(true);
var lastImage;

var reference = 30000; //dummy
var currentBrightness = "";
var sensibility = 1250;

var currentStep = 2;

var shutterSpeedOptions = [0.1, 0.4, 1, 4, 10]; //short to long dummy
var isoOptions = [100, 200, 400, 800, 1000]; //small to big dummy
var CONFIGS = [[0.1, 100], [0.4, 100], [1, 100], [4, 100], [10, 100], [10, 200], [10, 400], [10, 800], [10, 1000]]; //dummy

function initSocket(socket) {
    socket = socket;

    socket.on('requestCamera', function () {
        let has = hasCamera();
        logger.info('Camera connected: ' + has);
        socket.emit('hasCamera', {
            hasCamera: has
        })
    })

    socket.on('getCameraOptions', function () {
        var cameraCollection = [];

        camData.forEach((camera) => {
            cameraCollection.push(camera);
        })

        socket.emit('cameraOptions', {
            cameraCollection: cameraCollection
        })
    })

    socket.on('readCameraOptions', async function () {
        var cameraOptions = await readCameraOptions();
        socket.emit('doneReadingCameraOptions', {
            shutterSpeedOptions: cameraOptions[0],
            isoOptions: cameraOptions[1]
        })
    })

    socket.on('generateRampingConfig', function (data) {
        generateRampingConfig(data.camera, data.minIso, data.maxIso, data.minShutterSpeed, data.maxShutterSpeed);
    })

    socket.on('changeReference', function (data) {
        reference = Number(reference) + Number(data.value);
        logger.info('Changed brightness reference to: ' + reference);
    })

    socket.on('takeReferencePicture', async () => {
        logger.info("Take reference picture...");
        try {
            var iso = await getIso();
            var shutterSpeed = await getShutterSpeed();
            currentStep = searchConfig(shutterSpeed, iso);
            if (currentStep != null) {
                await takeReferencePicture();
                socket.emit('takingReferencePictureDone', {
                    success: true
                });
            } else {
                logger.error('Taking reference picture failed. Setting do not match ramping config.');
                socket.emit('takingReferencePictureDone', {
                    success: false
                });
            }
        } catch (er) {
            logger.error(er);
            socket.emit('takingReferencePictureDone', {
                success: false
            })
        }

    })

}

killProcess()
    //.then(resetCamera()
    .then(() => {
        logger.info('GPhoto ready!');
    }).catch(er => {
        logger.error(er);
    })/*)
    .catch(er => {
        console.log(er.message);
    });*/

usb.on('attach', async function (device) {
    if (!devMode) {
        await sleep(5000);
        if (hasCamera()) {
            await killProcess();
            await sleep(1000);
            //camera = device;
            const ls = spawn('gphoto2', ['--set-config'], ['capturetarget=1']);
            global.socket.emit('hasCamera', {
                hasCamera: true
            })
            logger.info('Found camera!');
        }
    }
});

usb.on('detach', function (device) {
    if (!hasCamera()) {
        global.socket.emit('hasCamera', {
            hasCamera: false
        })
        logger.info('Camera disconnected.');
    }
});

function killProcess() {
    return new Promise(async function (resolve, reject) {
        await sleep(5000);
        const ls = spawn('pgrep', ['gvfsd-gphoto2']);

        ls.stdout.on('data', (pid) => {
            process.kill(pid, 'SIGHUP');
            resolve();
        });
        ls.stderr.on('data', (data) => {
            logger.error(data);
            reject(new Error("Could not terminate GPhoto process."))
        });

        ls.on('close', () => {
            resolve();
        });
    })
}
//////////////DEPRICATED/////////////////
/*function resetCamera() {
    return new Promise(async (resolve, reject) => {
        try {
            if (!devMode) {
                //var id = await getUsbID();
                console.log('reseting camera');
                var device = await getUsbDevice();
                device.open();

                //reset('/dev/bus/usb/001/' + id, function (err, data) {
                device.reset(function (err) {
                    GPhoto.list(async function (list) {
                        if (list.length === 0) {
                            reject(new Error("No camera conected"));
                            return;
                        }
                        camera = list[0];
                        console.log('Found', camera.model);
                        spawn('gphoto2', ['--set-config'], ['capturetarget=1']);

                        resolve(true);
                    });
                })
            } else resolve(false);
        } catch (er) {
            console.log(er.message);
            reject(new Error("No camera conected"));
        }
    });
}*/
////////////////////////////////////

function takeReferencePicture() {
    return new Promise(async (resolve, reject) => {
        try {
            lastImage = await takePictureAndDownload();;
            var brightness = await analyseImage(lastImage);
            currentBrightness = brightness;
            reference = brightness;
            logger.info("Reference brightness is: " + reference);
            resolve();
        } catch (er) {
            reject(er);
            logger.error(er);
        }
    });
}

async function takePictureWithRamping(analyse) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.info("Setting shutterSpeed...");
            await setShutterSpeed(CONFIGS[currentStep][0]);
            logger.info("Setting iso...");
            await setIso(CONFIGS[currentStep][1]);

            logger.info("Taking picture and download...");
            lastImage = await takePictureAndDownload();
            resolve();
            if (analyse) {
                var brightness = await analyseImage(lastImage);
                currentBrightness = brightness;
                if (currentBrightness - reference > sensibility && currentStep - 1 > 0) {
                    currentStep--;
                    logger.info("Brightness step got decreased.");
                } else if (currentBrightness - reference < (sensibility * -1) && currentStep + 1 < CONFIGS.length) {
                    currentStep++;
                    logger.info("Brightness step got increased.");
                }
                logger.info('Analyzing done! Path: ' + lastImage + ' shutterSpeed: ' + CONFIGS[currentStep][0] + ' iso: ' + CONFIGS[currentStep][1] + ' brightness: ' + brightness + ' reference: ' + reference);
                fs.readFile(lastImage, function (err, data) {
                    global.socket.emit('image', {
                        image: true,
                        buffer: data,
                        shutterSpeed: CONFIGS[currentStep][0],
                        iso: CONFIGS[currentStep][1],
                        brightness: currentBrightness,
                        reference: reference
                    });
                    if (err) logger.error(err);
                });
            }
        } catch (er) {
            logger.error(er);
            reject(new Error("Taking picture with ramping failed."));
        }
    });
}

async function takePictureWithHdr() {
    return new Promise(async (resolve, reject) => {
        try {
            await takePictureAndDownload();
            //await resetCamera();
            var shutterSpeed = await getShutterSpeed();
            var iso = await getIso();
            var step = searchConfig(shutterSpeed, iso);
            if (step != null && (CONFIGS.length > step + 3) && (step - 3 > 0)) {
                await Promise.all([setShutterSpeed(CONFIGS[step + 3][0]), setIso(CONFIGS[step + 3][1])]);
                await takePictureAndDownload();
                await setShutterSpeed(CONFIGS[step - 3][0]);
                await setIso(CONFIGS[step - 3][1]);
                await takePictureAndDownload();
                await setShutterSpeed(CONFIGS[step][0]);
                await setIso(CONFIGS[step][1]);
                resolve();
            } else {
                var hdrError = new Error('No coresponding config was found or initial config inapropriate for further hdr image taking.');
                reject(hdrError);
            }
        } catch (er) {
            logger.error(er);
            reject(new Error('Taking picture with HDR failed'));
        }
    });
}

function takePictureAndDownload() {
    return new Promise(function (resolve, reject) {
        if (devMode) {
            resolve('./imagesTaken/image.jpg');
            return;
        }

        var captureTime = getTime(false);
        var path = '/home/pi/CamSlider/imagesTaken/' + folder_name + '/' + captureTime;
        const ls = spawn('gphoto2', ['--capture-image-and-download', '--filename=/home/pi/CamSlider/imagesTaken/' + folder_name + '/' + captureTime + '.%C']);

        ls.stdout.on('data', (data) => {
            let output = data.toString();
            if (output.includes('.JPG') && !path.includes('.JPG')) {
                path = path.concat('.JPG');
            }
            if (output.includes('.jpg') && !path.includes('.jpg')) {
                path = path.concat('.jpg');
            }
        })

        ls.stderr.on('data', (data) => {
            logger.error(data);
            reject(new Error("Taking Picture and downloading failed"));
        })

        ls.on('close', function (code) {
            resolve(path);
        });
    });
}

function getShutterSpeed() {
    return new Promise(function (resolve, reject) {
        if (devMode) {
            resolve(1);
            return;
        }

        const ls = spawn('gphoto2', ['--get-config=shutterspeed']);

        ls.stdout.on('data', (data) => {
            var shutterspeed = data.toString().split('\n')[3].split(' ')[1];
            resolve(shutterspeed);
        });

        ls.stderr.on('data', (data) => {
            logger.error(data);
            reject(new Error("Could not get shutterSpeed"))
        });
    });
}

function getIso() {
    return new Promise(function (resolve, reject) {
        if (devMode) {
            resolve(100);
            return;
        }

        const ls = spawn('gphoto2', ['--get-config=iso']);

        ls.stdout.on('data', (data) => {
            var iso = data.toString().split('\n')[3].split(' ')[1];
            resolve(parseInt(iso));
        });
        ls.stderr.on('data', (data) => {
            logger.error(data);
            reject(new Error("Could not get iso"))
        });
    });
}

function setIso(iso) {
    return new Promise(function (resolve, reject) {
        if (devMode) {
            resolve();
            return;
        }

        const ls = spawn('gphoto2', ['--set-config=iso=' + iso]);

        ls.stdout.on('data', (data) => {
            logger.info(data);
        });

        ls.stderr.on('data', (data) => {
            logger.error(data);
            reject(new Error("Could not set iso"));

        });

        ls.on('close', function (code) {
            resolve();
        });
    });
}

function setShutterSpeed(shutterSpeed) {
    return new Promise(function (resolve, reject) {
        if (devMode) {
            resolve();
            return;
        }

        const ls = spawn('gphoto2', ['--set-config=shutterspeed=' + shutterSpeed]);

        ls.stdout.on('data', (data) => {
            logger.info(data);
        });

        ls.stderr.on('data', (data) => {
            logger.error(data);
            reject(new Error("Could not set shutterSpeed"));
        });

        ls.on('close', function (code) {
            resolve();
        });
    });
}

function analyseImage(path) {
    return new Promise(function (resolve, reject) {
        if (devMode) {
            resolve(30000);
            return;
        }

        im.identify(['-format', '%[mean]', path], function (err, output) {
            if (err) {
                reject(new Error("Could not analyze image"));
                logger.error(err);

            }
            logger.info('Analyzed brightness is: ' + output);
            resolve(Number(output));
        });
    });
}

function searchConfig(shutterSpeed, iso) {
    logger.info('Searching CONFIG with shutterSpeed: ' + shutterSpeed + 'and iso: ' + iso);
    var step = null;
    for (var i = 0; i < CONFIGS.length; i++) {
        if (CONFIGS[i][0] == shutterSpeed && CONFIGS[i][1] == iso) {
            step = i
            logger.info("Current step in CONFIG is: " + step);
            break;
        }
    }
    return step;
}

function generateRampingConfig(camera, minIso, maxIso, minShutterSpeed, maxShutterSpeed) {
    if (camera != 'new') {
        logger.info("Generating RampingConfig for " + camera);
        logger.info('Cam not new and it is this one for generatin RampingConfig:%o ', camData[camera]);
        shutterSpeedOptions = camData[camera].shutterSpeedOptions;
        isoOptions = camData[camera].isoOptions;
    }
    logger.info('index of minISO: ' + isoOptions.indexOf(parseInt(minIso)));
    logger.info('index of maxISO: ' + isoOptions.indexOf(parseInt(maxIso)));
    logger.info('index of minShutterSpeed: ' + shutterSpeedOptions.indexOf(minShutterSpeed));
    logger.info('index of maxShutterSpeed: ' + shutterSpeedOptions.indexOf(maxShutterSpeed));

    var options = [];
    var newIsoOptions = isoOptions.slice(isoOptions.indexOf(parseInt(minIso)), isoOptions.indexOf(parseInt(maxIso)) + 1);
    var newShutterSpeedOptions = shutterSpeedOptions.slice(shutterSpeedOptions.indexOf(minShutterSpeed.toString()), shutterSpeedOptions.indexOf(maxShutterSpeed.toString()) + 1);

    for (var i = 0; i < (newShutterSpeedOptions.length + newIsoOptions.length - 1); i++) {
        var option;

        if (newShutterSpeedOptions[i] != undefined) {
            option = [newShutterSpeedOptions[i], newIsoOptions[0]];
        } else if (newIsoOptions[i + 1 - newShutterSpeedOptions.length] != undefined) {
            option = [newShutterSpeedOptions[newShutterSpeedOptions.length - 1], newIsoOptions[i + 1 - newShutterSpeedOptions.length]];
        }
        options.push(option);
    }
    CONFIGS = options;
    logger.info('Generated RampingConfig:%x', CONFIGS);
}

function readCameraOptions() {
    return new Promise(async function (resolve, reject) {
        try {
            shutterSpeedOptions = await getShutterSpeedOptions();
            isoOptions = await getIsoOptions();
            logger.info(shutterSpeedOptions);
            logger.info(isoOptions);
            resolve([shutterSpeedOptions, isoOptions]);
        } catch (er) {
            logger.error(er);
            reject(new Error("Could not get Camera Options"));
        }
    });
}

function getShutterSpeedOptions() {
    return new Promise(function (resolve, reject) {
        if (devMode) {
            resolve([0.01, 0.25, 1, 20]);
            return;
        }
        var shutterSpeedOptions = [];

        const ls = spawn('gphoto2', ['--get-config=shutterspeed']);

        ls.stdout.on('data', (data) => {
            var lines = data.toString().split('\n');
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('Choice:')) {
                    var shutterspeed = lines[i].split(' ')[2];
                    //if (shutterspeed == '5') break;
                    if (shutterspeed != 'Time' && shutterspeed != 'Bulb') shutterSpeedOptions.push(shutterspeed);
                }
            }
            if (shutterSpeedOptions[0] == 30) {
                var inverted = shutterSpeedOptions.reverse();
                shutterSpeedOptions = inverted;
            }
            resolve(shutterSpeedOptions);
        });

        ls.stderr.on('data', (data) => {
            logger.error(data);
            reject(new Error("Could not get shutterSpeedOptions"))
        });
    });
}

function getIsoOptions() {
    return new Promise(function (resolve, reject) {
        if (devMode) {
            resolve([100, 200, 500, 1000]);
            return;
        }
        var isoOptions = [];

        const ls = spawn('gphoto2', ['--get-config=iso']);

        ls.stdout.on('data', (data) => {
            var lines = data.toString().split('\n');
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('Choice:') && !lines[i].endsWith('Reduction')) {
                    var iso = lines[i].split(' ')[2];
                    if (iso != 'Time' && iso != 'Bulb' && iso != 'Auto' && iso >= 50) isoOptions.push(parseInt(iso)
                    );
                }
            }
            resolve(isoOptions);
        });

        ls.stderr.on('data', (data) => {
            logger.error(data);
            reject(new Error("Could not get isoOptions"))
        });
    });
}

function hasCamera() {
    var devices = usb.getDeviceList();

    for (var i = 0; i < devices.length; i++) {
        var idVendor = devices[i]['deviceDescriptor']['idVendor'];

        if (idVendor != 1060 && idVendor != 7531 && idVendor != 6790) {
            return true;
        }
    }
    return false;
}

module.exports = {
    takePictureAndDownload,
    takeReferencePicture,
    takePictureWithRamping,
    takePictureWithHdr,
    initSocket
}