var outhControl = function(UChatId) {

var fs=require("fs");

//Read Round Config File 
var jsonObject=JSON.parse(fs.readFileSync('RoundConf.json', 'utf8'));
//Denetleme Atamasi
var RoundOuth = JSON.stringify(jsonObject.Rounds);
//Chat Id Denetleme Kodu
// if (RoundOuth.indexOf(274298910) > -1) {
//    console.log("Ok");
//}

    if (RoundOuth.indexOf(UChatId) > -1) {
        return true;
    }
        else {
        return false;
    } 
}
module.exports = outhControl;