const {
    spawn
} = require('child_process');
//var usb = require('usb')
var fs = require('fs');
var gphoto2 = require('gphoto2');
var im = require('imagemagick');
var GPhoto = new gphoto2.GPhoto2();
//var reset = require("reset-usb");

var camera = null;

var folder_name = getFolderName();
var imagesPath = "/root/CamSlider/imagesTaken/" + folder_name;
var lastImage;

var reference = "";
var currentBrightness = "";
var sensibility = 1250;

var currentStep = 21;

var socket;

function initSocket(socket){
    socket = socket;

    socket.on('requestCamera', function () {
        socket.emit('hasCamera', {
            hasCamera: camera != null
        })
    })

}

var CONFIGS = [
    ["1/8000", '100'],
    ["1/6400", '100'],
    ["1/5000", '100'],
    ["1/4000", '100'],
    ["1/3200", '100'],
    ["1/2500", '100'],
    ["1/2000", '100'],
    ["1/1600", '100'],
    ["1/1250", '100'],
    ["1/1000", '100'],
    ["1/800", '100'],
    ["1/640", '100'],
    ["1/500", '100'],
    ["1/400", '100'],
    ["1/320", '100'],
    ["1/250", '100'],
    ["1/200", '100'],
    ["1/160", '100'],
    ["1/125", '100'],
    ["1/100", '100'],
    ["1/80", '100'],
    ["1/60", '100'],
    ["1/50", '100'],
    ["1/40", '100'],
    ["1/30", '100'],
    ["1/25", '100'],
    ["1/20", '100'],
    ["1/15", '100'],
    ["1/13", '100'],
    ["1/10", '100'],
    ["1/8", '100'],
    ["1/6", '100'],
    ["1/5", '100'],
    ["1/4", '100'],
    ["1/3", '100'],
    ["4/10", '100'],
    ["5/10", '100'],
    ["6/10", '100'],
    ["8/10", '100'],
    ["10/10", '100'],
    ["13/10", '100'],
    ["16/10", '100'],
    ["20/10", '100'],
    ["25/10", '100'],
    ["32/10", '100'],
    ["40/10", '100'],
    ["40/10", '125'],
    ["40/10", '160'],
    ["40/10", '200'],
    ["40/10", '250'],
    ["40/10", '320'],
    ["40/10", '400'],
    ["40/10", '500'],
    ["40/10", '640'],
    ["40/10", '800'],
    ["40/10", '1000'],
    ["40/10", '1250'],
    ["40/10", '1600'],
    ["40/10", '2000'],
    ["40/10", '2500'],
    ["40/10", '3200'],
    ["40/10", '4000'],
    ["40/10", '5000'],
    ["40/10", '6400'],
    ["40/10", '8000'],
    ["40/10", '10000'],
    ["40/10", '12800'],
    ["40/10", '16000']
];


/*resetCamera()
    .then(success => {
        console.log('Camera conected: ' + success);
    }).catch(er => {
        console.log(er.message);
    });

usb.on('attach', function (device) {
    GPhoto.list(function (list) {
        if (list.length === 0) return;
        camera = list[0];
        console.log('Found', camera.model);
    });
});

usb.on('detach', function (device) {
    camera = null;
    console.log('Camera disconected');
});*/

function resetCamera() {
    return new Promise(async (resolve, reject) => {
        try {
            /*var id = await getUsbID();

            reset('/dev/bus/usb/001/' + id, function (err, data) {
                GPhoto.list(function (list) {
                    if (list.length === 0) {
                        reject(new Error("No camera conected"));
                        return;
                    }
                    camera = list[0];
                    console.log('Found', camera.model);
                    resolve(true);
                });
            })*/

        } catch (er) {
            console.log(er.message);
            reject(new Error("No camera conected"));
        }
    });
}


function takePicture() {
    // Take picture without downloading immediately
    return new Promise(function (resolve, reject) {
        camera.takePicture({
            download: false
        }, function (er, path) {
            if (er) {
                reject(er);
            } else resolve();
        });
    });
}

function takeReferencePicture() {
    return new Promise(async (resolve, reject) => {
        try {
            var path = await takePictureAndDownload(false)
            lastImage = path;
            var brightness = await analyseImage(lastImage);
            currentBrightness = brightness;
            reference = brightness;
            console.log("Reference IS: " + reference);
            await resetCamera();
            var iso = await getIso();
            var shutterSpeed = await getShutterSpeed();
            currentStep = searchConfig(shutterSpeed, iso);
            console.log("Iso: " + iso + " Shutterspeed: " + shutterSpeed + " current step: " + currentStep);
            global.socket.emit('analysingDone', {
                success: true
            });
            resolve();
        } catch (er) {
            global.socket.emit('analysingDone', {
                success: false
            });
            reject(er);
            console.log(er);
        }
    });
}

/*function takeReferencePicture() {
    takePictureAndDownload(false, function (path) {
        lastImage = path;
        analyseImage(lastImage, function (result) {
            currentBrightness = result;
            reference = result;
            console.log("Reference IS: " + reference);
            resetCamera(function (success) {
                if (success) {
                    getIso(function (iso) {
                        getShutterSpeed(function (shutterSpeed) {
                            for (var i = 0; i < CONFIGS.length; i++) {
                                if (CONFIGS[i][0] == shutterSpeed && CONFIGS[i][1] == iso) {
                                    currentStep = i;
                                    console.log("Current step is: " + currentStep);
                                    break;
                                } else {
                                    currentStep = 21; //magic number
                                }
                            }
                        });
                    });
                }
            });
        })
    })
}*/

