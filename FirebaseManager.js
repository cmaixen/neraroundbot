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
    updatefield: 0,
    participants: {}
  });
};


//FirebaseManager.prototype.updateControl = function(bot, listId, setfield, mycallback){
  function updateControl(bot, listId, setfield, mycallback){
  //console.info('Update Control - ');
  ref.once('value', function(snapshot){        
    var listObj = snapshot.val(),
        list = listId.toString(),
        listReference = 'list_'+list.replace(/-|\s/g,''),
        listsRef = ref.child(listReference),
        updateconfield = listObj[listReference].updatefield;

        if (setfield=='get') {
          console.info('Update Control - ' + updateconfield);
          if (updateconfield==0) {
            mycallback = 'true';
            return (mycallback);
          } else { 
            mycallback  = 'false';
            return (mycallback);
          };      
        } else if (setfield=='set') {
          if (updateconfield==0) {
            listsRef.update({
              updateconfield: 1
            });            
            mycallback = 'true';
            return (mycallback);
          } else {
            mycallback  = 'false';
            return (mycallback);
          };
        }
    });
};

function addItemOnArray(bot, listId, participantsList, fullname, droppedby){
  console.info('addItemOnArray - ' + fullname);
  var list = listId.toString(),
      listReference = 'list_'+list.replace(/-|\s/g,''),
      listsRef = ref.child(listReference),
      arrParticipants = participantsList[listReference].participants || [];
      //arrDropper = droppedby.first_name + '(' + droppedby.id + ')';
     
     //msg.from.id + ' = ' + msg.from.first_name + ' ' + msg.from.last_name;

  //Element exists?
  if(arrParticipants.indexOf(fullname) == -1){ 
        var msggArr = fullname.split("@");
        var msggItems = Object.keys(msggArr);
        var message = '';
          msggItems.forEach(function(item) {
            if (msggArr[item].trim() != '') {
              message = droppedby + ', ' + "@" + msggArr[item].trim();

                  console.info('message - ' + message);             
              if(arrParticipants.indexOf(message)>=0){
                bot.sendMessage(listId, 'This name already exists in the list! ' + message);
              } else {
                arrParticipants.push(message);
                //var arrmessage = [];
                //arrmessage.push(message)
                //listsRef.push({
                //   participants: message 
                //});
                console.info('push OK - ' + message); 

                //bot.sendMessage(listId, 'Name was added! ' + message);
             // bot.sendMessage(msg.chat.id, message);
              }
            }
          });

         listsRef.update ({
              participants: arrParticipants
            });
         console.info('update - ' + arrParticipants); 
  } else {
    bot.sendMessage(listId, 'This name already exists in the list');
    return;
  }
  //Set datas to list
};

function removeItemOnArray(bot, listId, participantsList, fullname, droppedby){
  var list = listId.toString(),
      listReference = 'list_'+list.replace(/-|\s/g,''),
      listsRef = ref.child(listReference),
      arrParticipants = participantsList[listReference].participants || [];
     
  var removeControl = 0;   

     
   ref.once('value', function(snapshot){        
      var listObj = snapshot.val(),
      statusget = listObj[listReference].statusfield;
            
       // bot.sendMessage(listId, 'fullname: ' + fullname  + '\nidex: ' + fullname.indexOf("D ")); 
     
     if(fullname.indexOf("D ") <0){
          removeControl = 1;
     }    
       var msgg =  fullname.replace("\n", " ");
       msgg = msgg.replace("D @", "@");
       msgg = msgg.replace(" D ", " ");
       var pattern = / with.*/i;
       msgg = msgg.replace(pattern, " ");
       pattern = / engaged.*/i;
       msgg = msgg.replace(pattern, " ");
       //bot.sendMessage(listId, 'Gelenin son hali: ' + msgg); 
     
        var msggArr = msgg.split("@");
        var msggItems = Object.keys(msggArr);
        var message = '';
        var participantAccArr;
        var participantAcc;
        var messageArr; //diger kelimeleri ayirmak icin kullanilacak array
          msggItems.forEach(function(item) {
            if (msggArr[item].trim() != '') {
              messageArr = msggArr[item].split(" ");
              message = "@" + messageArr[0].trim();
               //bot.sendMessage(listId, 'D acc: ' + message + '\nitem: ' + item);                 

              for (var i = 0; i < arrParticipants.length; i++) {
                   //bot.sendMessage(listId, 'remmovecontrol: ' + removeControl + '\nstatus: ' + statusget);
                   if(removeControl === 1 && statusget === 2){
                        bot.sendMessage(listId, 'Round already started. You cant remove anymore!\nSo complete the round and put D @acc');
                    } else {
                        participantAccArr = arrParticipants[i].split(", ");
                        //participantAcc = participantAccArr[0].trim();
                        //bot.sendMessage(listId, participantAcc)
                        participantAccArr1 = participantAccArr[1].split(" ");

                        participantAcc = participantAccArr1[0].trim();
                        //bot.sendMessage(listId, participantAcc)
                        if (participantAcc.toLowerCase() == message.toLowerCase()) {
                            if (participantAccArr[0].trim() == droppedby) {
                                arrParticipants.splice(i, 1);
                            } else {
                                bot.sendMessage(listId, participantAcc + ' is not your account')
                            }
                        }
                    }  
               }
                      
            }else{
              //bot.sendMessage(listId, 'This name not exists in the list');
              return;
              
            }
         }) 
 if(arrParticipants.length <= 0){
      if (statusget === 0){
           bot.sendMessage(listId, 'Round already Closed!');
      } else if(statusget === 2){
           bot.sendMessage(listId, 'Round Closed! \nWell done!!');
      }
 
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
    
     if (statusget === 1){
           bot.sendMessage(listId, 'Account removed!');
      }
   
  }
  
  });

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

FirebaseManager.prototype.managerGuests = function(bot, listId, guestName, action, dropper){
  console.info('managerGuests - ' + guestName);
  return ref.once('value', function(snapshot){        
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
      addItemOnArray(bot, listId, listObj, fullname, dropper);
      //bot.sendMessage(listId, '\n' + dropper.id);
      }
     }else{
      //bot.sendMessage(listId, 'guest: ' + fullname);
      removeItemOnArray(bot, listId, listObj, fullname, dropper);
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

FirebaseManager.prototype.getroundtime = function (bot, listId) {
  ref.once("value", function(snapshot) {

    var listObj = snapshot.val(),
        list = listId.toString(),
        listReference = 'list_'+list.replace(/-|\s/g,''),
        listsRef = ref.child(listReference),
        roundtime = listObj[listReference].roundtime || [],
        //countforlisting = 0,
        outputListStr = '',
        outputListStrArr = '';
    
    //for(var i=0; i<roundtime.length; i+=1){
        //outputListStrArr = roundtime[i].split(", ");
        //outputListStr += '' +outputListStrArr[0]+'\n';
    //}

    return roundtime;

  })
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
        participantAccArr = participantsList[i].split(", ");
        outputListStr += '' +participantAccArr[1]+'\n';
        count = i;
        //countforlisting += 1;
        listnumber += 1;

        if (listnumber >= 20) {
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
      
      listsRef.update({
        statusfield: 2
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
       output += '@' +participantsList[i]+'\n';
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
