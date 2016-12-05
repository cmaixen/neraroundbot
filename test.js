/** var outhControl = require('./outhControl.js');

if (outhControl(27429810)) {
    console.log("Ok")
}
else {
    console.log("Degil")
}

*/

var getroundtime = require('./getroundtime.js');

var getrounds = getroundtime(-1001089348367)
//var getrounds = getroundtime(274298910)


var rtimeItems = Object.keys(getrounds);
    rtimeItems.forEach(function(item) {
        console.log(item + '=' + getrounds[item])
    })
