function getTime(dateOnly) {
    var today = new Date();
    var SS = today.getSeconds();
    var MM = today.getMinutes();
    var HH = today.getHours();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //As January is 0.
    var yyyy = today.getFullYear();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    if (HH < 10) HH = '0' + HH;
    if (MM < 10) MM = '0' + MM;
    if (SS < 10) SS = '0' + SS;
    if(dateOnly) return (yyyy + '-' + mm + '-' + dd);
    return (yyyy + '-' + mm + '-' + dd + '--' + HH + '-' + MM + '-' + SS);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    getTime,
    sleep
}