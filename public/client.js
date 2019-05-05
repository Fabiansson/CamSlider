const route1 = ['mode', 'init', 'autonomous', 'parameters', 'anchors', 'overview'];

var currentRoute = null;
var currentStep = null;

function renderContent(step) {
    $('#app').load(step + '.html');
}

function setMode(mode) {
    //setup.setMode(mode);

    switch (mode) {
        case 'timelapse':
            currentRoute = route1;
            break;
        case 'pano':
            currentRoute = route2;
            break;
        case 'movie':
            currentRoute = route3;
            break;
        default:
            break;
    }
    next();
}

function next() {
    var nextStep = currentRoute.indexOf(currentStep) + 1

    if(currentRoute[nextStep] === 'undefined'){
        //TODO - SOCKET START WORK
    }else{
        renderContent(currentRoute[nextStep]);
    }
}

$(document).ready(function () {
    var socket = io.connect('http://localhost:8000');

    currentStep = 'mode';

    socket.on('connection_s_to_c', function (data) {
        console.log(data);
        socket.emit('connection_c_to_s', {
            hello: 'server'
        });
    });

    $("input.spin").on("click", function () {
        socket.emit('turn_once');
    });

    $('input.increaser').on('mousedown touchstart', function () {
        socket.emit('start looping');
    }).on('mouseup mouseleave touchend', function () {
        socket.emit('stop looping');
    })

    $("input.initialize").on("click", function () {
        socket.emit('initialize');
    });

    renderContent(currentStep);


});