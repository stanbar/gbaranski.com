$( document ).ready(function() {
  getTimes();
});
window.onscroll = function() {shrinkNavbar()};
function shrinkNavbar() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
  document.getElementById("logo-container").style.fontSize = "40px";
  document.getElementById("navbar").style.height = "70px";
  document.getElementById("navbar").style.lineHeight = "70px";

} else {
  document.getElementById("logo-container").style.fontSize = "45px";
  document.getElementById("navbar").style.height = "90px";
  document.getElementById("navbar").style.lineHeight = "90px";
  }
}


function getTimes() {
    // document.getElementById("age").innerHTML = calcTimeDifference("2004-09-19");
    document.getElementById("googleCodeInDate").innerHTML = calcTimeDifference("2020-01-12");
    document.getElementById("waterMixerEspDate").innerHTML = calcTimeDifference("2020-01-13");
    document.getElementById("alarmClockEspDate").innerHTML = calcTimeDifference("2020-01-24");
    document.getElementById("downloadSpeedCalculatorDate").innerHTML = calcTimeDifference("2020-03-01");
    document.getElementById("olxBotDate").innerHTML = calcTimeDifference("2020-03-04");
    document.getElementById("desktopAlarmClockDate").innerHTML = calcTimeDifference("2020-03-10");
}
function calcTimeDifference(endDate) {
    const nowDate = moment(); //todays date
    let endParsedDate = moment(endDate); // another date
    const duration = moment.duration(nowDate.diff(endParsedDate));
    const diffYears = duration.get('years') > 0 ? duration.get('years') + " year(s) " : "";
    const diffMonths = duration.get('months') > 0 ? duration.get('months') + " month(s) " : "";
    const diffDays = duration.get('days') > 0 ? duration.get('days') + " day(s) " : "";
    return diffYears + diffMonths + diffDays;
}
