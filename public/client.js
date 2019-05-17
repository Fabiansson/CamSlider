var socket;

let route = ['init', 'settings', 'go'];
let controlMode = {
    AUTONOMOUS: 0,
    CAMERA: 1
};

var currentStep = 'init';
var control = null;

function renderContent(step) {
    $('#app').load(step + '.html');
}

function initialize() {
    var mode = null;
    var control = null;

    if (socket != null) {
        mode = $("input[name=mode]:checked").val();
        control = $("input[name='control']:checked").val();

        socket.emit('initialize', {
            mode: mode,
            control: control
        });
    }
    step = '' + mode + '_' + control;

    renderContent(step);
}

$('#app').on('mousedown touchstart', '#right', function () {
    console.log("reposition right");
    socket.emit('reposition', {
        direction: 'right',
        continuous: True
    });
}).on('mouseup mouseleave touchend', function () {
    socket.emit('stop reposition');
});

$('#app').on('mousedown touchstart', '#left', function () {
    console.log("reposition left");
    socket.emit('reposition', {
        direction: 'left',
        continuous: True
    });
}).on('mouseup mouseleave touchend', function () {
    socket.emit('stop reposition');
});

$('#app').on('mousedown touchstart', '#right_step', function () {
    socket.emit('reposition', {
        direction: 'right',
        continuous: False
    });
});

$('#app').on('mousedown touchstart', '#left_step', function () {
    socket.emit('reposition', {
        direction: 'left',
        continuous: False
    });
});

$('#app').on('mousedown touchstart', '#add', function () {
    socket.emit('add');
});


$(document).ready(function () {
    socket = io.connect('http://192.168.2.201:8000');

    currentStep = 'init';

    socket.on('connection_s_to_c', function (data) {
        console.log(data);
        socket.emit('connection_c_to_s', {
            hello: 'server'
        });
    });

    renderContent(currentStep);


});