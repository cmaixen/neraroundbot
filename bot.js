var token = process.env.TOKEN;
var Bot = require('node-telegram-bot-api');
var bot;

var FirebaseManager = require('./FirebaseManager.js');

var kontrolchatid;

if (process.env.NODE_ENV === 'production') {
  bot = new Bot(token);  bot.setWebHook('https://neraroundbot.herokuapp.com/' + bot.token);
} else {
  bot = new Bot(token, { polling: true });
}

 //match /create [list name]
 bot.onText(/Round! (.+)/, function (msg, match) {
   FirebaseManager.createList(msg.chat.id, match[1], msg.from);
   var message = "Drop @'s ";
   bot.sendMessage(msg.chat.id, message);
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
    * matches /help
    */
    bot.onText(/\/help/, function (msg, match) {
      var fromId = msg.chat.id; // get the id, of who is sending the message
      var message = msg.chat.id + " ";
      message += "To add your account to the round use: @account \n";
      message += "To remove your account from the round use: /remove @account \n";
      message += "To say you are Done for the round use: D @account \n";
      message += "To show the list use: /show \n";
      bot.sendMessage(fromId, message);
    });


module.exports = bot;
