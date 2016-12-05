var rtControl = function(rTime, rbefore) {

var moment = require('moment');

//var rTime ="16:57"
//var rbefore = 10

var currentTime = moment();
var roundrelease = moment(rTime, 'HH:mm');
var roundTime = roundrelease.subtract(rbefore, 'minutes');
var roundrelease = moment(rTime, 'HH:mm');
var output = ""

//setInterval(function(){

    currentTime = moment();

    if (currentTime.format('HH:mm') == roundTime.format('HH:mm')) {
            //console.log("RoundStart")
            //console.log(rTime + " === " + currentTime.format('HH:mm') + " --- " + roundTime.format('HH:mm') + " *** " + roundrelease.format('HH:mm'))
            output = "rStart";
    }

    if (currentTime.format('HH:mm') == roundrelease.format('HH:mm')) {
            //console.log("RoundRelease")
            //console.log(rTime + " === " + currentTime.format('HH:mm') + " --- " + roundTime.format('HH:mm') + " *** " + roundrelease.format('HH:mm'))
            output = "rRelease"
    }
    if (currentTime.format('HH:mm') > roundTime.format('HH:mm')) {
        if (currentTime.format('HH:mm') < roundrelease.format('HH:mm')) {
                //console.log("RoundContinue")
                //console.log(rTime + " === " + currentTime.format('HH:mm') + " --- " + roundTime.format('HH:mm') + " *** " + roundrelease.format('HH:mm'))
                output = "rContinue"
        } 
    }

    //console.log("Dön Başa=== " + currentTime.format('HH:mm') + " --- " + roundTime.format('HH:mm') + " *** " + roundrelease.format('HH:mm'))
    return output;
    
//},5000);

}

module.exports = rtControl; 