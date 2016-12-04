var getroundchats = function() {

var getDateTime = require('./getDateTime.js');
var fs=require("fs");

//Read Round Config File 
var jsonObject=JSON.parse(fs.readFileSync('RoundConf.json', 'utf8'));
//Denetleme Atamasi
var RoundOuth = JSON.stringify(jsonObject.Rounds);
var returntime = false;
var roundchat = [];

function isInArray(array, search)
{
    return array.indexOf(search) >= 0;
}

for (var make in jsonObject.Rounds) {
    for (var RoundSira in jsonObject.Rounds[make]) {
        var RoundInt = jsonObject.Rounds[make][RoundSira].RoundInt,
        RoundTime = jsonObject.Rounds[make][RoundSira].RoundTime;
        //console.log(make + ', ' + RoundTime + ', ' + RoundInt);
        if(isInArray(roundchat, make)){
             //...
        }
        else {
          roundchat.push(make)
        }

            /**
            else {
                console.log(RoundTime + " " + getDateTime());
                return false
            }
            */   
        }
    }

    return roundchat;

}
module.exports = getroundchats;