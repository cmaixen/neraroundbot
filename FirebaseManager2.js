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

 FirebaseManager.prototype.createList = function (listId, listname, author, status) {
  //Get current list
  var list = listId.toString(),
      listReference = 'list_'+list.replace(/-|\s/g,'');

  var listsRef = ref.child(listReference);

  //Set datas to list
  listsRef.set({
    listName: listname,
    author:{
      author_id: 274298910,
      author_name: "@Tesst"
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


FirebaseManager.prototype.showList = function (listId) {
  ref.once("value", function(snapshot) {

    var listObj = snapshot.val(),
        list = listId.toString(),
        listReference = 'list_'+list.replace(/-|\s/g,''),
        listsRef = ref.child(listReference),
        participantsList = listObj[listReference].participants || [],
        listName = listObj[listReference].listName,
        count = 0,
        countforlisting = 0,
        //listnumber = 1;
   
        output = '';

    console.log(listReference)


        return participantsList;

  });
};


FirebaseManager.prototype.showListCheck = function (listId, callback) {

        var showroundList = [];
        var output =''
        var i=0

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

        var items = Object.keys(participantsList);

        items.forEach(function(item) {
        //console.log(item + '=' + participantsList[item]);
        output += '' +participantsList[item]+'\n';
        i=i+1;
        if (i>5) {
            //console.log(i + " " + output)
            showroundList.push(output);
            output='';
            i=0
        }
        });
            //console.log(i + " " + output)
            showroundList.push(output);
            output='';
            i=0

        //console.log("Toplam = " + Object.keys(showroundList).length)
        //return showroundList;
        callback(showroundList);

     });

  };

module.exports = new FirebaseManager();
