var nextr = function(roundlist) {

var moment = require('moment');
var output = "";

var currentTime = moment();

      var getrounds = getroundtime(roundlist);
      var rtimeItems = Object.keys(getrounds);
          rtimeItems.forEach(function(item) {

          var roundrelease = moment(getrounds[item], 'HH:mm');

          output = currentTime.format('HH:mm');
          
    });



    return output;

}
module.exports = nextr; 