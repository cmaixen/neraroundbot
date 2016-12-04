//var FirebaseManager = require('./FirebaseManager2.js');
var showlist = function(roundchatId) {

//var showlist

//var roundchatId = -1001089348367
var firebase = require("firebase");


firebase.initializeApp({
 serviceAccount: "neraroundbot-306b7c420e67.json",
 databaseURL: "https://neraroundbot.firebaseio.com/"
});

var db  = firebase.database(),
    ref = db.ref('lists');


ref.once("value", function(snapshot) {

    var listObj = snapshot.val(),
        list = roundchatId,
        //listReference = 'list_' + roundchatId.toString.replace(/-|\s/g,''),
        listReference = 'list_1001089348367',
        listsRef = ref.child(listReference),
        participantsList = listObj[listReference].participants || [],
        listName = listObj[listReference].listName,
        count = 0,
        output = '';

     //output
 //    for(var i=0; i<participantsList.length; i+=1){
 //      output += '' +participantsList[i]+'\n';
 //      count = i;
 //    }

var showroundList = [];
var output =""
var i=0
var items = Object.keys(participantsList);

items.forEach(function(item) {
  //console.log(item + '=' + participantsList[item]);
  output += '' +participantsList[item]+'\n';
  i=i+1;
  if (i>2) {
    console.log(i + " " + output)
    showroundList.push(output);
    output='';
    i=0
 }
});
    console.log(i + " " + output)
    showroundList.push(output);
    output='';
    i=0
  });

return showroundList;

}

module.exports = showlist; 