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

function add() {
    socket.emit('add');
}

$('#app').on('mousedown touchstart', '#right', function () {
    console.log("reposition right");
    socket.emit('reposition', {
        direction: 'right',
        continuous: 'true'
    });
}).on('mouseup mouseleave touchend', function () {
    socket.emit('stop reposition');
});

$('#app').on('mousedown touchstart', '#left', function () {
    console.log("reposition left");
    socket.emit('reposition', {
        direction: 'left',
        continuous: 'true'
    });
}).on('mouseup mouseleave touchend', function () {
    socket.emit('stop reposition');
});

$('#app').on('mousedown touchstart', '#right_step', function () {
    socket.emit('reposition', {
        direction: 'right',
        continuous: 'false'
    });
});

$('#app').on('mousedown touchstart', '#left_step', function () {
    socket.emit('reposition', {
        direction: 'left',
        continuous: 'false'
    });
});


$(document).ready(function () {
    socket = io.connect('http://localhost:8000');

    currentStep = 'init';

    socket.on('connection_s_to_c', function (data) {
        console.log(data);
        socket.emit('connection_c_to_s', {
            hello: 'server'
        });
    });

    renderContent(currentStep);


});