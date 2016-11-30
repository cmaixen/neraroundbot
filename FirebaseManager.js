/**
 * Firebase auth'
 */
var firebase = require("firebase");

firebase.initializeApp({
 serviceAccount: "YOUR-SECURITY-PRIVATE-KEY.json",
 databaseURL: "YOUR-FIREBASE-URL"
});

var db  = firebase.database(),
    ref = db.ref('lists');

var FirebaseManager = function () {};

/**
 * Function to create a new list
 *
 * @param  {[type]} listId   [description]
 * @param  {[type]} listname [description]
 * @return {[type]}          [description]
 */
FirebaseManager.prototype.createList = function (listId, listname, author) {
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
    bot.sendMessage(listId, 'Name was removed!');
  }else{
    bot.sendMessage(listId, 'This name not exists in the list');
    return;
  }

  //Set datas to list
  listsRef.update({
    participants: arrParticipants
  });
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
        fullname = guestName;

    if(action === 'add'){
      addItemOnArray(bot, listId, listObj, fullname);
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
        output = listName+'\n';

     //output
     for(var i=0; i<participantsList.length; i+=1){
       output += ''+(i+1)+'. '+participantsList[i]+'\n';
     }

     bot.sendMessage(listId, output);
  });
};


module.exports = new FirebaseManager();
