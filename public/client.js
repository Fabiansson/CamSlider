var socket;

let route = ['init', 'settings', 'go'];
let controlMode = {
    AUTONOMOUS: 0,
    CAMERA: 1
};

var currentStep = 'init';
var control = null;

function renderContent(step) {
    $('#app').load(step + '.html', function () {
        didLoad(step)
    });
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

function go() {
    /*socket.emit('go', {
        interval: $("#interval").val(),
        recordTime: $("#recordTime").val(),
        movieTime: $("#movieTime").val()
    })*/
    socket.emit('go', {
        interval: $('#slider_interval').slider("option", "value"),
        recordTime: $('#slider_rectime').slider("option", "value"),
        movieTime: $('#slider_movietime').slider("option", "value")
    })
    $('#slider_rectime').slider("option", "value");
}

$('#app').on('mousedown touchstart', '.right', function (event) {
    console.log("reposition right");
    socket.emit('reposition', {
        axis: event.target.id,
        direction: 'right',
        continuous: 'true'
    });
}).on('mouseup mouseleave touchend', '.right', function () {
    console.log("stop reposition right");
    socket.emit('stop reposition');
});

$('#app').on('mousedown touchstart', '.left', function () {
    console.log("reposition left");
    socket.emit('reposition', {
        axis: event.target.id,
        direction: 'left',
        continuous: 'true'
    });
}).on('mouseup mouseleave touchend', '.left', function () {
    console.log("stop reposition left");
    socket.emit('stop reposition');
});

$('#app').on('mousedown touchstart', '.right_step', function () {
    socket.emit('reposition', {
        axis: event.target.id,
        direction: 'right',
        continuous: 'false'
    });
});

$('#app').on('mousedown touchstart', '.left_step', function () {
    socket.emit('reposition', {
        axis: event.target.id,
        direction: 'left',
        continuous: 'false'
    });
});

function didLoad(step) {
    if (step == 'timelapse_camera') {
        $("#slider_interval").slider({
            min: 5,
            max: 120,
            value: 20,
            disabled: true,
            slide: function (event, ui) {
                locked = $("input[name=lock]:checked").val();

                if(locked == 'recordTime'){
                    locked_value = $('#slider_rectime').slider("option", "value");
                    newDynamicValue = (locked_value / ui.value) / 25; 
                    $("#slider_movietime").slider("value", newDynamicValue);    
                    $('#movietime_val').html('Movie Length: ' + newDynamicValue + ' seconds');
                }
                else{
                    locked_value = $('#slider_movietime').slider("option", "value");
                    newDynamicValue = ui.value * locked_value * 25;
                    $("#slider_rectime").slider("value", newDynamicValue);
                    $('#rectime_val').html('Recording Time: ' + newDynamicValue + ' seconds');
                }

                $('#interval_val').html('Interval: ' + ui.value + ' seconds');
            }
        });

        $("#slider_rectime").slider({
            min: 300,
            max: 43200,
            diabled: false,
            slide: function (event, ui) {
                locked = $("input[name=lock]:checked").val();

                if(locked == 'interval'){
                    locked_value = $('#slider_interval').slider("option", "value");
                    newDynamicValue = (ui.value / locked_value) / 25; 
                    $("#slider_movietime").slider("value", newDynamicValue);    
                    $('#movietime_val').html('Movie Length: ' + newDynamicValue + ' seconds');
                }
                else{
                    locked_value = $('#slider_movietime').slider("option", "value");
                    newDynamicValue = ui.value / (locked_value * 25);
                    $("#slider_interval").slider("value", newDynamicValue);
                    $('#interval_val').html('Interval: ' + newDynamicValue + ' seconds');
                }

                $('#rectime_val').html('Recording Time: ' + ui.value + ' seconds');
            }
        });

        $("#slider_movietime").slider({
            min: 3,
            max: 180,
            diabled: false,
            slide: function (event, ui) {
                locked = $("input[name=lock]:checked").val();

                if(locked == 'interval'){
                    locked_value = $('#slider_interval').slider("option", "value");
                    newDynamicValue = (ui.value * 25) * locked_value; 
                    $("#slider_rectime").slider("value", newDynamicValue);    
                    $('#rectime_val').html('Record Time: ' + newDynamicValue + ' seconds');
                }
                else{
                    locked_value = $('#slider_rectime').slider("option", "value");
                    newDynamicValue = locked_value / (ui.value * 25);
                    $("#slider_interval").slider("value", newDynamicValue);
                    $('#interval_val').html('Interval: ' + newDynamicValue + ' seconds');
                }

                $('#movietime_val').html('Movie Length: ' + ui.value + ' seconds');
            }
        });

        $('input[type=radio][name=lock]').change(function() {
            if (this.value == 'interval') {
                $('#slider_interval').slider("disable");
                $('#slider_rectime').slider("enable");
                $('#slider_movietime').slider("enable");
            }
            else if (this.value == 'recordTime') {
                $('#slider_rectime').slider("disable");
                $('#slider_interval').slider("enable");
                $('#slider_movietime').slider("enable");
            }
            else if (this.value == 'movieTime') {
                $('#slider_movietime').slider("disable");
                $('#slider_interval').slider("enable");
                $('#slider_rectime').slider("enable");
            }
        });
    }
};


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