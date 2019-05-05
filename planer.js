var rpio = require('rpio');
var motorDriver = require('./motorDriverr');
var length = 0;

function initialize(){
    rpio.open(38, rpio.INPUT, rpio.PULL_UP);
    if (rpio.read(38)){
        console.log("read input");
    }
    //motorDriver.spin
}

module.exports = {
    initialize
}