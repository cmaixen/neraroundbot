
const FirebaseManager = require('./FirebaseManager2.js');
var initsch; 

const Telegram = require('telegram-bot-bootstrap')
//const TelegramBaseController = Telegram.TelegramBaseController
//const TextCommand = Telegram.TextCommand
const api = new Telegram('290603420:AAFQAW_RMCsEMyq_MH68lYBJnqsMUOXwPCM')
const schedule = require('node-schedule');

var getDateTime = require('./getDateTime.js');
var outhControl = require('./outhControl.js');
var roundtimeControl = require('./roundtimeControl.js');
var getroundchats = require('./getroundchats.js');
var Promise = require('bluebird');


//var showlist = require('./showlist.js');

//console.log(getroundchats)
var roundchatId = new getroundchats;

var items = Object.keys(roundchatId);
//RoundsChats Time Control

/** 
//60 Sn de bir Kontrollü interval yapının kurgulanması
setInterval(function(){

    items.forEach(function(item) {

        if (roundtimeControl(roundchatId[item])) {
            //var RoundFrom = [author_id=274298910, first_name="@RoundSensei"," "] 
            FirebaseManager.createList(roundchatId[item], "Round", "RoundFrom", 1);
            api.sendMessage(roundchatId[item],"Drop @'s \nRound started!!");
            //console.log("Ok")
        }   
            //console.log(item + '=' + roundchatId[item]);
    });

},60000);


*/


FirebaseManager.showListCheck(-1001089348367, function(roundchatlist) {
    api.sendMessage(-1001089348367,"Round Eleman Listesi!");

    var ritems = Object.keys(roundchatlist);
    console.log("İç Toplam = " + Object.keys(roundchatlist).length)

    sendmsg(-1001089348367,roundchatlist)
 //   ritems.forEach(function(item) {
 //       api.sendMessage(-1001089348367,roundchatlist[item], function() {

//        });
//        console.log(roundchatlist[item]);


 //   });
}) 

function sendmsg(chatId, messages) {
    return Promise.mapSeries(messages, function(message) {
        return api.sendMessage(chatId,message);
    });
}
  



//console.log(roundchatlist.length)
/** 
var ritems = Object.keys(roundchatlist);
    ritems.forEach(function(item) {
        api.sendMessage(-1001089348367,roundchatlist[item]);
        console.log(roundchatlist[item]);

    });

*/

module.exports = initsch;





