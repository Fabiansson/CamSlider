var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var rpio = require('rpio');
var motorDriver = require('./motorDriverr');
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
    socket.on('make step', function () {
        console.log("Make Step");
        motor.makeStep(40);
    });
    socket.on('turn_once', function () {
        console.log("Turn once");
        //motor.turnOnce(40);
        motor.turnOnce(40);
    });

    socket.on('start looping', function() {
        console.log("Start looping");
        motor.spin(40);
    });

    socket.on('stop looping', function() {
        console.log("Stop looping");
        motor.stop();
    });

    socket.on('initialize', function() {
        console.log("Initializing");
        planer.initialize();
    })

    
});