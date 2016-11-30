var token = process.env.TOKEN;

var Bot = require('node-telegram-bot-api');
var bot;

var FirebaseManager = require('./FirebaseManager.js');

if(process.env.NODE_ENV === 'production') {
  bot = new Bot(token);
  bot.setWebHook('YOUR-APP-URL' + bot.token);
}
else {
  bot = new Bot(token, { polling: true });
}

/**
 * matches /start
 */
 bot.onText(/\/start/, function (msg, match) {
   var fromId = msg.chat.id; // get the id, of who is sending the message
   var message = "Welcome to your AttendanceListBot\n";
   message += "Create your attendance list using /create [your_list_name] command."
   bot.sendMessage(fromId, message);
 });

 //match /create [list name]
 bot.onText(/\/create (.+)/, function (msg, match) {
   FirebaseManager.createList(msg.chat.id, match[1], msg.from);

   var message = "Your attendance list was created: "+match[1];
   bot.sendMessage(msg.chat.id, message);
 });

 /**
  * matches /in
  */
  bot.onText(/\/in/, function (msg, match) {
    FirebaseManager.managerParticipants(bot, msg.chat.id, msg.from.first_name, msg.from.last_name, 'add');
  });

  /**
   * matches /out
   */
   bot.onText(/\/out/, function (msg, match) {
     FirebaseManager.managerParticipants(bot, msg.chat.id, msg.from.first_name, msg.from.last_name, 'remove');
   });

   /**
    * matches /add_guest
    */
    bot.onText(/\/add_guest (.+)/, function (msg, match) {
      FirebaseManager.managerGuests(bot, msg.chat.id, match[1], 'add');
    });

  /**
    * matches /add_guest
   */
   bot.onText(/\/remove_guest (.+)/, function (msg, match) {
     FirebaseManager.managerGuests(bot, msg.chat.id, match[1], 'remove');
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
      var message = "To create a new list use: /create [your_list_name] \n";
      message += "To add your name on the list use: /in \n";
      message += "To remove your name from the list use: /out \n";
      message += "To add guest's name on the list use: /add_guest [guest_name] \n";
      message += "To remove guest's name from the list use: /remove_guest [guest_name] \n";
      message += "To show the list use: /show \n";
      bot.sendMessage(fromId, message);
    });

module.exports = bot;
