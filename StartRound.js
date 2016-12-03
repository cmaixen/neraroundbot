/**
 * StartRound auth'
 */

var token = process.env.TOKEN;
var Bot = require('node-telegram-bot-api');
var bot;

var FirebaseManager = require('./FirebaseManager.js');
var StartRoundManager = function () {};

if (process.env.NODE_ENV === 'production') {
  bot = new Bot(token);  bot.setWebHook('https://neraroundbot.herokuapp.com/' + bot.token);} else {
  bot = new Bot(token, { polling: true });
}


StartRoundManager.prototype.startround = function(bot, listId, guestName, action){
   bot.onText(/\/start (.+)/, function (msg, match) { 
   FirebaseManager.createList(msg.chat.id, match[1], msg.from); 
   var message = "Drop @'s \nRound started!!";
   bot.sendMessage(msg.chat.id, message); 
 });
};


module.exports = new StartRoundManager();
