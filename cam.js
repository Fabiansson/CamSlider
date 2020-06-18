let devMode = (process.env.NODE_ENV == 'development');
const { spawn } = require('child_process');
var usb = require('usb');
var fs = require('fs');
var im = require('imagemagick');
var camData = require('./camData.json');
var { getTime, sleep } = require('./helpers');

var camera = null;

var folder_name = getTime(true);
var lastImage;

var reference = 30000; //dummy
var currentBrightness = "";
var sensibility = 1250;

var currentStep = 2;

var shutterSpeedOptions = [0.1, 0.4, 1, 4, 10]; //short to long dummy
var isoOptions = [100, 200, 400, 800, 1000]; //small to big dummy
var CONFIGS = [[0.1, 100], [0.4, 100], [1, 100], [4, 100], [10, 100], [10, 200], [10, 400], [10, 800], [10, 1000]]; //dummy

var socket;

function initSocket(socket) {
    socket = socket;

    socket.on('requestCamera', function () {
        socket.emit('hasCamera', {
            hasCamera: camera != null
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
        console.log('Changed reference to: ' + reference);
    })

    socket.on('takeReferencePicture', async () => {
        console.log("Take Reference Picture");
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
                console.log('Taking ref picture failed. Setting do not match ramping config.');
                socket.emit('takingReferencePictureDone', {
                    success: false
                });
            }
        } catch (er) {
            console.log(er);
            socket.emit('takingReferencePictureDone', {
                success: false
            })
        }

    })

}

////////////DEPRICATED/////////////////
/*killProcess()
    .then(resetCamera()
        .then(success => {
            console.log('Camera conected: ' + success);
        }).catch(er => {
            console.log(er.message);
        }))
    .catch(er => {
        console.log(er.message);
    });*/
//////////////////////////////

usb.on('attach', async function (device) {
    await sleep(5000);
    if (!devMode) {
        if (isCamera(device)) {
            ///////DEPRICATED///////
            //await killProcess();
            //await sleep(1000);
            ///////////////////////
            camera = device;
            const ls = spawn('gphoto2', ['--set-config'], ['capturetarget=1']);
            global.socket.emit('hasCamera', {
                hasCamera: camera != null
            })
            console.log('Found camera');
        }
    }
});

usb.on('detach', function (device) {
    if (isCamera(device)) {
        camera = null;
        global.socket.emit('hasCamera', {
            hasCamera: camera != null
        })
        console.log('Camera disconected');
    }
});

/////////////////////DEPRICATED///////////////////////
/*function killProcess() {
    return new Promise(async function (resolve, reject) {
        await sleep(5000);
        const ls = spawn('pgrep', ['gvfsd-gphoto2']);

        ls.stdout.on('data', (pid) => {
            process.kill(pid, 'SIGHUP');
            resolve();
        });
        ls.stderr.on('data', (data) => {
            console.log(data);
            reject(new Error("Could not terminate GPhoto process."))
        });

        ls.on('close', () => {
            resolve();
        });
    })
}*/
//////////////////////////////////////////////////
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

//////////////DEPRICATED///////////////////
/*function takePicture() {
    // Take picture without downloading immediately
    return new Promise(function (resolve, reject) {
        if (!devMode) {
            camera.takePicture({
                download: false
            }, function (er, path) {
                if (er) {
                    reject(er);
                } else resolve();
            });
        } else resolve();
    });
}*/
////////////////////////////////////////

function takeReferencePicture() {
    return new Promise(async (resolve, reject) => {
        try {
            lastImage = await takePictureAndDownload(folder_name);;
            var brightness = await analyseImage(lastImage);
            currentBrightness = brightness;
            reference = brightness;
            console.log("Reference is: " + reference);
            resolve();
        } catch (er) {
            reject(er);
            console.log(er);
        }
    });
}

