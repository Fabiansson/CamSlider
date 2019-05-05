var rpio = require('rpio');

var looping;

   function spin (pin) {
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
  
    function stop () {
        clearInterval(looping);
    }

    function turnOnce (pin) {
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);

        for(var i = 0; i < 200; i++){
            rpio.write(pin, (0,1,0))
            rpio.write(pin, rpio.HIGH);
            rpio.sleep(0.001);
            rpio.write(pin, rpio.LOW);
        }
    }

    function makeStep (pin) {
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);

        /* On for 1 second */
        rpio.write(pin, rpio.HIGH);
        rpio.sleep(data.interval);

        /* Off for half a second (500ms) */
        rpio.write(pin, rpio.LOW);
    }

module.exports = {
    spin,
    stop,
    turnOnce,
    makeStep
}