var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var {
    PythonShell
} = require('python-shell')

var motorDriver = require('./motorDriver');
var planer = require('./planer');
var camera = require('./camera.js');

/*var https = require('https');
var http = require('http');*/

//var fs = require('fs');
//var http = require('http');
//var https = require('https');
//var privateKey  = fs.readFileSync('domain.key', 'utf8');
//var certificate = fs.readFileSync('domain.crt', 'utf8');

//var credentials = {key: privateKey, cert: certificate};
//var express = require('express');
//var app = express();

// your express configuration here

//var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);
//var io = require('socket.io')(server);


//httpServer.listen(8080);
//httpsServer.listen(8443);



// This line is from the Node.js HTTPS documentation.
/*var options = {
  key: fs.readFileSync('domain.key').toString(),
  cert: fs.readFileSync('domain.crt').toString()
};

var httpsServer = require('https').createServer(options, app);*/


var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 8000; //WARNING: app.listen(80) will NOT work here!

server.listen(port, host, function () {
    console.log("Server running on: " + host + " : " + port);
});

/*httpsServer.listen(443, host, function(){
    console.log("Server running on: " + host + " : " + '443');
})*/

//https.createServer(options, app).listen(443);

//Serving file
app.use(express.static('public'));

var oldStep = null;
var currentStep = 'init';


//Connection
io.on('connection', function (socket) {
    var motor = motorDriver;

    global.socket = socket;

    socket.emit('connection_s_to_c', {
        step: currentStep
    });
    socket.on('connection_c_to_s', function (data) {
        console.log(data);
    });
    socket.on('updateStep', function (data) {
        console.log('Current step: ' + data.step + ' Old Step: ' + data.oldStep);
        currentStep = data.step;
        oldStep = data.oldStep;
    });

    socket.on('goBack', function () {
        socket.emit('oldStep', {
            oldStep: oldStep
        })
        var temp = currentStep;
        currentStep = oldStep;
        oldStep = temp;
    })
    /*socket.on('make step', function () {
        console.log("Make Step");
        motor.makeStep(40);
    });
    socket.on('some steps', function (data) {
        console.log("Some steps in direction: " + data.direction);
        planer.someSteps(40, data.direction);
    });*/

    socket.on('reposition', function (data) {
        console.log("reposition on motor: " + data.axis + " in direction: " + data.direction + " continuous: " + data.continuous);
        planer.reposition(data.axis, data.direction);
    });

    socket.on('stop reposition', function () {
        console.log("stop reposition");
        planer.stop();
    });

    socket.on('add', function () {
        console.log("add position");
        planer.add();
    });

    socket.on('softResetPlaner', function () {
        planer.softReset();
    })

    socket.on('initialize', function (data) {
        console.log("Initializing");
        planer.initialize(data.mode, data.control).then(() => console.log("INIT DONE!"));
    })

    socket.on('timelapse', function (data) {
        console.log("Starting Plan");
        console.log(data.interval + " " + data.recordTime + " " + data.movieTime)
        planer.timelapse(data.interval, data.recordTime, data.movieTime)
    })

    socket.on('test', function () {
        console.log("TEST RUN!");
        planer.test();
    })

    /*socket.on('takePicture', function () {
        PythonShell.run('gphoto_test.py', null, function (err) {
            if (err) throw err;
            console.log('finished');
        });
    })*/
    socket.on('takeReferencePicture', function () {
        camera.takeReferencePicture();
    })

    socket.on('analyseReferencePicture', function(){
        camera.analyseImage();
    })
});