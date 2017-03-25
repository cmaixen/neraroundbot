var nextr = function(roundlist) {

var moment = require('moment');
var getroundtime = require('./getRoundTime.js');
var output = "";
var timecheck = [];
var roundrelease = moment('10:00', 'HH:mm');

var currentTime = moment();

      var getrounds = getroundtime(roundlist);
      var rtimeItems = Object.keys(getrounds);
          rtimeItems.forEach(function(item) {
          timecheck.push(moment(getrounds[item], 'HH:mm'));
          roundrelease = moment(getrounds[item], 'HH:mm');
          output += '' + moment(roundrelease).toNow() + '/n';
    });

/*
    for(var i=0; i<timecheck.length; i+=1){
        if (i == timecheck.length) {

        } 
        else {
            if (currentTime > timecheck[i] && currentTime > timecheck[i+1]) {

            } 
        }

    }
*/
//var roundrelease = moment('10:00', 'HH:mm');
//output = moment(roundrelease).toNow();
//output = currentTime.format('HH:mm');

    return output;

}
module.exports = nextr; 