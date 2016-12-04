var roundtimeControl = function(UChatId) {

var getDateTime = require('./getDateTime.js');
var fs=require("fs");

//Read Round Config File 
var jsonObject=JSON.parse(fs.readFileSync('RoundConf.json', 'utf8'));
//Denetleme Atamasi
var RoundOuth = JSON.stringify(jsonObject.Rounds);
var returntime = false;

for (var make in jsonObject.Rounds) {
    for (var RoundSira in jsonObject.Rounds[make]) {
        var RoundInt = jsonObject.Rounds[make][RoundSira].RoundInt,
        RoundTime = jsonObject.Rounds[make][RoundSira].RoundTime;
        //console.log(make + ', ' + RoundTime + ', ' + RoundInt);
        if (make==UChatId) {
            if (RoundTime==getDateTime()) {
                return true;
            } 
            /**
            else {
                console.log(RoundTime + " " + getDateTime());
                return false
            }
            */   
        }
    }
}


}
module.exports = roundtimeControl;