async function takePictureWithRamping(analyse) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("await setshutterspeed");
            await setShutterSpeed(CONFIGS[currentStep][0]);
            console.log("await setiso");
            await setIso(CONFIGS[currentStep][1]);

            console.log("await takepictureanddownload");
            var path = await takePictureAndDownload(false);
            lastImage = path;
            resolve();
            if (analyse) {
                var brightness = await analyseImage(lastImage);
                currentBrightness = brightness;
                if (currentBrightness - reference > sensibility) {
                    currentStep--;
                    console.log("Brightness Step got decreased.");
                } else if (currentBrightness - reference < (sensibility * -1)) {
                    currentStep++;
                    console.log("Brightness Step got increased.");
                }
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
            await takePicture();
            await resetCamera();
            var shutterSpeed = await getShutterSpeed();
            var iso = await getIso();
            var step = searchConfig(shutterSpeed, iso);
            if (step != null && (CONFIGS.length > step + 3) && (step - 3 > 0)) {
                //await setShutterSpeed(CONFIGS[step + 3][0]);
                //await setIso(CONFIGS[step + 3][1]);
                await Promise.all([setShutterSpeed(CONFIGS[step + 3][0]), setIso(CONFIGS[step + 3][1])]);
                await takePicture();
                await setShutterSpeed(CONFIGS[step - 3][0]);
                await setIso(CONFIGS[step - 3][1]);
                await takePicture();
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

function takePictureAndDownload(keep) {
    return new Promise(function (resolve, reject) {
        shotTime = getTime();
        camera.takePicture({
            download: true,
            keep: keep
        }, function (er, data) {
            if (er) reject(er);
            if (!fs.existsSync(imagesPath)) {
                fs.mkdirSync(imagesPath);
            }
            var path = imagesPath + '/' + shotTime + '.JPG';
            fs.writeFileSync(path, data);
            resolve(path);
        });
    });
}

/*function getConfig(callback) {
    // get configuration tree
    //setIso(800);
    camera.getConfig('iso', function (er, settings) {
        if (er) throw er;

        console.log(settings);
        callback(settings);
    });
}*/

function getShutterSpeed() {
    /*camera.getConfig('iso', function (er, settings) {
        console.log(settings.main.capturesettings.shutterspeed2.value);
    });*/
    return new Promise(function (resolve, reject) {
        const ls = spawn('gphoto2', ['--get-config=shutterspeed2']);

        ls.stdout.on('data', (data) => {
            var shutterspeed = data.toString().split('\n')[2].split(' ')[1];
            resolve(shutterspeed);
        });

        ls.stderr.on('data', (data) => {
            reject(new Error("Could not get shutterSpeed"))
        });
    });
}

function getIso() {
    /*camera.getConfig('iso', function (er, settings) {
        console.log(settings.main.imgsettings.iso.value);
    });*/
    return new Promise(function (resolve, reject) {
        const ls = spawn('gphoto2', ['--get-config=iso']);

        ls.stdout.on('data', (data) => {
            var iso = data.toString().split('\n')[2].split(' ')[1];
            resolve(iso);
        });
        ls.stderr.on('data', (data) => {
            console.log(data);
            reject(new Error("Could not get iso"))
        });
    });
}

function setIso(iso) {
    return new Promise(function (resolve, reject) {
        camera.setConfigValue('iso', iso, function (er) {
            if (er) {
                reject(er);
            } else {
                resolve();
            }
        });
    });
}

function setShutterSpeed(shutterSpeed) {
    return new Promise(function (resolve, reject) {
        camera.setConfigValue('shutterspeed', shutterSpeed, function (er) {
            if (er) {
                reject(er);
            } else {
                resolve();
            }
        });
    });
}

function analyseImage(path) {
    return new Promise(function (resolve, reject) {
        im.identify(['-format', '%[mean]', path], function (err, output) {
            if (err) {
                reject(err);
                throw err;

            }
            console.log('Brightness: ' + output);
            resolve(output)
        });
    });
}

function searchConfig(shutterSpeed, iso) {
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

function getTime() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    var dateTime = date + '-' + time;
    return dateTime;
}

function getFolderName() {
    today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //As January is 0.
    var yyyy = today.getFullYear();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return (dd + '-' + mm + '-' + yyyy);
};

function getUsbID() {
    return new Promise(function (resolve, reject) {
        var devices = usb.getDeviceList();

        for (var i = 0; i < 15; i++) {
            if (devices[i] != undefined) {
                var id = fill(devices[i]['deviceAddress'].toString().replace(/\D/g, ''), 3);

                if (id > 4) {
                    resolve(id);
                    return;
                }
            }
        }
        reject(new Error("Could not get USB ID"));
    });
}

function hasCamera() {
    return (camera != null);
}

function fill(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


/* Take picture and download it to filesystem
camera.takePicture({
    targetPath: '/tmp/foo.XXXXXX'
}, function (er, tmpname) {
    fs.renameSync(tmpname, __dirname + '/picture.jpg');
});

// Download a picture from camera
camera.downloadPicture({
    cameraPath: '/store_00020001/DCIM/100CANON/IMG_1231.JPG',
    targetPath: '/tmp/foo.XXXXXX'
}, function (er, tmpname) {
    fs.renameSync(tmpname, __dirname + '/picture.jpg');
});*/

module.exports = {
    takePicture,
    takePictureAndDownload,
    takeReferencePicture,
    takePictureWithRamping,
    takePictureWithHdr,
    hasCamera,
    initSocket
}