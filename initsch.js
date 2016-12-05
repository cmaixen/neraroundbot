
const FirebaseManager = require('./FirebaseManager2.js');
var initsch; 

const Telegram = require('telegram-bot-bootstrap')
//const TelegramBaseController = Telegram.TelegramBaseController
//const TextCommand = Telegram.TextCommand
const api = new Telegram('290603420:AAFQAW_RMCsEMyq_MH68lYBJnqsMUOXwPCM')
const schedule = require('node-schedule');

var getDateTime = require('./getDateTime.js');
var outhControl = require('./outhControl.js');
//var roundtimeControl = require('./roundtimeControl.js');
var getroundtime = require('./getroundtime.js');
var getroundchats = require('./getroundchats.js');
var Promise = require('bluebird');
var rtControl = require('./rtControl');

// Mesaj Gönderme Fonksiyonu 
function sendmsg(chatId, messages) {
    return Promise.mapSeries(messages, function(message) {
        return api.sendMessage(chatId,message);
    });
}

//Round Chat Listesinin Getirilmesi
var roundchatId = new getroundchats;

var chatItems = Object.keys(roundchatId);

//Zaman Icerisndeki Dongu 
setInterval(function(){

    //Her Bir Chat Grubunun zamanlarının Getirilmesi 
    chatItems.forEach(function(item1) {

        var getrounds = getroundtime(roundchatId[item1]);
        var rtimeItems = Object.keys(getrounds);

            rtimeItems.forEach(function(item2) {
                var outputListArr = getrounds[item2].split(', ');

                var RoundMessage = rtControl(outputListArr[0],outputListArr[1])
                if (RoundMessage!='') {
                    
                    //İlgili Chat Grubu için Round Başlatma
                    if (RoundMessage=="rStart") {
                        FirebaseManager.createList(roundchatId[item1], "Round", "RoundFrom", 1);
                        api.sendMessage(roundchatId[item1],"Drop @'s \nRound started!!"); 
                    }

                     //İlgili Chat Grubu Rounda Devam Etme
                    if (RoundMessage=="rContinue") {
                        api.sendMessage(roundchatId[item1],"Keep Droping !!!"); 
                    }

                    //İlgili Chat Grubu için Round Listesi Gönderme
                    if (RoundMessage=="rRelease") {
                        FirebaseManager.showListCheck(roundchatId[item1], function(roundchatlist) {
                        api.sendMessage(roundchatId[item1],"Like & Comment Recent! \nCWD @account \nGO!!! ");

                        sendmsg(roundchatId[item1],roundchatlist)
                        });   
                    };
                    
                    console.log(roundchatId[item1] + ' --- ' + outputListArr[0] + ' ***' + RoundMessage)
                }
                //console.log(outputListArr[0] + ', ' + outputListArr[1])
            })

    })


},60000);



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




// Shov List Mesaj Gonderme 
/** 
FirebaseManager.showListCheck(-1001089348367, function(roundchatlist) {
    api.sendMessage(-1001089348367,"Like & Comment Recent! \nCWD @account \nGO!!! ");

    //var ritems = Object.keys(roundchatlist);
    //console.log("İç Toplam = " + Object.keys(roundchatlist).length)
    sendmsg(-1001089348367,roundchatlist)
}) 

function sendmsg(chatId, messages) {
    return Promise.mapSeries(messages, function(message) {
        return api.sendMessage(chatId,message);
    });
}
  

*/

//console.log(roundchatlist.length)
/** 
var ritems = Object.keys(roundchatlist);
    ritems.forEach(function(item) {
        api.sendMessage(-1001089348367,roundchatlist[item]);
        console.log(roundchatlist[item]);

    });

*/

module.exports = initsch;





