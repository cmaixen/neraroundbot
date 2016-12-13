/**
 * Firebase auth'
 */
var firebase = require("firebase");
     var Promise = require('bluebird');

firebase.initializeApp({
 serviceAccount: "neraroundbot-306b7c420e67.json",
 databaseURL: "https://neraroundbot.firebaseio.com/"
});

var db  = firebase.database(),
    ref = db.ref('lists');

var FirebaseManager = function () {};

/**
 * Function to create a new list
 *
 * @param  {[type]} listId   [description]
 * @param  {[type]} listname [description]
/ * @return {[type]}          [description]
 */
 FirebaseManager.prototype.createList = function (listId, listname, author, status) {
  //Get current list
  var list = listId.toString(),
      listReference = 'list_'+list.replace(/-|\s/g,'');

  var listsRef = ref.child(listReference);

  //Set datas to list
  listsRef.set({
    listName: listname,
    author:{
      author_id: author.id,
      author_name: author.first_name+' '+author.last_name
    },
    statusfield: status,
    participants: {}
  });
};

function addItemOnArray(bot, listId, participantsList, fullname){
  var list = listId.toString(),
      listReference = 'list_'+list.replace(/-|\s/g,''),
      listsRef = ref.child(listReference),
      arrParticipants = participantsList[listReference].participants || [];

  //Element exists?
  if(arrParticipants.indexOf(fullname) == -1){
    arrParticipants.push(fullname);
   bot.sendMessage(listId, 'Name was added!');
  }else{
    bot.sendMessage(listId, 'This name already exists in the list');
    return;
  }

  //Set datas to list
  listsRef.update({
    participants: arrParticipants
  });
};

function removeItemOnArray(bot, listId, participantsList, fullname){
  var list = listId.toString(),
      listReference = 'list_'+list.replace(/-|\s/g,''),
      listsRef = ref.child(listReference),
      arrParticipants = participantsList[listReference].participants || [],
      index = arrParticipants.indexOf(fullname);

  if(index > -1){
    arrParticipants.splice(index, 1);
  }else{
    bot.sendMessage(listId, 'This name not exists in the list');
    return;
  }
 
 if(arrParticipants.length <= 0){
    bot.sendMessage(listId, 'Round Closed! \nWelldone!!');
 
    //Set datas to list
    listsRef.update({
      participants: arrParticipants
    });
    listsRef.update({
        statusfield: 0
      });
  }else{
    //bot.sendMessage(listId, 'bitmedi!!' + arrParticipants.length);
     //Set datas to list
    listsRef.update({
      participants: arrParticipants
    });
  }
 

  //Set datas to list
  //listsRef.update({
   // participants: arrParticipants
  //});
};

FirebaseManager.prototype.managerParticipants = function(bot, listId, firstName, lastName, action){
  ref.once('value', function(snapshot){
    var listObj = snapshot.val(),
        fullname = firstName+' '+lastName;

    if(action === 'add'){
      addItemOnArray(bot, listId, listObj, fullname);
    }else{
      removeItemOnArray(bot, listId, listObj, fullname);
    }
  });
};

FirebaseManager.prototype.managerGuests = function(bot, listId, guestName, action){
  ref.once('value', function(snapshot){        
    var listObj = snapshot.val(),
        list = listId.toString(),
        listReference = 'list_'+list.replace(/-|\s/g,''),
        fullname = guestName,
        statusget = listObj[listReference].statusfield;
   
    if(action === 'add'){
     if(statusget === 0){
       bot.sendMessage(listId, 'Round hasnt started yet!');
      }else if(statusget === 2){
       bot.sendMessage(listId, 'Put D @account!');
      }else{
      addItemOnArray(bot, listId, listObj, fullname);
      bot.sendMessage(listId, '\n' + fullname);
      }
     }else{
      removeItemOnArray(bot, listId, listObj, fullname);
    }

  
  });
};

/*
FirebaseManager.prototype.sleep = function (milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e5; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
*/

FirebaseManager.prototype.Pro = function sendMessages(bot, chatId, messages) {
    return Promise.mapSeries(messages, function(message) {
        return bot.sendMessage(chatId, message);
    });
}

FirebaseManager.prototype.showList = function (bot, listId) {
  ref.once("value", function(snapshot) {

    var listObj = snapshot.val(),
        list = listId.toString(),
        listReference = 'list_'+list.replace(/-|\s/g,''),
        listsRef = ref.child(listReference),
        participantsList = listObj[listReference].participants || [],
        listName = listObj[listReference].listName,
        count = 0,
        //countforlisting = 0,
        listnumber = 0,   
        outputStr = '',
        outputListStr = '';

     //output
    if (participantsList.length >0) {
      outputListStr = 'Like & Comment RECENT \nCWD with @ \nGO!!! \n\n####' ;
      //bot.sendMessage(listId, outputStr);
      //outputStr = '';
           
      for(var i=0; i<participantsList.length; i+=1){
        outputListStr += '' +participantsList[i]+'\n';
        count = i;
        //countforlisting += 1;
        listnumber += 1;

        if (listnumber >= 5) {
          outputListStr += '####' +'\n';          
          listnumber = 0;
        }
        
             
      }
      outputListStr += '\n' + (count+1) + ' participants';   
     
      var outputListArr = outputListStr.split("####");

      FirebaseManager.prototype.Pro(bot, listId, outputListArr)
         .then(function() {
             //bot.sendMessage(listId, outputListArr);
         });
    } else {
      bot.sendMessage(listId, 'Round cancelled!') ;
      listsRef.update({
        statusfield: 0
      });
    }
        
    
  });
};

FirebaseManager.prototype.showListCheck = function (bot, listId) {
  ref.once("value", function(snapshot) {

    var listObj = snapshot.val(),
        list = listId.toString(),
        listReference = 'list_'+list.replace(/-|\s/g,''),
        listsRef = ref.child(listReference),
        participantsList = listObj[listReference].participants || [],
        listName = listObj[listReference].listName,
        count = 0,
        output = '';

     //output
     for(var i=0; i<participantsList.length; i+=1){
       output += '' +participantsList[i]+'\n';
       count = i;
     }
   
    if(participantsList.length <= 0){
      output = 'No ongoing Round?!';
    }else{
      output = 'Users NOT Done! \n\n' + output ;
      output += '\nCount ' + (count+1) ;
    }
    
    bot.sendMessage(listId, output);
  });
};
module.exports = new FirebaseManager();
