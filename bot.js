var token = process.env.TOKEN;
var Bot = require('node-telegram-bot-api');
var bot;

var FirebaseManager = require('./FirebaseManager.js');

var kontrolchatid;
var AdminList = "274298910###262889034";
var AdminCheck = 0;

if (process.env.NODE_ENV === 'production') {
  bot = new Bot(token);  bot.setWebHook('https://neraroundbot.herokuapp.com/' + bot.token);} else {
  bot = new Bot(token, { polling: true });
}

var AdminListArr = AdminList.split("####");



 bot.onText(/\/code/, function (msg, match) {
   var message = "Your Id = "+msg.chat.id;
   bot.sendMessage(msg.chat.id, message);
 });

//match /create [list name] 
 bot.onText(/\/start (.+)/, function (msg, match) {
   for(var i=0; i<AdminListArr.length; i+=1){
    if (AdminListArr[i] == msg.from.id){
      AdminCheck = 1;
      }
   }
   if (AdminCheck == 1) {
     FirebaseManager.createList(msg.chat.id, match[1], msg.from, 1); 
     var message = "Drop @'s \nRound started!!" + msg.from;
     bot.sendMessage(msg.chat.id, message);
   } else {
     bot.sendMessage(msg.chat.id, 'You are not authorized to use me! Please contact my master!');
   }
  });

  /**
  * matches @ -- Account ekle
  */
  bot.onText(/@/, function (msg, match) {
    if(msg.text.indexOf('@') == 0) {
      //bot.sendMessage(msg.chat.id, msg.from.first_name + " " + msg.text + " Added!");
      FirebaseManager.managerGuests(bot, msg.chat.id, msg.text, 'add');
    }
  });

  /**
    * matches D -- Done account
   */
   bot.onText(/D (.+)/, function (msg, match) {
     //bot.sendMessage(msg.chat.id, msg.from.first_name + " " + match[1].split(" ")[0] + " Done!");
     FirebaseManager.managerGuests(bot, msg.chat.id, match[1].split(" ")[0], 'remove');
   });

  /**
   * matches /remove -- Listeden cikart
   */
   bot.onText(/Remove! (.+)/, function (msg, match) {
     //bot.sendMessage(msg.chat.id, msg.from.first_name + " " + match[1] + " removed from the round!");
     FirebaseManager.managerGuests(bot, msg.chat.id, match[1], 'remove');
     //FirebaseManager.managerParticipants(bot, msg.chat.id, msg.from.first_name, msg.from.last_name, 'remove');
   });

  /**
   * matches /showList
   */
   bot.onText(/\/show/, function (msg, match) {
     var list = FirebaseManager.showList(bot, msg.chat.id);
   });

  /**
   * matches /showList
   */
   bot.onText(/\/check/, function (msg, match) {
     var list = FirebaseManager.showListCheck(bot, msg.chat.id);
   });

   /**
    * matches /help
    */
    bot.onText(/\/help/, function (msg, match) {
      var fromId = msg.chat.id; // get the id, of who is sending the message
      var message = msg.chat.id + " ";
      message += "To add your account to the round use: @account \n";
      message += "To remove your account from the round use: /remove @account \n";
      message += "To say you are Done for the round use: D @account \n";
      message += "To show the list use: /show \n";
      message += "To show the list of users NOT Done use: /check \n";
      bot.sendMessage(fromId, message);
    });


module.exports = bot;
