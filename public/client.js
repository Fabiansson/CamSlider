var socket;

function renderContent(step) {
    console.log(step+'.html');
    $('#app').load(step + '.html', function () {});
}

function initialize() {
    var mode = null;
    var control = null;

    if (socket != null) {
        mode = $("input[name=mode]:checked").val();
        //control = $("input[name='control']:checked").val();
        control = $("#control").is(':checked');

        socket.emit('initialize', {
            mode: mode,
            control: control
        });
        var step = '' + mode + '_' + control;
        socket.emit('updateStep', {
            step: step,
            oldStep: 'init'
        });
    }

    renderContent(step);
}

function test() {
    renderContent('running');
    socket.emit('test', {
        hello: 'server'
    });
    socket.emit('updateStep', {
        step: 'running',
        oldStep: 'init'
    });
}

function takePicture(){
    socket.emit('takePicture');
}

function analyseReferencePicture(){
    socket.emit('analyseReferencePicture');
}


$(document).ready(function () {
    socket = io.connect('http://192.168.1.137:8000', {secure: true});

    socket.on('connection_s_to_c', function (data) {
        console.log(data);
        renderContent(data.step);
        socket.emit('connection_c_to_s', {
            hello: 'server'
        });
    });
});