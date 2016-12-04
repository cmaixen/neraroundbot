'use strict'

var fs=require("fs");
var ControlManager = function () {};

//Read Round Config File 
var jsonObject=JSON.parse(fs.readFileSync('RoundConf.json', 'utf8'));
//Denetleme Atamasi
var RoundOuth = JSON.stringify(jsonObject.Rounds);
//Chat Id Denetleme Kodu
// if (RoundOuth.indexOf(274298910) > -1) {
//    console.log("Ok");
//}

//ControlClass.listCheck = function (UChatId) {
    function listcheck(UChatId) {
/** 
    if (RoundOuth.indexOf(UChatId) > -1) {
        return true;
    }
        else {
            return false;
        }
*/
console.log("aa")
    }   

//Saat Donusu 
function ugetDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
/** 
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
*/
    return hour + ":" + min;

}

module.export = new ControlManager();