async function takePictureWithRamping(analyse) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("await setshutterspeed");
            await setShutterSpeed(CONFIGS[currentStep][0]);
            console.log("await setiso");
            await setIso(CONFIGS[currentStep][1]);

            console.log("await takepictureanddownload");
            lastImage = await takePictureAndDownload(folder_name);
            resolve();
            if (analyse) {
                var brightness = await analyseImage(lastImage);
                currentBrightness = brightness;
                if (currentBrightness - reference > sensibility && currentStep - 1 > 0) {
                    currentStep--;
                    console.log("Brightness Step got decreased.");
                } else if (currentBrightness - reference < (sensibility * -1) && currentStep + 1 < CONFIGS.length) {
                    currentStep++;
                    console.log("Brightness Step got increased.");
                }
                console.log('path: ' + lastImage + ' shutterSpeed: ' + CONFIGS[currentStep][0] + ' iso: ' + CONFIGS[currentStep][1] + ' brightness: ' + brightness + ' reference: ' + reference);
                fs.readFile(lastImage, function (err, data) {
                    global.socket.emit('image', {
                        image: true,
                        buffer: data,
                        shutterSpeed: CONFIGS[currentStep][0],
                        iso: CONFIGS[currentStep][1],
                        brightness: currentBrightness,
                        reference: reference
                    });
                    if (err) console.log(err);
                });
            }
        } catch (er) {
            console.log(er);
            reject(new Error("Taking picture with ramping failed."));
        }
    });
}

async function takePictureWithHdr() {
    return new Promise(async (resolve, reject) => {
        try {
            await takePictureAndDownload(folder_name);
            //await resetCamera();
            var shutterSpeed = await getShutterSpeed();
            var iso = await getIso();
            var step = searchConfig(shutterSpeed, iso);
            if (step != null && (CONFIGS.length > step + 3) && (step - 3 > 0)) {
                await Promise.all([setShutterSpeed(CONFIGS[step + 3][0]), setIso(CONFIGS[step + 3][1])]);
                await takePictureAndDownload(folder_name);
                await setShutterSpeed(CONFIGS[step - 3][0]);
                await setIso(CONFIGS[step - 3][1]);
                await takePictureAndDownload(folder_name);
                await setShutterSpeed(CONFIGS[step][0]);
                await setIso(CONFIGS[step][1]);
                resolve();
            } else {
                var hdrError = new Error('No coresponding config was found or initial config inapropriate for further hdr image taking.');
                reject(hdrError);
            }
        } catch (er) {
            console.log(er);
            reject(new Error('Taking picture with HDR failed'));
        }
    });
}

function takePictureAndDownload() {
    return new Promise(function (resolve, reject) {
        if (!devMode) {
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
                console.log(data);
                reject(new Error("Taking Picture and downloading failed"));
            })

            ls.on('close', function (code) {
                resolve(path);
            });
        } else resolve('./imagesTaken/image.png');
    });
}

function getShutterSpeed() {
    return new Promise(function (resolve, reject) {
        if (!devMode) {
            const ls = spawn('gphoto2', ['--get-config=shutterspeed']);

            ls.stdout.on('data', (data) => {
                var shutterspeed = data.toString().split('\n')[3].split(' ')[1];
                resolve(shutterspeed);
            });

            ls.stderr.on('data', (data) => {
                console.log(data);
                reject(new Error("Could not get shutterSpeed"))
            });
        }
        if (devMode) resolve(1);
    });
}

function getIso() {
    return new Promise(function (resolve, reject) {
        if (!devMode) {
            const ls = spawn('gphoto2', ['--get-config=iso']);

            ls.stdout.on('data', (data) => {
                var iso = data.toString().split('\n')[3].split(' ')[1];
                resolve(parseInt(iso));
            });
            ls.stderr.on('data', (data) => {
                console.log(data);
                reject(new Error("Could not get iso"))
            });
        }
        if (devMode) resolve(100);
    });
}

function setIso(iso) {
    return new Promise(function (resolve, reject) {
        if (!devMode) {
            const ls = spawn('gphoto2', ['--set-config=iso=' + iso]);

            ls.stdout.on('data', (data) => {
                console.log(data);
            });

            ls.stderr.on('data', (data) => {
                console.log(data);
                reject(new Error("Could not set iso"));

            });

            ls.on('close', function (code) {
                resolve();
            });
        } else resolve();
    });
}

function setShutterSpeed(shutterSpeed) {
    return new Promise(function (resolve, reject) {
        if (!devMode) {
            const ls = spawn('gphoto2', ['--set-config=shutterspeed=' + shutterSpeed]);

            ls.stdout.on('data', (data) => {
                console.log(data);
            });
    
            ls.stderr.on('data', (data) => {
                console.log(data);
                reject(new Error("Could not set shutterSpeed"));
            });
    
            ls.on('close', function(code) {
                resolve();
            });
        } else resolve();
    });
}

function analyseImage(path) {
    return new Promise(function (resolve, reject) {
        if (!devMode) {
            im.identify(['-format', '%[mean]', path], function (err, output) {
                if (err) {
                    reject(new Error("Could not analyze image"));
                    console.error(err);

                }
                console.log('Brightness: ' + output);
                resolve(Number(output));
            });
        } else resolve(30000);
    });
}

