var socket;

function renderContent(step) {
    console.log(step + '.html');
    $('#app').load(step + '.html', function () {});
}

function back() {
    socket.emit('goBack');
    socket.on('oldStep', function (data) {
        renderContent(data.oldStep);
    })
}

function initialize() {
    var mode = null;
    var control = null;

    if (socket != null) {
        mode = $("input[name=mode]:checked").val();
        //control = $("input[name='control']:checked").val();
        control = $("#control").is(':checked');

        $('#init').addClass("is-loading");

        socket.emit('initialize', {
            mode: mode,
            control: control
        });
        socket.on('initializeDone', function (data) {
            console.log("init done");
            $('#init').removeClass("is-loading");
            if (data.success) {
                console.log("Initialization successful.");
                var step = '' + mode + '_' + control;
                socket.emit('updateStep', {
                    step: step,
                    oldStep: 'init'
                });
                renderContent(step);
            } else {
                alert("No camera found. Or other problem with initialization.");
            }
        })
    }
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

function takeReferencePicture() {
    socket.emit('takeReferencePicture');
}

function takePictureWithRamping() {
    socket.emit('takePictureWithRamping');
}


$(document).ready(function () {
    socket = io.connect('http://localhost:8000', {
        secure: true
    });

    socket.on('connection_s_to_c', function (data) {
        console.log(data);
        renderContent(data.step);
        /*socket.emit('connection_c_to_s', {
            hello: 'server'
        });*/
    });
});

window.addEventListener('load', function () {
    window.history.pushState({}, '')
})

window.addEventListener('popstate', function () {
    window.history.pushState({}, '')
})