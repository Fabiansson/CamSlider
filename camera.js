var {
    PythonShell
} = require('python-shell')

var folder_name = "2019-07-01PiShots";
var imagesPath = "/root/CamSlider/imagesTaken/" + folder_name;
var referencePicturesPath = "/root/CamSlider/imagesTaken/referencePicture/" + folder_name;
var lastImage = "";

var reference = "";

function takePicture() {
    PythonShell.run('takePicture.py', null, function (err) {
        if (err) throw err;
        console.log('Taking picture done.');
    });

    var pyshell = new PythonShell('takePicture.py');

    pyshell.send(JSON.stringify([imagesPath, 2, 3, 4, 5]));

    pyshell.end(function (err) {
        if (err) {
            throw err;
        };
        console.log('Taking Picture done.');
    });
}

function takePictureWithRamping(analyse){
    
}

function takeReferencePicture(){
    var pyshell = new PythonShell('referencePicture.py');

    pyshell.send(JSON.stringify([referencePicturesPath, 2, 3, 4, 5]));

    pyshell.on('message', function (message) {
        referencePicturesPath = referencePicturesPath + "/" + message
        reference = analyseImage(referencePicturesPath);
    });

    pyshell.end(function (err) {
        if (err) {
            throw err;
        };

        console.log('Taking Reference Picture done.');
    });
}


function analyseImage(path) {
    var pyshell = new PythonShell('analyseImage.py');

    pyshell.send(JSON.stringify([path, 2, 3, 4, 5]));

    pyshell.on('message', function (message) {
        console.log(message);
        socket.emit('analysingDone', {
            value: message
        })
        return message;
    });

    pyshell.end(function (err) {
        if (err) {
            throw err;
        };

        console.log('Analysing Done.');
    });
}

module.exports = {
    takePicture,
    analyseImage,
    takeReferencePicture
}