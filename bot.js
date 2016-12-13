var token = process.env.TOKEN;
var Bot = require('node-telegram-bot-api');
var bot;

var FirebaseManager = require('./FirebaseManager.js');
var outhControl = require('./outhControl.js');
var getroundtime = require('./getRoundTime.js');

var kontrolchatid;
var AdminList = "274298910###262889034";
var AdminCheck = 0;
var UnAuthMsg = '';

if (process.env.NODE_ENV === 'production') {
  bot = new Bot(token);  bot.setWebHook('https://neraroundbot.herokuapp.com/' + bot.token);} else {
  bot = new Bot(token, { polling: true });
}

 bot.onText(/\/code/, function (msg, match) {
   if(AdminList.indexOf(msg.from.id) >= 0) {
     var message = "Chat Id = "+msg.chat.id + "\nYour ID = " +  msg.from.id;
     bot.sendMessage(msg.chat.id, message);
   } else {
     bot.sendMessage(msg.chat.id, 'You are not authorized to use me! Please contact my master!\n/help');
     UnAuthMsg = 'Unauthorized usage ' + msg.from.id + ' = ' + msg.from.first_name + ' ' + msg.from.last_name;
     bot.sendMessage(274298910, UnAuthMsg);
     bot.sendMessage(262889034, UnAuthMsg);
   }
 });

 bot.onText(/\/roundschedule/, function (msg, match) {
  // if(outhControl(msg.chat.id)) {
     var message = "Time = "; // + Date().getTime();
      var getrounds = getroundtime(msg.chat.id)
      var rtimeItems = Object.keys(getrounds);
          rtimeItems.forEach(function(item) {
            message += "\nRound = " + getrounds[item];
          })
       bot.sendMessage(msg.chat.id, message);
  // } else {
 //    bot.sendMessage(msg.chat.id, 'I dont work for this group. Please contact my masters if you want me to host your rounds too!\n/help');
  // }
 });

