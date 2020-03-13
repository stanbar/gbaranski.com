
window.onscroll = function() {shrinkNavbar()};
function shrinkNavbar() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
  document.getElementById("logo-container").style.fontSize = "50px";
  document.getElementById("navbar").style.height = "70px";
  document.getElementById("navbar").style.lineHeight = "70px";

} else {
  document.getElementById("logo-container").style.fontSize = "60px";
  document.getElementById("navbar").style.height = "100px";
  document.getElementById("navbar").style.lineHeight = "100px";

}
}

var result;
function getTimes() {
    calcTimeDifference("2004-09-19");
    document.getElementById("age").innerHTML = result;
    calcTimeDifference("2020-01-12");
    document.getElementById("googleCodeInDate").innerHTML = result;
    calcTimeDifference("2020-01-13");
    document.getElementById("waterMixerEspDate").innerHTML = result;
    calcTimeDifference("2020-01-24");
    document.getElementById("alarmClockEspDate").innerHTML = result;
    calcTimeDifference("2020-03-01");
    document.getElementById("downloadSpeedCalculatorDate").innerHTML = result;
    calcTimeDifference("2020-03-04");
    document.getElementById("olxBotDate").innerHTML = result;
    calcTimeDifference("2020-03-10");
    document.getElementById("desktopAlarmClockDate").innerHTML = result;


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
