/**
 * Firebase auth'
 */
var firebase = require("firebase");

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
    //bot.sendMessage(listId, 'Name was added!');
  }else{
    //bot.sendMessage(listId, 'This name already exists in the list');
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
      bot.sendMessage(listId, 'Round baslamadi');
     }else{
      addItemOnArray(bot, listId, listObj, fullname);
     }
    }else{
      removeItemOnArray(bot, listId, listObj, fullname);
    }

  
  });
};


FirebaseManager.prototype.showList = function (bot, listId) {
  ref.once("value", function(snapshot) {

    var listObj = snapshot.val(),
        list = listId.toString(),
        listReference = 'list_'+list.replace(/-|\s/g,''),
        listsRef = ref.child(listReference),
        participantsList = listObj[listReference].participants || [],
        listName = listObj[listReference].listName,
        count = 0,
        countforlisting = 0,
        listnumber = 0,   
        outputStr = '',
        outputListStr = '';

     //output
    if (participantsList.length >0) {
      outputStr = 'Like & Comment RECENT \nCWD with @ \nGO!!! \n\n' ;
      
      for(var i=0; i<participantsList.length; i+=1){
        outputListStr += '' +participantsList[i]+'\n';
        count = i;
        countforlisting += 1;
        listnumber += 1;

        if (listnumber >= 5) {
          outputListStr += '####' +'\n';          
          countforlisting += 1;
          listnumber = 0;
        }
      }
     
      var outputListArr = outputListStr.split("####");
     
      for(var i=0; i<outputListArr.length; i+=1){
        if (i=0) {
          outputStr += outputListArr[i];
        } else if (i=outputListArr.length-1) {
          outputStr = outputListArr[i] + (count+1) + ' participants';
        } else {
          outputStr = outputListArr[i];
        }
        bot.sendMessage(listId, outputStr +'\n');       
      }
      //output = '\n' + (count+1) + ' participants' ;
      //bot.sendMessage(listId, output);
    } else {
      bot.sendMessage(listId, 'Round cancelled!') ;
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
