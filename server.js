var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var motorDriver = require('./motorDriver');
var planer = require('./planer');

var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 8000; //WARNING: app.listen(80) will NOT work here!

server.listen(port, host, function () {
    console.log("Server running on: " + host + " : " + port);
});

//Serving file
app.use(express.static('public'));

/*app.get('/', function (req, res) {
    res.sendFile('index.html');
});*/

//Connection
io.on('connection', function (socket) {
    var motor = motorDriver;

    socket.emit('connection_s_to_c', {
        hello: 'client'
    });
    socket.on('connection_c_to_s', function (data) {
        console.log(data);
    });
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
        planer.reposition(data.axis, data.direction, data.continuous);
    });

    socket.on('stop reposition', function () {
        console.log("stop reposition");
        planer.stop();
    });

    socket.on('add', function () {
        console.log("add position");
        planer.add();
    });

    socket.on('initialize', function (data) {
        console.log("Initializing");
        console.log(data)
        planer.initialize();
    })

    socket.on('go', function (data) {
        console.log("Starting Plan");
        console.log(data.interval + " " + data.recordTime + " " + data.movieTime)
        planer.go(data.interval, data.recordTime, data.movieTime)
    })


});