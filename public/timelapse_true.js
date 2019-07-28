var pointsAdded = 0;
var pictureTaken = false;

renderButtons();

socket.emit('softResetPlaner');

socket.on('analysingDone', function (data) {
    pictureTaken = true;
    renderButtons();
    $('#progress').css("display", "none");
})

socket.on('pictureTaken', function (data) {
    if (!data.success) {
        console.log("Error taking picture happened.");
    }else{
        console.log("success");
        pictureTaken = true;
        renderButtons();
    }
    console.log("Ich bin hier");
    $('#progress').css("display", "none");
})

function takeReferencePicture() {
    socket.emit('takeReferencePicture');
    $('#progress').css("display", "block");
}

function takeTestPicture() {
    socket.emit('takePicture');
    $('#progress').css("display", "block");
}

function add(lastPoint) {
    socket.emit('add');
    pointsAdded++;
    renderButtons(lastPoint);
}

function go() {
    console.log('update stepppppp');
    socket.emit('updateStep', {
        step: 'running',
        oldStep: 'timelapse_true'
    });

    renderContent('running');
    socket.emit('timelapse', {
        interval: $('#slider_interval').slider("option", "value"),
        recordTime: $('#slider_rectime').slider("option", "value"),
        movieTime: $('#slider_movietime').slider("option", "value"),
        cameraControl: true,
        ramping: $("#ramping").is(':checked')
    });
}

var options = {
    zone: document.getElementById('joystick'),
    mode: 'static',
    position: {
        left: '50%',
        bottom: '7rem'
    },
    threshold: 0.2,
    color: '#e60e3d',
    lockX: true
}
var manager = nipplejs.create(options);

manager.on('end', function (evt, data) {
    socket.emit('stop reposition');
}).on('plain:left plain:right',
    function (evt, data) {
        socket.emit('stop reposition');
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

/*$('#app').on('mousedown touchstart', '.right', function (event) {
    console.log("reposition right");
    socket.emit('reposition', {
        axis: event.target.id,
        direction: 'right'
    });
}).on('mouseup mouseleave touchend', '.right', function () {
    console.log("stop reposition right");
    socket.emit('stop reposition');
});

$('#app').on('mousedown touchstart', '.left', function () {
    console.log("reposition left");
    socket.emit('reposition', {
        axis: event.target.id,
        direction: 'left'
    });
}).on('mouseup mouseleave touchend', '.left', function () {
    console.log("stop reposition left");
    socket.emit('stop reposition');
});*/


$("#slider_interval").slider({
    min: 5,
    max: 120,
    step: 1,
    value: 20,
    disabled: true,
    slide: function (event, ui) {
        locked = $("input[name=lock]:checked").val();

        if (locked == 'recordTime') {
            locked_value = $('#slider_rectime').slider("option", "value");
            newDynamicValue = (locked_value / ui.value) / 25;
            $("#slider_movietime").slider("value", newDynamicValue);
            $('#movietime_val').html('Movie Length: ' + humanReadable(newDynamicValue) + ' seconds');
        } else {
            locked_value = $('#slider_movietime').slider("option", "value");
            newDynamicValue = ui.value * locked_value * 25;
            $("#slider_rectime").slider("value", newDynamicValue);
            $('#rectime_val').html('Recording Time: ' + humanReadable(newDynamicValue) + ' seconds');
        }

        $('#interval_val').html('Interval: ' + ui.value + ' seconds');
    }
});

$("#slider_rectime").slider({
    min: 300,
    max: 43200,
    step: 0.01,
    value: 6000,
    diabled: false,
    slide: function (event, ui) {
        locked = $("input[name=lock]:checked").val();

        if (locked == 'interval') {
            locked_value = $('#slider_interval').slider("option", "value");
            newDynamicValue = (ui.value / locked_value) / 25;
            $("#slider_movietime").slider("value", newDynamicValue);
            $('#movietime_val').html('Movie Length: ' + humanReadable(newDynamicValue));
        } else {
            locked_value = $('#slider_movietime').slider("option", "value");
            newDynamicValue = ui.value / (locked_value * 25);
            $("#slider_interval").slider("value", newDynamicValue);
            $('#interval_val').html('Interval: ' + humanReadable(newDynamicValue));
        }

        $('#rectime_val').html('Recording Time: ' + humanReadable(ui.value));
    }
});

$("#slider_movietime").slider({
    min: 1,
    max: 180,
    step: 0.01,
    value: 12,
    diabled: false,
    slide: function (event, ui) {
        locked = $("input[name=lock]:checked").val();

        if (locked == 'interval') {
            locked_value = $('#slider_interval').slider("option", "value");
            newDynamicValue = (ui.value * 25) * locked_value;
            $("#slider_rectime").slider("value", newDynamicValue);
            $('#rectime_val').html('Record Time: ' + humanReadable(newDynamicValue));
        } else {
            locked_value = $('#slider_rectime').slider("option", "value");
            newDynamicValue = locked_value / (ui.value * 25);
            $("#slider_interval").slider("value", newDynamicValue);
            $('#interval_val').html('Interval: ' + humanReadable(newDynamicValue));
        }

        $('#movietime_val').html('Movie Length: ' + ui.value + ' seconds');
    }
});

$('input[type=radio][name=lock]').change(function () {
    if (this.value == 'interval') {
        $('#slider_interval').slider("disable");
        $('#slider_rectime').slider("enable");
        $('#slider_movietime').slider("enable");
    } else if (this.value == 'recordTime') {
        $('#slider_rectime').slider("disable");
        $('#slider_interval').slider("enable");
        $('#slider_movietime').slider("enable");
    } else if (this.value == 'movieTime') {
        $('#slider_movietime').slider("disable");
        $('#slider_interval').slider("enable");
        $('#slider_rectime').slider("enable");
    }
});

function renderButtons(lastPoint) {
    if (!pictureTaken) {
        $('#axisButtons').css("display", "none");
    } else {
        $('#axisButtons').css("display", "block");
    }
    if (pointsAdded == 0) {
        document.getElementById("addStartPoint").style.display = "block";
        document.getElementById("addEndPoint").style.display = "none";
        document.getElementById("add").style.display = "none";
        document.getElementById("go").style.display = "none";
    } else if (pointsAdded == 1) {
        document.getElementById("addStartPoint").style.display = "none";
        document.getElementById("addEndPoint").style.display = "block";
        document.getElementById("add").style.display = "block";
        document.getElementById("go").style.display = "none";
    } else if (pointsAdded >= 2 && lastPoint) {
        document.getElementById("addStartPoint").style.display = "none";
        document.getElementById("addEndPoint").style.display = "none";
        document.getElementById("add").style.display = "none";
        document.getElementById("go").style.display = "block";
    } else {
        document.getElementById("addStartPoint").style.display = "none";
        document.getElementById("addEndPoint").style.display = "block";
        document.getElementById("add").style.display = "block";
        document.getElementById("go").style.display = "none";
    }
}

$('#ramping').change(function () {
    if (this.checked) {
        //var returnVal = confirm("Are you sure?");
        //$(this).prop("checked", returnVal);
        $('#camSettings').css("display", "block");
        $('#takeTestPicture').css("display", "none");
    } else {
        $('#camSettings').css("display", "none");
        $('#takeTestPicture').css("display", "block");
    }
});

function humanReadable(time) {
    var humanTime = Math.round(time);
    var humanTimeExtension = 'seconds';
    if (time > 120) {
        humanTime = Math.round((humanTime / 60) * 100) / 100;
        humanTimeExtension = 'minutes';
    }
    return humanTime + ' ' + humanTimeExtension;
}