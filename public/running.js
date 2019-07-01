socket.on('progress', function (data) {
    $("#progress").attr("value", data.done);
    $("#progress").attr("max", data.total);
    $("#done").text(data.done);
    $("#total").text(data.total);
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