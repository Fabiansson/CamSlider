socket.on('progress', function (data) {
    $("#progress").attr("value", data.value);
    $("#progress").attr("max", data.max);
    $("#done").text(data.value);
    $("#total").text(data.max);
})

function abort() {
    socket.emit('abort');

    var step = null;

    socket.emit('goBack');

    socket.on('oldStep', function(data){
        step = data.oldStep;
        console.log("HAHAHAHAAHAH" + step);
        renderContent(step);
    })

    
}