function searchConfig(shutterSpeed, iso) {
    console.log('WE ARE SEARCHING CONFIG WITH SHUTTERSPEED: ' + shutterSpeed + 'AND' + iso);
    var step = null;
    for (var i = 0; i < CONFIGS.length; i++) {
        if (CONFIGS[i][0] == shutterSpeed && CONFIGS[i][1] == iso) {
            step = i
            console.log("Current step is: " + step);
            break;
        }
    }
    return step;
}

function generateRampingConfig(camera, minIso, maxIso, minShutterSpeed, maxShutterSpeed) {
    if (camera != 'new') {
        console.log(camera);
        console.log('cam not new and  it think it is this one for generatin RampingConfig: ' + camData[camera]);
        shutterSpeedOptions = camData[camera].shutterSpeedOptions;
        isoOptions = camData[camera].isoOptions;
    }
    console.log('index of camera: ' + camera);
    console.log('camera: ' + camData[camera]);
    console.log('shutterSpeedOptions: ' + shutterSpeedOptions);
    console.log('isoOptions: ' + isoOptions);
    console.log('index of mI: ' + isoOptions.indexOf(parseInt(minIso)));
    console.log('index of maxI: ' + isoOptions.indexOf(parseInt(maxIso)));
    console.log('index of mS: ' + shutterSpeedOptions.indexOf(minShutterSpeed));
    console.log('index of maxS: ' + shutterSpeedOptions.indexOf(maxShutterSpeed));
    console.log('minshutterSpeed: ' + minShutterSpeed);
    console.log('minshutterSpeedString: ' + minShutterSpeed.toString());
    console.log('maxshutterSpeed: ' + maxShutterSpeed);

    var options = [];
    var newIsoOptions = isoOptions.slice(isoOptions.indexOf(parseInt(minIso)), isoOptions.indexOf(parseInt(maxIso)) + 1);
    var newShutterSpeedOptions = shutterSpeedOptions.slice(shutterSpeedOptions.indexOf(minShutterSpeed.toString()), shutterSpeedOptions.indexOf(maxShutterSpeed.toString()) + 1);
    console.log(newIsoOptions);
    console.log(newShutterSpeedOptions);

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
    console.log('Camera Options: ' + CONFIGS);
}

function readCameraOptions() {
    return new Promise(async function (resolve, reject) {
        try {
            shutterSpeedOptions = await getShutterSpeedOptions();
            isoOptions = await getIsoOptions();
            console.log(shutterSpeedOptions);
            console.log(isoOptions);
            resolve([shutterSpeedOptions, isoOptions]);
        } catch (er) {
            console.log(er);
            reject(new Error("Could not get Camera Options"));
        }
    });
}

function getShutterSpeedOptions() {
    return new Promise(function (resolve, reject) {
        var shutterSpeedOptions = [];

        if (!devMode) {
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
                console.error(data);
                reject(new Error("Could not get shutterSpeedOptions"))
            });
        }
        if (devMode) resolve([0.01, 0.25, 1, 20]);
    });
}

function getIsoOptions() {
    return new Promise(function (resolve, reject) {
        var isoOptions = [];

        if (!devMode) {
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
                console.error(data);
                reject(new Error("Could not get isoOptions"))
            });
        }
        if (devMode) resolve([100, 200, 500, 1000]);
    });
}



////////DEPRICATED//////////////
function getFolderName() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //As January is 0.
    var yyyy = today.getFullYear();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return (yyyy + '-' + mm + '-' + dd);
};
//////////////////////////////

function getUsbDevice() {
    return new Promise(function (resolve, reject) {
        var devices = usb.getDeviceList();

        for (var i = 0; i < devices.length; i++) {
            var idVendor = devices[i]['deviceDescriptor']['idVendor'];
            var idProduct = devices[i]['deviceDescriptor']['idProduct'];

            if (idVendor != 1060 && idVendor != 7531 && idVendor != 6790) {
                var device = usb.findByIds(idVendor, idProduct);
                if (device != undefined) {
                    resolve(device);
                }
                return;
            }
        }
        reject(new Error("Could not get USB ID"));
    });
}

function isCamera(device) {
    var idVendor = device.idVendor;
    return (idVendor != 1060 && idVendor != 7531 && idVendor != 6790);
}

function hasCamera() {
    return (camera != null);
}

module.exports = {
    takePictureAndDownload,
    takeReferencePicture,
    takePictureWithRamping,
    takePictureWithHdr,
    hasCamera,
    initSocket
}