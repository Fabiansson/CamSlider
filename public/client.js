$(document).ready(function () {
    var socket = io.connect('http://localhost:8000');

    socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', {
            my: 'data'
        });
    });

    var button = document.getElementById('increaser');

    $("input.spin").on("click", function(){
       socket.emit('spin', {
           my: 'button clicked'
       }); 
    });

    /*var iv;
    $("input.increaser").on("mousedown touchstart", function () {

        iv = setInterval(function () {
        socket.emit('make step', {
            interval: 0.0001});
        }, 500);
    }).on("mouseup mouseleave touchend", function () {
        clearInterval(iv);
    });*/

    $('input.increaser').on('mousedown touchstart', function(){
        socket.emit('start looping');
    }).on('mouseup mouseleave touchend', function(){
        socket.emit('stop looping');
    })

    
});