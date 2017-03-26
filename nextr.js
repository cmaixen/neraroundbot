var nextr = function(roundlist) {


var moment = require('moment');
var getroundtime = require('./getRoundTime.js');
var output = "";
var roundrelease = moment('00:00', 'HH:mm');
var fark = '';
var ilkround = 0;
var ilkroundtime = moment('');

var currentTime = moment();

      var getrounds = getroundtime(roundlist);
      var rtimeItems = Object.keys(getrounds);
          rtimeItems.forEach(function(item) {
          if (ilkround==0) {
              ilkround = 1;
              ilkroundtime = moment(getrounds[item], 'HH:mm');
          };
          roundrelease = moment(getrounds[item], 'HH:mm');
          //output += '' + moment(roundrelease).toNow() + '\n';
          //fark = roundrelease.diff(currentTime).toString
          if (roundrelease.diff(currentTime)<=0){

          } else {
              if (output!='') {

              } else {
                output += '' + roundrelease.diff(currentTime, 'HH:mm:ss') + '';
              }
          }
        });
        //Ertesi Gun Kontrolü 
        if (output!='') {

        } else {
            roundrelease = moment(ilkroundtime, 'HH:mm').add(1,'d');
            output += '' + roundrelease.diff(currentTime, 'HH:mm:ss') + '';
        }


        fark = 'RoundSensei Time : ' + moment().format("HH:mm:ss") + ' (GMT)\n' + 'Next round will start in ' + moment.unix(output/1000).format("HH:mm:ss") + ' later';
        return fark;

}
module.exports = nextr; 