var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var rpio = require('rpio');

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
    socket.emit('news', {
        hello: 'world'
    });
    socket.on('my other event', function (data) {
        console.log(data);
    });
    socket.on('make step', function (data) {
        console.log(data.interval);
        var pin = 40;

        rpio.open(pin, rpio.OUTPUT, rpio.LOW);

        /* On for 1 second */
        rpio.write(pin, rpio.HIGH);
        rpio.sleep(data.interval);

        /* Off for half a second (500ms) */
        rpio.write(pin, rpio.LOW);
    });
    socket.on('spin', function (data) {
        var pin = 40;

        rpio.open(40, rpio.OUTPUT, rpio.LOW);

        for(var i = 0; i < 200; i++){
            rpio.write(pin, (0,1,0))
            rpio.write(pin, rpio.HIGH);
            rpio.sleep(0.001);
            rpio.write(pin, rpio.LOW);
        }
    });

    var looping;
    socket.on('start looping', function() {
        console.log("Start looping");
        var pin = 40;
        
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);
        
        looping = setInterval(function(){
            for(var i = 1; i < 100; i++){
            rpio.write(pin, rpio.HIGH);
            rpio.sleep(0.001);
            rpio.write(pin, rpio.LOW);
        }
        },1);
        
    });

    socket.on('stop looping', function() {
        console.log("Stop looping");
        clearInterval(looping);
    });

    
});