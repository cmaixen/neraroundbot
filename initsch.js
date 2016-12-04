

const Telegram = require('telegram-bot-bootstrap')
//const TelegramBaseController = Telegram.TelegramBaseController
//const TextCommand = Telegram.TextCommand
const api = new Telegram('290603420:AAFQAW_RMCsEMyq_MH68lYBJnqsMUOXwPCM')
const schedule = require('node-schedule');

const ControlManager = require('./Control.js');

//console.log(ControlClass.listCheck(274298910))


//Schedule Islerin Tanımlanması 
//        console.log(make + ', ' + RoundTime + ', ' + RoundInt);

/** 
for (var make in jsonObject.Rounds) {
    for (var RoundSira in jsonObject.Rounds[make]) {
        var RoundInt = jsonObject.Rounds[make][RoundSira].RoundInt,
        RoundTime = jsonObject.Rounds[make][RoundSira].RoundTime;
    }
}

const ruleTime = new schedule.RecurrenceRule();

for (var make in jsonObject.Rounds) {
    for (var RoundSira in jsonObject.Rounds[make]) {
        var RoundInt = jsonObject.Rounds[make][RoundSira].RoundInt,
        RoundTime = jsonObject.Rounds[make][RoundSira].RoundTime;

        ruleTime.hour = RoundTime;

        console.log ( ruleTime)
        var j = schedule.scheduleJob(ruleTime, function(){
                api.sendMessage(274298910,"time")
                return;
        });

    }
}

 api.sendMessage(274298910,"time")
*/

//60 Sn de bir Kontrollü interval yapının kurgulanması
setInterval(function(){
console.log(ControlManager.getDateTime())

},5000);





