var config = [];

var options = {
    zone: document.getElementById('joystick'),
    mode: 'static',
    position: {
        left: '50%',
        bottom: '7rem'
    },
    threshold: 0.2,
    color: 'blue',
    lockX: true
}
var manager = nipplejs.create(options);

manager.on('end', function (evt, data) {
    socket.emit('stop reposition');
}).on('plain:left plain:right',
    function (evt, data) {
        if (evt.type == 'plain:right') {
            socket.emit('reposition', {
                axis: $("input[name=axis]:checked").val(),
                direction: 'right'
            });
        } else if (evt.type == 'plain:left') {
            socket.emit('reposition', {
                axis: $("input[name=axis]:checked").val(),
                direction: 'left'
            });
        }
    }
);

$("#slider_interval").slider({
    min: 5,
    max: 30,
    step: 1,
    value: 20,
    disabled: false,
    slide: function (event, ui) {
        $('#interval_val').html('Interval: ' + ui.value + ' seconds');
    }
});

function go() {
    socket.emit('updateStep', {
        step: 'running',
        oldStep: 'panorama_false'
    });

    renderContent('running');
    socket.emit('panorama', {
        config: config,
        interval: 0,
        cameraControl: true,
        hdr: $("#hdr").is(':checked')
    });
}

function waterscale() {
    $('.controlls').css("display", "none");
    $('#waterscale').css("display", "none");
    $('.settings').css("display", "block");

    socket.emit('waterscale');
}

function add() {
    var row = [$('#pictures option:selected').text(), $('#angle option:selected').text()]
    config.push(row);
    updateOverview();
}

function addRmZN(c, isZenit) {
    var angle = 90;

    if(!isZenit) angle = -90;
    
    if (c.checked) config.push([1, angle]);
    else {
        for (var i = 0; i < config.length; i++) {
            if (config[i].equals([1, angle])) {
                config.splice(i, 1);
                i--;
            }
        }
    }
    updateOverview();
}

function updateOverview(){
    $(".overview").empty();
    config = config.sort(function(a, b) {
        return b[1] - a[1];
    });
    for(var i = 0; i < config.length; i++){
        $(".overview" ).append( "<p>Amount of Images: " + config[i][0] + " at: " + config[i][1] + "&deg;</p>");
    }
    
}

if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});