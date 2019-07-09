var {
    PythonShell
} = require('python-shell')

var folder_name = function(){
    today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //As January is 0.
    var yyyy = today.getFullYear();
    
    if(dd<10) dd='0'+dd;
    if(mm<10) mm='0'+mm;
    return (dd+'-'+mm+'-'+yyyy);
    };
var imagesPath = "/root/CamSlider/imagesTaken/" + folder_name;
var referencePicturesPath = "/root/CamSlider/imagesTaken/referencePicture/" + folder_name;
var lastImage = "";

var reference = "";
var currentBrightness = "";
var sensibility = 1250;

//var currentConfig = selectFromConfigArray(shutterSpeed, iso);
var currentStep = 22;

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

function takePicture() {
    PythonShell.run('takePicture.py', null, function (err) {
        if (err) {
            socket.emit('pictureTaken', {
                success: false
            })
            console.log("FAILURE");
            throw err;
        } else {
            socket.emit('pictureTaken', {
                success: true
            })
            console.log("SUCCESS");
        }
        console.log('Taking picture done.');
    });
}

function takePictureWithRamping(analyse) {
    var pyshell = new PythonShell('takePictureAndDownload.py');

    var time = CONFIGS[currentStep][0];
    var iso = CONFIGS[currentStep][1];
    console.log("TIME: " + time + " ISO: " + iso);

    pyshell.send(JSON.stringify([imagesPath, time, iso, 4, 5]));

    pyshell.on('message', function (message) {
        console.log(message);
        lastImage = imagesPath + "/" + message

        if (analyse) {
            //oldBrightness = currentBrightness;
            analyseImage(lastImage, function (result) {
                currentBrightness = result;
                console.log("Brightness IS: " + currentBrightness);
                if (currentBrightness - reference > sensibility) {
                    currentStep--;
                    console.log("Brightness Step got decreased.");
                } else if (currentBrightness - reference < (sensibility * -1) ) {
                    currentStep++;
                    console.log("Brightness Step got increased.");
                }
            });
        }
    });

    pyshell.end(function (err) {
        if (err) {
            socket.emit('analysingDone', {
                value: "Something went wrong. Make sure your camera is turned on and conected to the Camera Port."
            })
            throw err;
        };

        console.log('Taking Picture and Downloading done.');
    });
}

function takeReferencePicture() {
    var pyshell = new PythonShell('referencePicture.py');

    pyshell.send(JSON.stringify([referencePicturesPath, 2, 3, 4, 5]));

    pyshell.on('message', function (message) {
        //referencePicturesPath = referencePicturesPath + "/" + message
        analyseImage(referencePicturesPath + "/" + message, function(result){
            reference = result;
            console.log("REFERENCE IS: " + reference);
        });

        //getConfig();
    });

    pyshell.end(function (err) {
        if (err) {
            socket.emit('analysingDone', {
                value: "Something went wrong. Make sure your camera is turned on and conected to the Camera Port."
            })
            throw err;
        };

        console.log('Taking Reference Picture done.');
    });
}


function analyseImage(path, callback) {
    var pyshell = new PythonShell('analyseImage.py');

    pyshell.send(JSON.stringify([path, 2, 3, 4, 5]));

    pyshell.on('message', function (message) {
        var brightness = parseInt(message.replace( /^\D+/g, ''));
        console.log(brightness);
        socket.emit('analysingDone', {
            value: brightness
        })
        callback(brightness);
    });

    pyshell.end(function (err) {
        if (err) {
            throw err;
        };

        console.log('Analysing Done.');
    });
}

/*function getConfig(){
    var pyshell = new PythonShell('getConfig.py');

    pyshell.on('message', function (message) {
        
        console.log(brightness);
        socket.emit('analysingDone', {
            value: brightness
        })
        callback(brightness);
    });

    pyshell.end(function (err) {
        if (err) {
            throw err;
        };

        console.log('Analysing Done.');
    });
}*/

module.exports = {
    takePicture,
    analyseImage,
    takeReferencePicture,
    takePictureWithRamping
}