//match /create [list name] 
 bot.onText(/\/start (.+)/, function (msg, match) {
   if(outhControl(msg.chat.id)) {
     if(AdminList.indexOf(msg.from.id) >= 0) {
       var message = "Drop @'s \nRound started!!";
       FirebaseManager.createList(msg.chat.id, match[1], msg.from, 1);
       bot.sendMessage(msg.chat.id, message);
     } else {
       bot.sendMessage(msg.chat.id, 'You are not authorized to use me! Please contact my masters!\n/help');
       UnAuthMsg = 'Unauthorized usage ' + msg.from.id + ' = ' + msg.from.first_name + ' ' + msg.from.last_name;
       bot.sendMessage(274298910, UnAuthMsg);
       bot.sendMessage(262889034, UnAuthMsg);
     }
    } else {
     bot.sendMessage(msg.chat.id, 'I dont work for this group. Please contact my masters if you want me to host your rounds too!\n/help');
      UnAuthMsg = 'Unauthorized usage ' + msg.from.id + ' = ' + msg.from.first_name + ' ' + msg.from.last_name;
       bot.sendMessage(274298910, UnAuthMsg);
       bot.sendMessage(262889034, UnAuthMsg);
   }
  });

  /**
  * matches @ -- Account ekle
  */
  bot.onText(/@/, function (msg, match) {
   if(outhControl(msg.chat.id)) {
      var msgg =  msg.text;
      if(msgg.indexOf('@') == 0) {
       
        var msggArr = msgg.split("@");
        var msggItems = Object.keys(msggArr);
        var message = '';
          msggItems.forEach(function(item) {
            if (msggArr[item].trim() != '') {
              message = "@" + msggArr[item].trim();
              FirebaseManager.managerGuests(bot, msg.chat.id, message, 'add');
            }
            })
        //bot.sendMessage(msg.chat.id, message);
      }
    } else {
     bot.sendMessage(msg.chat.id, 'I dont work for this group. Please contact my masters if you want me to host your rounds too!\n/help');
      UnAuthMsg = 'Unauthorized usage ' + msg.from.id + ' = ' + msg.from.first_name + ' ' + msg.from.last_name;
       bot.sendMessage(274298910, UnAuthMsg);
       bot.sendMessage(262889034, UnAuthMsg);
   }
  });

  /**
    * matches D -- Done account
   */
   bot.onText(/D (.+)/, function (msg, match) {
   if(outhControl(msg.chat.id)) {
      if(msg.text.indexOf('D') == 0) {
         //bot.sendMessage(msg.chat.id, msg.from.first_name + " " + match[1].split(" ")[0] + " Done!");
         FirebaseManager.managerGuests(bot, msg.chat.id, match[1].split(" ")[0], 'remove');
       }
    } else {
     bot.sendMessage(msg.chat.id, 'I dont work for this group. Please contact my masters if you want me to host your rounds too!\n/help');
       UnAuthMsg = 'Unauthorized usage ' + msg.from.id + ' = ' + msg.from.first_name + ' ' + msg.from.last_name;
       bot.sendMessage(274298910, UnAuthMsg);
       bot.sendMessage(262889034, UnAuthMsg);
   }
   });

  /**
   * matches /remove -- Listeden cikart
   */
   bot.onText(/Remove! (.+)/, function (msg, match) {
   if(outhControl(msg.chat.id)) {
     //bot.sendMessage(msg.chat.id, msg.from.first_name + " " + match[1] + " removed from the round!");
     FirebaseManager.managerGuests(bot, msg.chat.id, match[1], 'remove');
    } else {
     bot.sendMessage(msg.chat.id, 'I dont work for this group. Please contact my masters if you want me to host your rounds too!\n/help');
      UnAuthMsg = 'Unauthorized usage ' + msg.from.id + ' = ' + msg.from.first_name + ' ' + msg.from.last_name;
       bot.sendMessage(274298910, UnAuthMsg);
       bot.sendMessage(262889034, UnAuthMsg);
   }
   });

  /**
   * matches /showList
   */
   bot.onText(/\/show/, function (msg, match) {
   if(outhControl(msg.chat.id)) {
     if(AdminList.indexOf(msg.from.id) >= 0) {
         var list = FirebaseManager.showList(bot, msg.chat.id);
       } else {
         bot.sendMessage(msg.chat.id, 'You are not authorized to use me! Please contact my master!\n/help');
          UnAuthMsg = 'Unauthorized usage ' + msg.from.id + ' = ' + msg.from.first_name + ' ' + msg.from.last_name;
       bot.sendMessage(274298910, UnAuthMsg);
       bot.sendMessage(262889034, UnAuthMsg);
       }
    } else {
     bot.sendMessage(msg.chat.id, 'I dont work for this group. Please contact my masters if you want me to host your rounds too!\n/help');
       UnAuthMsg = 'Unauthorized usage ' + msg.from.id + ' = ' + msg.from.first_name + ' ' + msg.from.last_name;
       bot.sendMessage(274298910, UnAuthMsg);
       bot.sendMessage(262889034, UnAuthMsg);
   }
   });

  /**
   * matches /showList
   */
   bot.onText(/\/check/, function (msg, match) {     
   if(outhControl(msg.chat.id)) {
       if(AdminList.indexOf(msg.from.id) >= 0) {
         var list = FirebaseManager.showListCheck(bot, msg.chat.id);
       } else {
         bot.sendMessage(msg.chat.id, 'You are not authorized to use me! Please contact my master!\n/help');
          UnAuthMsg = 'Unauthorized usage ' + msg.from.id + ' = ' + msg.from.first_name + ' ' + msg.from.last_name;
       bot.sendMessage(274298910, UnAuthMsg);
       bot.sendMessage(262889034, UnAuthMsg);
       }
    } else {
     bot.sendMessage(msg.chat.id, 'I dont work for this group. Please contact my masters if you want me to host your rounds too!');
       UnAuthMsg = 'Unauthorized usage ' + msg.from.id + ' = ' + msg.from.first_name + ' ' + msg.from.last_name;
       bot.sendMessage(274298910, UnAuthMsg);
       bot.sendMessage(262889034, UnAuthMsg);
   }
   });

   /**
    * matches /help
    */
    bot.onText(/\/help/, function (msg, match) {
      var fromId = msg.chat.id; // get the id, of who is sending the message
      var message = "Hello! I'm RoundSensei\n I'm a round bot to host your rounds created by my masters @arkns & @neskirimli \n";
      message += "\nHere is some info about what can you do with me :)\n\n";
      message += "use: @account -- To add your account to the round \n";
      message += "use: /remove! @account -- To remove your account from the round \n";
      message += "use: D @account -- To say you are Done for the round \n";
      message += "use: /show -- To show the list \n";
      message += "use: /check -- To show the list of users NOT Done \n";
      bot.sendMessage(fromId, message);
    });


module.exports = bot;
