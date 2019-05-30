var rpio = require('rpio');

function motorDriver() {

    var looping;

    this.spin = function(pin) {
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);
        console.log("start spin");
        
        looping = setInterval(function(){
            for(var i = 1; i < 100; i++){
            rpio.write(pin, rpio.HIGH);
            rpio.sleep(0.001);
            rpio.write(pin, rpio.LOW);
        }
        },1);
    }
  
    this.stop = function() {
        clearInterval(looping);
    }

    this.turnOnce = function(pin) {
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);

        for(var i = 0; i < 200; i++){
            rpio.write(pin, (0,1,0))
            rpio.write(pin, rpio.HIGH);
            rpio.sleep(0.001);
            rpio.write(pin, rpio.LOW);
        }
    }

    this.makeStep = function(pin) {
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);

        /* On for 1 second */
        rpio.write(pin, rpio.HIGH);
        rpio.sleep(data.interval);

        /* Off for half a second (500ms) */
        rpio.write(pin, rpio.LOW);
    }
  }
  
  module.exports = motorDriver;