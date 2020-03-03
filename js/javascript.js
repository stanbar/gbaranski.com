var result;
function onLoadFunc() {
    calcTimeDifference("2004-09-19");
    document.getElementById("age").innerHTML = result;
    calcTimeDifference("2020-03-01");
    document.getElementById("downloadSpeedCalculatorDate").innerHTML = result;
    calcTimeDifference("2020-01-24");
    document.getElementById("alarmClockEspDate").innerHTML = result;
    calcTimeDifference("2020-01-12");
    document.getElementById("googleCodeInDate").innerHTML = result;
    calcTimeDifference("2020-01-07");
    document.getElementById("waterMixerEspDate").innerHTML = result;
    calcTimeDifference("2020-02-07");
    document.getElementById("liquidManagerDate").innerHTML = result;
}
function calcTimeDifference(endDate) {
    var nowDate = moment(); //todays date
    var endDate = moment(endDate); // another date
    var duration = moment.duration(nowDate.diff(endDate));
    var diffYears = duration.get('years') > 0 ? duration.get('years') + " year(s) " : "";
    var diffMonths = duration.get('months') > 0 ? duration.get('months') + " month(s) " : "";
    var diffDays = duration.get('days') > 0 ? duration.get('days') + " day(s) " : "";
    result = diffYears + diffMonths + diffDays;
    console.log(result);
}
window.onload = onLoadFunc;
