var firebase = require("firebase").initializeApp({
 serviceAccount: "neraroundbot-306b7c420e67.json",
 databaseURL: "https://neraroundbot.firebaseio.com/"
});

var Promise = require('bluebird');
var sleep = require('sleep');
const TeleBot = require('telebot');
const util = require('util');

const bot = new TeleBot({
    token : '290603420:AAFQAW_RMCsEMyq_MH68lYBJnqsMUOXwPCM', 
    polling : {
        interval : 100
    }
    });

//Start Bot Connection 
bot.connect();
// Use ask module
bot.use(require('telebot/modules/ask.js'));

//Start db Connection 
//Connect Sensei Db and snapshot ... 
var ref = firebase.database().ref().child('sensei');
var dbparticipants = ref.child('participants');
var dbparticipantsLogs = ref.child('participantslogs');
var dbbotadmins = ref.child('botadmin');
var dbroundgroups = ref.child('roundgroup');
var dbroundtimes = ref.child('roundtime');
var dbroundstatus = ref.child('roundstatus');
var dbroundmessages = ref.child('roundmessages');

// Variables .....  
// *****************************
var listegoster = []; // Tüm Chat Grupları için liste arrayi. listegondeter[chat.id] seklinde hafizada tutacaktir. 
var botadmins = []; // Bot Super admin listesi ...
var groupdefinitions = []; // Tanımlı Telegram gruplarının listesi ... 
var grouptimes = []; // Tanımlı Telegram gruplarının listesi ... 
var roundgrouptimes = new Object(); // Round grup zaman bilgilerinin hafiza da tutulmasi ... 
var roundgroupmsg = []; // Round grup mesaj bilgilerinin hafiza da tutulması ... 
var roundgroupstatus = []; // Round gruplarinin status bilgilerinin hafiza da tutulması ... 
var roundgroupadmins = new Object(); // Round gruplarının admin bilgilerinin cekilmesi ... 

var usecontrol = []; // İlgili komutların kullanılabilir olup olmadiginin kontrolü için
var settimelistid = ''; // Round Timelarının tanımlanması esnasında ki aktarım değişkeni 
var setmsglistid = ''; // Round mesajlarının tanımlanması esnasında ki aktarım değişkeni 
var setbeforemin = 0; // Round time tanıtımında kac dakika önce başlayacağı ...  
var setroundtime = []; // Round time tanıtımında round yapilacak zaman bilgileri için array ...  
var setroundtimeshow = []; // Round time tanıtımında tanımlanan saatlerin ekrana basılması için kullanılıyor ...  
var setroundmsg = new Object(); // round mesajlarının kaydedilecegi array ... 
var setroundmsgshow = []; // round mesajlarinin kaydedilmesi esnasinda ekranda gosterilebilmesi ... 

var creategroupobj = new Object(); // Yeni grup tanımmlanması esanında bilgilerin tasinmasi ... 

// Bot Messages 
// *****************************
var UnauthorizedMsg = {
    msg1 : 'You cant use this messages, \nOnly my masters can!',
    msg2 : 'You are not authorized to use me! Please contact my master!\n/help',
    msg3 : 'I dont work for this group. Please contact my masters if you want me to host your rounds too!\n/help'
}

var GroupProcessMsg = {
    noGroup : 'There is no group name in the list!',
    noDeff : 'This is no Group Definition on Sensei System, \nYou cant do that!',
    notActive : 'This is not Active Group, \nYou cant do that!',
    notSuperGrp : 'This is not SuperGroup, \nYou cant do that!',
    notPrivate : 'This command only run in direct mode. \nYou have to go RoundSensi user and use /start before you use this command. !',
    notSilent : 'Not Silent. \n',
}

var RoundProcessMsg = {
    noRound : 'Round hasnt started yet!',
    inRound : 'Put D @account!',
    noTalkinRound : 'Please dont talk while in round mod!',
    notgroupadmin : 'You are not admin in this grup\nYou cant do that!',
    ongoingdrop : 'Round is dropping mod\nYou cant start again!',
    ongoinglike : 'Round is like mod\nYou cant start again!',
    somethinghappen : 'Bot cant do that now\nPlease contact my master => @arkns, @neskirimli !!'
}



// Botadmin lerin array e atanması ... 
dbbotadmins.once('value', function(snap) {
    let rbotadmins = snap.val();
    let items = Object.keys(rbotadmins);
    items.forEach(function(item) {
        botadmins.push({ userid : rbotadmins[item].userid, username : rbotadmins[item].username })
    });
    // console.log(botadmins); // Bot Adminlerin Gosterilmesi .. 
    // ****** botaminlerin indekslerinin bulunması ... eger -1 ise admin degil ... 
    // botadmins.map(function(d) { return d['username']; }).indexOf('neskirimli')
});




// ******************************************
// Sistem Fonksiyonlari 
// ******************************************
// Genel Kontrol Fonksiyonu 
var accessControl = function (controlobj) { // Komutların Calistirilabilir olup olmadiginin kontrolleri 
                                            // Kontrol edilecek her objenin json objesi olarak gonderilmesi gerekmektedir. 
                                            // Ornek { botadmin : msg.from.username, xxx : yyy } gibi 
    let output = new Object();
    let errdata = []; 

    if (util.isUndefined(controlobj)) { errdata.push ('control undefined') };

    // Bot Admin Kontrol Islemi ... 
    if (!util.isUndefined(controlobj.botadmin)) { 
        if(botadmins.map(function(d) { return d['username']; }).indexOf(controlobj.botadmin) == -1) { errdata.push(UnauthorizedMsg.msg1); } 
    };

    // ListId nin varlığının kontrolu  ... 
    if (!util.isUndefined(controlobj.groupindex)) { 
        if(groupdefinitions.map(function(d) { return d['listid']; }).indexOf(controlobj.groupindex) == -1) { errdata.push(GroupProcessMsg.noDeff); } 
    };

    // Grubun Aktif olup olmadiginin kontrolü   ... 
    if (!util.isUndefined(controlobj.groupisactive)) { 
        let groupindex = groupdefinitions.map(function(d) { return d['listid']; }).indexOf(controlobj.groupisactive);            
        if (groupindex!==-1) {
            if (groupdefinitions[groupindex].status!=='active') { errdata.push(GroupProcessMsg.notActive) }
        }
    };

    // Grubun Silent olup olmadiginin kontrolü   ... 
    if (!util.isUndefined(controlobj.groupissilent)) { 
        let groupindex = groupdefinitions.map(function(d) { return d['listid']; }).indexOf(controlobj.groupissilent);            
        if (groupindex!==-1) {
            if (groupdefinitions[groupindex].status=='silent') { errdata.push(GroupProcessMsg.notActive) }
        }
    };

    // ChatId aracılığı type ın private sorgulanması   ... 
    if (!util.isUndefined(controlobj.chattypeisprivate)) { 
        let chatindex = groupdefinitions.map(function(d) { return d['chatid']; }).indexOf(controlobj.chattypeisprivate.toString()); 
        if (chatindex!==-1) { 
            if (groupdefinitions[chatindex].type!=='private') { errdata.push(GroupProcessMsg.notPrivate); } 
        } else { errdata.push('ChatID bulunamadi')}
    };

    // Sonucların hazırlanıp geri dönülmesi  ... 
    if (errdata.length>=1) { output['result'] = 'No'; output['data'] = errdata; } else { output['result'] = 'Ok'; }
    return output;                
}

// Round Status Kontrol Fonksiyonu 
var statusControl = function (controlobj) { // Grup Round statusunun degerinin dönme  
                                            // Status = 0; No Round 
                                            // Status = 1; Drop Mod 
                                            // Status = 2; Like Mod
                                            // Status = 3; Analyse Mod 
    let output = roundgroupstatus.find(function(item) { return item.listid === controlobj});
    //console.log(output);
    if (util.isNullOrUndefined(output)) { return -1 } else { return output.status; } 
}

// Grup Status Kontrol Fonksiyonu 
var issilentcontrol = function (controlobj) { // Grubun calisma statusunun Silent olup olmadigi .. 

    let output = groupdefinitions.find(function(item) { return item.listid === controlobj});
    //console.log(output);
    if (util.isNullOrUndefined(output)) { return true; // Listeye dair birsey bulamazsa da true donsun .. 
    } else { 
        if (output.status=='active') { return true; } else { return false; } 
    } 
    //return output.status; 
}

// Grup Admin  Kontrol Fonksiyonu 
var isgroupadmincontrol = function (controlobj, username) { // Istekte bulunan grup admin mi kontrolu ... 

    let adminlist = roundgroupadmins[controlobj];
    let output;
    if (util.isNullOrUndefined(adminlist)) {} else {
    output = adminlist.find(function(item) { return item.groupadmin === username}); }
    //console.log(output);
    if (util.isNullOrUndefined(output)) { return false; // Listeye dair birsey bulamazsa da true donsun .. 
    } else { 
        if (output.groupadmin==username) { return true; } else { return false; } 
    } 
    //return output.status; 
}

// Grup Private Kontrol Fonksiyonu 
var isprivatecontrol = function (controlobj) { // Grubun private olup olmadigi .. 

    let output = groupdefinitions.find(function(item) { return item.chatid === controlobj});
    //console.log(output);
    if (util.isNullOrUndefined(output)) { return false; // Listeye dair birsey bulamazsa da false donsun .. 
    } else { 
        if (output.type=='private') { 
            return output.type; 
        } else { return false; } 
    } 
    //return output.status; 
}

// Tanımlı Round grupların array e atanması ... 
function getgroupdefinition() { // Db'de bulunan tüm round grouplarının tanımlarının cekilmesi ... 
    groupdefinitions = []; 
    dbroundgroups.once('value', function(snap) {
        let rgroupdefinitions = snap.val();
        if (util.isNull(rgroupdefinitions)) {} else {
            let items = Object.keys(rgroupdefinitions);
            items.forEach(function(item) {
                if (groupdefinitions.map(function(d) { return d['listid']; }).indexOf(rgroupdefinitions[item].listid)==-1) {
                    groupdefinitions.push({ chatid : rgroupdefinitions[item].chatid, 
                                            listid : rgroupdefinitions[item].listid,
                                            title : rgroupdefinitions[item].title,
                                            status : rgroupdefinitions[item].status,
                                            type :  rgroupdefinitions[item].type })
                }
            });
        }
    });
        // console.log(groupdefinitions); // Bot grouplarının Gosterilmesi .. 
        // ****** Bot groupları içerisinde ilgili listenin bulunması  ... eger -1 ise admin degil ... 
        // groupdefinitions.map(function(d) { return d['listid']; }).indexOf('list_xxxx')
}; getgroupdefinition();

// Tanımlı Round grupların array e atanması ... 
function getgrouptimes() { // Db'de bulunan tüm round grouplarının tanımlarının cekilmesi ... 
    grouptimes = []; 
    dbroundtimes.once('value', function(snap) {
        let rroundtimes = snap.val();
        if (util.isNull(rroundtimes)) {} else {
            let items = Object.keys(rroundtimes);
            roundgrouptimes = new Object();
            items.forEach(function(item) {
                let rroundtimesdetail = rroundtimes[item].roundtime;
                let itemsdetail = Object.keys(rroundtimesdetail);
                roundgrouptimes[rroundtimes[item].listid] = rroundtimes[item].roundtime
            });
        }
    });
        // console.log(roundgrouptimes); // listelerin time bilgilerinin Gosterilmesi .. 
        // ****** Bot groupları içerisinde ilgili listenin bulunması  ... eger -1 ise admin degil ... 
        // groupdefinitions.map(function(d) { return d['listid']; }).indexOf('list_xxxx')
}; getgrouptimes();

// Tanımlı Round grupların array e atanması ... 
function getgrouproundmessages() { // Db'de bulunan tüm round grouplarının tanımlarının cekilmesi ... 
    roundgroupmsg = []; 
    dbroundmessages.once('value', function(snap) {
        let rroundmessages = snap.val();
        if (util.isNull(rroundmessages)) {} else {
            let items = Object.keys(rroundmessages);
            items.forEach(function(item) {
                if (roundgroupmsg.map(function(d) { return d['listid']; }).indexOf(rroundmessages[item].listid)==-1) {
                    roundgroupmsg.push({ listid : rroundmessages[item].listid, 
                                        roundbeready : rroundmessages[item].roundbeready,
                                        roundclose : rroundmessages[item].roundclose,
                                        roundrelease : rroundmessages[item].roundrelease,
                                        roundstart :  rroundmessages[item].roundstart,
                                        usersnotdone :  rroundmessages[item].usersnotdone })
                }
            });
        }
    });
        // console.log(roundgroupmsg); // Bot grouplarının Gosterilmesi .. 
        // ****** Bot groupları içerisinde ilgili listenin bulunması  ... eger -1 ise admin degil ... 
        // roundgroupmsg.map(function(d) { return d['listid']; }).indexOf('list_xxxx')
}; getgrouproundmessages();

// Tanımlı Round grupların array e atanması ... 
function getgrouproundstatus() { // Db'de bulunan tüm round grouplarının tanımlarının cekilmesi ... 
    roundgroupstatus = []; 
    dbroundstatus.once('value', function(snap) {
        let rroundstatus = snap.val();
        if (util.isNull(rroundstatus)) {} else {
            let items = Object.keys(rroundstatus);
            items.forEach(function(item) {
                if (roundgroupstatus.map(function(d) { return d['listid']; }).indexOf(rroundstatus[item].listid)==-1) {
                    roundgroupstatus.push({ listid : rroundstatus[item].listid, 
                                            status : rroundstatus[item].status });
                };
            });
        };
    });
        // console.log(roundgroupstatus); // Bot grouplarının Gosterilmesi .. 
        // ****** Bot groupları içerisinde ilgili listenin bulunması  ... eger -1 ise admin degil ... 
        // roundgroupstatus.map(function(d) { return d['listid']; }).indexOf('list_xxxx')
}; getgrouproundstatus();

// Tanımlı Round gruplarının bot adminlerinin tespit edilmesi  ... 
function getgroupadmins(chatid) {
    if (isprivatecontrol(chatid)!=='private') { 
        bot.getAdmins(chatid).then(data => {
            let rroundadmins = [];
            for(var i=0; i<data.result.length; i+=1){
                // console.log(data.result[i].user.username + ' ' + data.result[i].status)
                rroundadmins.push({ groupadmin: data.result[i].user.username})
            }
            roundgroupadmins[chatid] = rroundadmins;
            console.log(roundgroupadmins);
        });
    }
}

// Mesajların Sirali Gonderilebilmesi için gönderme komutu 
function sendmsg(chatId, allmessages) {
    return Promise.mapSeries(allmessages, function(partialmessage) {
        return bot.sendMessage(chatId,partialmessage);
    });
};

// Round Grubunun Round statüsünün degistirilmesi ... 
var changegroupstatus = function (chnlistid, chnstatus) { // Grup Round statusunun degerinin degistirme  
                                            // Status = 0; No Round 
                                            // Status = 1; Drop Mod 
                                            // Status = 2; Like Mod
                                            // Status = 3; Analyse Mod 
    let updated = 0;
        dbroundstatus.once('value', function(snap) {
        let rroundstatus = snap.val();
        if (util.isNull(rroundstatus)) {} else {
            let items = Object.keys(rroundstatus);
            items.forEach(function(item) {
                if (rroundstatus[item].listid==chnlistid.toString()) {
                    let dbstatusitem = dbroundstatus.child(item); 
                    dbstatusitem.update({ status : chnstatus})
                    //dbroundstatus.child(item).child('status').update(chnstatus);
                    console.log('Status Updated');
                    updated = 1;
                }
            });
        };
    }); 
    if (updated==1) { return updated; } else { return false; }
}




// ******************************************
// Db connection Bolumleri .. Db de takip edilen child için event triger baglantilari 
// ******************************************
dbroundgroups.on('value', function(snap) { // Group tanımlarında değişiklik olduğunda güncelleme yapılması (getgroupdefinition) ların 
    // Db den bir kayıt silindiğinde fullliste array içerisinde güncellenmesi.  
    // listegoster ilgili chat grubuna ait kayıtların tüm kod icerisinde kullanilabilmesi için olusturulan degisken. 
    getgroupdefinition();
    console.log(groupdefinitions);
    for(var i=0; i<groupdefinitions.length; i+=1){ // Participantların izlenecegi Bolumun Calistirilmasi ... 
        // console.log(groupdefinitions[i].listid)
        dbKontrol(groupdefinitions[i].listid);
        getgroupadmins(groupdefinitions[i].chatid)
    }
}); 

dbroundtimes.on('value', function(snap) { // Round ların zaman planı değişiklik olduğunda güncelleme yapılması (roundgrouptimes) ların 
    // Db den bir kayıt silindiğinde fullliste array içerisinde güncellenmesi.  
    // listegoster ilgili chat grubuna ait kayıtların tüm kod icerisinde kullanilabilmesi için olusturulan degisken. 
    getgrouptimes();
    console.log(roundgrouptimes);
}); 

dbroundmessages.on('value', function(snap) { // Round ların zaman planı değişiklik olduğunda güncelleme yapılması (roundgroupmsg) ların 
    // Db den bir kayıt silindiğinde fullliste array içerisinde güncellenmesi.  
    // listegoster ilgili chat grubuna ait kayıtların tüm kod icerisinde kullanilabilmesi için olusturulan degisken. 
    getgrouproundmessages();
    console.log(roundgroupmsg);
}); 

dbroundstatus.on('value', function(snap) { // Round gruplarının status durumlarında degisiklik oldugunda güncelleme yapılması (roundgroupstatus) ların 
    // Db den bir kayıt silindiğinde fullliste array içerisinde güncellenmesi.  
    // listegoster ilgili chat grubuna ait kayıtların tüm kod icerisinde kullanilabilmesi için olusturulan degisken. 
    getgrouproundstatus();
    console.log(roundgroupstatus);
}); 



// ******************************************
// Bot Admin Commands 
// ******************************************
    bot.on('/getadmincommands', msg => { // Round Sensei admin komutlari listesi ...
        usecontrol =[]; usecontrol = accessControl({ botadmin : msg.from.username, chattypeisprivate : msg.chat.id })
        if(usecontrol.result == 'Ok') { 
            let botcommandlist = 'RoundSensei Bot Commands\n'
            botcommandlist += 'Admin Command List > /getadmincommands \n'
            botcommandlist += 'Add/Update Group info > /senseigrouplink \n (This command must be run in own group and than turn back to RoundSensei bot chat)'
            botcommandlist += 'Get Round group List and description Group info > /getsenseigroups \n'
            botcommandlist += 'Set Round time planing for group > /setroundtimes list_xxxx\n'
            botcommandlist += 'Get Round ime planing for group > /getroundtimes list_xxxx \n'

            bot.sendMessage(msg.chat.id, botcommandlist)   
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }                  
    });
        
    bot.on('/senseigrouplink', msg => { // İlgili Chat grubu bilgilerini bot admine gönderme ... 
        usecontrol =[]; usecontrol = accessControl({ botadmin : msg.from.username})
        if(usecontrol.result == 'Ok') { 
            return bot.sendMessage(msg.chat.id, 'Hello my master! \nThe creating message has sended. ').then(re => {
                //Chat grubunun bilgilerini cekme ve ilgili bot admine iletme .. .
                bot.getChat(msg.chat.id).then(data => {
                    creategroupobj['chatid'] = data.result.id.toString();
                    creategroupobj['listid'] = 'list_'+data.result.id.toString().replace(/-|\s/g,'');
                    if (data.result.type =='private') 
                    {
                        creategroupobj['title'] = data.result.username;
                        bot.sendMessage(msg.from.id, 'This messages sending for creating new group.\nChat ID : ' + data.result.id + '\nGroup Title : ' + data.result.username + '\nYou can choose types of group for registering.').then(te => {
                            let markup = bot.inlineKeyboard([
                            [
                                bot.inlineButton('Private', { callback: 'grouptype, private' })
                            ]
                            ]);
                            return bot.sendMessage(msg.from.id, `Group Title : ${ msg.text }\nWhat is group type?`, { markup });
                        })
                    } 
                    else 
                    { 
                        creategroupobj['title'] = data.result.title.toString(); 
                        bot.sendMessage(msg.from.id, 'This messages sending for creating new group.\nChat ID : ' + data.result.id + '\nGroup Title : ' + data.result.title + '\nYou can choose types of group for registering.').then(te => {
                            let markup = bot.inlineKeyboard([
                            [
                                bot.inlineButton('Chat', { callback: 'grouptype, chat' }),
                                bot.inlineButton('Round', { callback: 'grouptype, round' })
                            ]
                            ]);
                            return bot.sendMessage(msg.from.id, `Group Title : ${ msg.text }\nWhat is group type?`, { markup });
                        })
                    }
                });
            });
        } else {
            bot.sendMessage(msg.chat.id, usecontrol.data)
        }
    });

    bot.on('callbackQuery', msg => { // Return inlinequerry groupType And Ask Status 
        let indata = msg.data.split(", ");
        if (indata[0]=='grouptype') { 
            creategroupobj['type'] = indata[1];

            let markup = bot.inlineKeyboard([
            [
                bot.inlineButton('Active', { callback: 'groupstatus, active' }),
                bot.inlineButton('Pasive', { callback: 'groupstatus, pasive' }),
                bot.inlineButton('Silent', { callback: 'groupstatus, silent' })
            ]
            ]);
            return bot.sendMessage(msg.from.id, `Group Type : ${ indata[1] }\nWhat is group status?`, { markup });
        }
    }); 

    bot.on('callbackQuery', msg => { // Return inlinequerry groupstatus And Save group definition 
        let indata = msg.data.split(", ");
        if (indata[0]=='groupstatus') { 
            creategroupobj['status'] = indata[1];
            savegroupdefinition(creategroupobj);
            savegroupstatus({ listid : creategroupobj['listid'], status: '0' });
            return bot.sendMessage(msg.from.id, `Group Created!\nPlease Continue to set time planning with /setroundtimes ${ creategroupobj.listid }`);
       }
    }); 

    function savegroupdefinition(groupdesc) { // Grup tanımlarının Db'ye atilmasi veya güncellenmesi ... 

        let updated = 0;
        dbroundgroups.once('value', function(snap) {
            let rroundgroups = snap.val();
            if (util.isNull(rroundgroups)) {} else {
            let items = Object.keys(rroundgroups);
            items.forEach(function(item) {
                console.log(rroundgroups[item])
                if (rroundgroups[item].chatid == groupdesc.chatid) {
                    updated=1; 
                    dbroundgroups.child(item).update(groupdesc);
                }
            });}
                if (updated==0) { dbroundgroups.push(groupdesc) }
        });
    }

    function savegroupstatus(groupstat) { // Grup status tanımının Db'ye atilmasi veya güncellenmesi ... 

        let updated = 0;
        dbroundstatus.once('value', function(snap) {
            let rroundstatus = snap.val();
            if (util.isNull(rroundstatus)) {} else {
            let items = Object.keys(rroundstatus);
            items.forEach(function(item) {
                console.log(rroundstatus[item])
                if (rroundstatus[item].listid == groupstat.listid) {
                    updated=1; 
                    dbroundstatus.child(item).update(groupstat);
                }
            });}
                if (updated==0) { dbroundstatus.push(groupstat) }
        });
    }

    bot.on('/getsenseigroups', msg => { // Round Sensei nin yönettiği grup listesinin çekilmesi 
        usecontrol =[]; usecontrol = accessControl({ botadmin : msg.from.username, chattypeisprivate : msg.chat.id })
        if(usecontrol.result == 'Ok') { 
            dbroundgroups.once('value', function(snap) {
                let rroundgroups = snap.val();
                if (util.isNull(rroundgroups)) { bot.sendMessage(msg.chat.id, GroupProcessMsg.noGroup) } else {
                let items = Object.keys(rroundgroups);
                items.forEach(function(item) {
                    //console.log(rroundgroups[item]);
                    let parse = 'html'
                    bot.sendMessage(msg.chat.id, 'Title : ' + rroundgroups[item].title + '\nChatId : ' + rroundgroups[item].chatid + '\nListId : <b>' + rroundgroups[item].listid + '</b>\nStatus : ' + rroundgroups[item].status + '\nType : ' + rroundgroups[item].type, { parse })
                });}
            });
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }        
    });

    bot.on('/setroundtimes', msg => { // İlgili chat grubu için round timeların cekilmesi ve set edilmesi ... 
        settimelistid = msg.text.replace('/setroundtimes ','');
        setbeforemin = 0; 
        setroundtime = [];
        setroundtimeshow = [];
        usecontrol =[]; usecontrol = accessControl({ botadmin : msg.from.username, 
                                                    groupindex : settimelistid, 
                                                    groupisactive : settimelistid, 
                                                    chattypeisprivate : msg.chat.id.toString()})
        if(usecontrol.result == 'Ok') {
            // Ask drop before round time
            return bot.sendMessage(msg.chat.id, 'Set How much min to start dropping acount before round time', { ask: 'beforeround' });
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }    
    });

    bot.on('ask.beforeround', msg => { // Round grubunda dropların kac dakika once baslayacagi ... 
    
        // If incorrect min, ask again
        if (!Number(msg.text)) {
            return bot.sendMessage(msg.chat.id, 'Incorrect min. Please, try again!', { ask: 'beforeround' });
        } else {
            if (Number(msg.text)>=10 && Number(msg.text)<=40) {
                
                setbeforemin = msg.text; 
                // İlk Time Girişi 
                if (setroundtimeshow.length==0) {
                    let markup = bot.inlineKeyboard([
                        [
                            bot.inlineButton('Add New Time', { callback: 'addtime, addtime' })
                        ]
                        ]);
                        return bot.sendMessage(msg.from.id, `Add New Round Time for : ${ settimelistid }\nTime format must be HH:mm`, { markup });
                } else { // Sonraki Zaman Girişleri 
                    let markup = bot.inlineKeyboard([
                        [
                            bot.inlineButton('Add New Time', { callback: 'addtime, addtime' }),
                            bot.inlineButton('Save Times', { callback: 'savetime, savetime' })
                        ]
                        ]);
                        return bot.sendMessage(msg.from.id, `Do you want to Add New Round Time for : ${ settimelistid }\nTime format must be HH:mm`, { markup });
                }
            } else {
                return bot.sendMessage(msg.chat.id, 'Time must be set between >10 and <40!', { ask: 'beforeround' });
            }
        }
    
    });

    bot.on('callbackQuery', msg => { // Yeni Round Saati tanımlama cagirisinin gonderilmesi ... 
        let indata = msg.data.split(", ");
        if (indata[0]=='addtime') { 
            // Ask drop before round time
            return bot.sendMessage(msg.from.id, 'Insert time info for round ', { ask: 'roundtime' });
       }
    }); 

    bot.on('ask.roundtime', msg => { // Round saati bilgisinin alınıp arraya işlenmesi ve yeni saat varmı diye sorulması ... 

        // Time Girişine devam 
        setroundtime.push({ roundtime : msg.text, beforetime : setbeforemin });
        setroundtimeshow.push(msg.text);
        //console.log(setroundtime);
        sendmsg(msg.from.id, setroundtimeshow).then(re => {
            let markup = bot.inlineKeyboard([
                [
                    bot.inlineButton('Add New Time', { callback: 'addtime, addtime' }),
                    bot.inlineButton('Save Times', { callback: 'savetime, savetime' })
                ]
                ]);
                return bot.sendMessage(msg.from.id, `Do you want to Add New Round Time for : ${ settimelistid }\nTime format must be HH:mm`, { markup });
        });
    });

    bot.on('callbackQuery', msg => { // Round Saat bilgilerinin tamamlanması ve Kaydedilmesi cagirisinin islenmesi ... 
        let indata = msg.data.split(", ");
        if (indata[0]=='savetime') { 
            savegrouptime(settimelistid, setroundtime);
            return bot.sendMessage(msg.from.id, `Group round times saved!\nPlease Continue to set round chat message strings with /setroundmessages ${ settimelistid }`);
       }
    }); 

    function savegrouptime(grouplistid, grouptimes) { // Grup round zaman tanımlarının Db'ye atilmasi veya güncellenmesi ... 

        let updated = 0;
        dbroundtimes.once('value', function(snap) {
            let rroundtimes = snap.val();
            if (util.isNull(rroundtimes)) {} else {
            let items = Object.keys(rroundtimes);
            items.forEach(function(item) {
                //console.log(rroundtimes[item])
                if (rroundtimes[item].listid == grouplistid) {
                    updated=1; 
                    dbroundtimes.child(item).update({ listid : grouplistid, roundtime : grouptimes});
                }
            });}
                if (updated==0) { dbroundtimes.push({ listid : grouplistid, roundtime : grouptimes}) }
        });
    }

    bot.on('/getroundtimes', msg => { // İlgili grubun Round saatlerinin dönülmesi ...
        usecontrol =[]; usecontrol = accessControl({ botadmin : msg.from.username, chattypeisprivate : msg.chat.id })
        if(usecontrol.result == 'Ok') { 
            if(util.isNullOrUndefined(roundgrouptimes[msg.text.replace('/getroundtimes ','')])) { bot.sendMessage(msg.chat.id, 'Wrong Listid! Please check and try again.')} 
            else {
                let listtimes = ''
                let listarrtimes = roundgrouptimes[msg.text.replace('/getroundtimes ','')]
                let items = Object.keys(listarrtimes);
                items.forEach(function(item) {
                    listtimes += listarrtimes[item].roundtime + '\n'
                });
                   bot.sendMessage(msg.chat.id, 'Round times for => ' + msg.text.replace('/getroundtimes ','') + '\n' + listtimes);  
            }
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }        
    });

    bot.on('/setroundmessages', msg => { // İlgili chat grubu round mesajlarinin kaydedilmesi ... 
        setmsglistid = msg.text.replace('/setroundmessages ','');
        setbeforemin = 0; 
        setroundmsg = new Object();
        setroundmsg['listid'] = setmsglistid;
        setroundmsgshow = [];
        usecontrol =[]; usecontrol = accessControl({ botadmin : msg.from.username, 
                                                    groupindex : setmsglistid, 
                                                    groupisactive : setmsglistid, 
                                                    chattypeisprivate : msg.chat.id.toString()})
        if(usecontrol.result == 'Ok') {
            // Ask be ready for round message
            return bot.sendMessage(msg.chat.id, 'Message for be ready for round. \nExample : \n----------\nRound at:00\n Be Ready to drop @ : 40!!', { ask: 'roundbeready' });
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }    
    });

    bot.on('ask.roundbeready', msg => { // Be Ready için kaydedilecek mesasjın gelişi ... 
    
        // Mesaj Girişi kayıt 
        setroundmsg['roundbeready'] = msg.text;
        setroundmsgshow.push('roundbeready => ' + msg.text);

        // Ask round start message
        return bot.sendMessage(msg.chat.id, 'Message for Round Start \nExample : \n----------\nDrop @s Round Started!!', { ask: 'roundstart' });
    });

    bot.on('ask.roundstart', msg => { // Be Ready için kaydedilecek mesasjın gelişi ... 
    
        // Mesaj Girişi kayıt 
        setroundmsg['roundstart'] = msg.text;
        setroundmsgshow.push('roundstart => ' + msg.text);

        // Ask round release message
        return bot.sendMessage(msg.chat.id, 'Message for Round Release and start like \nExample : \n----------\nLike & Comment Recent\nCWD @\nGO!!', { ask: 'roundrelease' });
    });

    bot.on('ask.roundrelease', msg => { // Round Release için kaydedilecek mesasjın gelişi ... 
    
        // Mesaj Girişi kayıt 
        setroundmsg['roundrelease'] = msg.text;
        setroundmsgshow.push('roundrelease => ' + msg.text);

        // Ask round release message
        return bot.sendMessage(msg.chat.id, 'Message for Users Not Done \nExample : \n----------\nUsers NOT Done!!', { ask: 'usersnotdone' });
    });

    bot.on('ask.usersnotdone', msg => { // Users Not Done için kaydedilecek mesasjın gelişi ... 
    
        // Mesaj Girişi kayıt 
        setroundmsg['usersnotdone'] = msg.text;
        setroundmsgshow.push('usersnotdone => ' + msg.text);

        // Ask round release message
        return bot.sendMessage(msg.chat.id, 'Message for Users Not Done \nExample : \n----------\nRound Close\nWell Done!!', { ask: 'roundclose' });
    });

    bot.on('ask.roundclose', msg => { // Round Close için kaydedilecek mesasjın gelişi ... 
    
        // Mesaj Girişi kayıt 
        setroundmsg['roundclose'] = msg.text;
        setroundmsgshow.push('roundclose => ' + msg.text);
        setroundmsgshow.push('All Messages Saved');

        // Ask round release message
        console.log(setroundmsg);
        savegroupmessages(setmsglistid, setroundmsg)
        return sendmsg(msg.chat.id, setroundmsgshow);
    });

    function savegroupmessages(grouplistid, groupmessages) { // Round grubu için Mesajların kaydedilmesi ... 

        let updated = 0;
        dbroundmessages.once('value', function(snap) {
            let rroundmessages = snap.val();
            if (util.isNull(rroundmessages)) {} else {
            let items = Object.keys(rroundmessages);
            items.forEach(function(item) {
                //console.log(rroundtimes[item])
                if (rroundmessages[item].listid == grouplistid) {
                    updated=1; 
                    dbroundmessages.child(item).update(groupmessages);
                }
            });}
                if (updated==0) { dbroundmessages.push(groupmessages) }
        });
    }

    bot.on('/getroundmessages', msg => { // İlgili Round grubunun mesaj listesinin çekilmesi 
        usecontrol =[]; usecontrol = accessControl({ botadmin : msg.from.username, chattypeisprivate : msg.chat.id })
        if(usecontrol.result == 'Ok') { 

        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }        
    });









// ******************************************
// Round Group Commands 
// ******************************************
    // Manuel Start Round 
    bot.on('/startround', msg => { // İlgili Grupta Round baslatilmasi ... 
        let listReferenceid = 'list_'+msg.chat.id.toString().replace(/-|\s/g,''); 
        usecontrol =[]; usecontrol = accessControl({ groupindex : listReferenceid, groupisactive : listReferenceid }) // Bu grupta Calisabilirmi ve grup aktif mi?
        if(usecontrol.result == 'Ok') { 
            if (isgroupadmincontrol(msg.chat.id, msg.from.username)) { 
                if (statusControl(listReferenceid)==0) { // Round Baslatilabilir .. 
                    if(changegroupstatus(listReferenceid, 1)) { 
                        bot.sendMessage(msg.chat.id, 'Started ') // Drop Mesajı Cekilip Eklenecek ... 
                    } else { 
                        bot.sendMessage(msg.chat.id, RoundProcessMsg.somethinghappen)
                    }
                }
                else if (statusControl(listReferenceid)==1) { // Zaten Round Mevcut ... 
                    bot.sendMessage(msg.chat.id, RoundProcessMsg.ongoingdrop)
                }
                else if (statusControl(listReferenceid)==2) { // Round Like Modunda  ... 
                    bot.sendMessage(msg.chat.id, RoundProcessMsg.ongoinglike)
                }
            } else {
                bot.sendMessage(msg.chat.id, RoundProcessMsg.notgroupadmin)
            }      
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }        
    });

    // Round Dropların gosterilmesi ve Like Modu na Geçiş 
    bot.on('/show', msg => { // İlgili Grupta Round baslatilmasi ... 
        let listReferenceid = 'list_'+msg.chat.id.toString().replace(/-|\s/g,''); 
        usecontrol =[]; usecontrol = accessControl({ groupindex : listReferenceid, groupisactive : listReferenceid }) // Bu grupta Calisabilirmi ve grup aktif mi?
        if(usecontrol.result == 'Ok') { 
            if (isgroupadmincontrol(msg.chat.id, msg.from.username)) { 

            // Yapılacaklar 

            } else {
                bot.sendMessage(msg.chat.id, RoundProcessMsg.notgroupadmin)
            }      
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }        
    });

    // Round Like Durumunun Check edilmesi .. 
    bot.on('/check', msg => { // İlgili Grubun check edilmesi ... 
        let listReferenceid = 'list_'+msg.chat.id.toString().replace(/-|\s/g,''); 
        usecontrol =[]; usecontrol = accessControl({ groupindex : listReferenceid, groupisactive : listReferenceid }) // Bu grupta Calisabilirmi ve grup aktif mi?
        if(usecontrol.result == 'Ok') { 
            if (isgroupadmincontrol(msg.chat.id, msg.from.username)) { 

            // Yapılacaklar 

            } else {
                bot.sendMessage(msg.chat.id, RoundProcessMsg.notgroupadmin)
            }      
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }        
    });

    // Round dan eleman cikartilmasi .. 
    bot.on('/remove', msg => { // listeden eleman cikartma ... 
        let listReferenceid = 'list_'+msg.chat.id.toString().replace(/-|\s/g,''); 
        usecontrol =[]; usecontrol = accessControl({ groupindex : listReferenceid, groupisactive : listReferenceid }) // Bu grupta Calisabilirmi ve grup aktif mi?
        if(usecontrol.result == 'Ok') { 
            if (isgroupadmincontrol(msg.chat.id, msg.from.username)) { 

            // Yapılacaklar 

            } else {
                bot.sendMessage(msg.chat.id, RoundProcessMsg.notgroupadmin)
            }      
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }        
    });

    // İlgili Grubun Round saat listesinin donulmesi 
    bot.on('/rounds', msg => { // Round Saat Listesi  ... 
        let listReferenceid = 'list_'+msg.chat.id.toString().replace(/-|\s/g,''); 
        usecontrol =[]; usecontrol = accessControl({ groupindex : listReferenceid, groupisactive : listReferenceid }) // Bu grupta Calisabilirmi ve grup aktif mi?
        if(usecontrol.result == 'Ok') { 
            if (isgroupadmincontrol(msg.chat.id, msg.from.username)) { 

            // Yapılacaklar 

            } else {
                bot.sendMessage(msg.chat.id, RoundProcessMsg.notgroupadmin)
            }      
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }        
    });

    // Gruptaki sonraki round saatine ne kadar kaldırıgının dönülmesi .. 
    bot.on('/nextround', msg => { // rounda ne kadar kaldı  ... 
        let listReferenceid = 'list_'+msg.chat.id.toString().replace(/-|\s/g,''); 
        usecontrol =[]; usecontrol = accessControl({ groupindex : listReferenceid, groupisactive : listReferenceid }) // Bu grupta Calisabilirmi ve grup aktif mi?
        if(usecontrol.result == 'Ok') { 
            if (isgroupadmincontrol(msg.chat.id, msg.from.username)) { 

            // Yapılacaklar 

            } else {
                bot.sendMessage(msg.chat.id, RoundProcessMsg.notgroupadmin)
            }      
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }        
    });

    // Round Sensei Help Mesajı ... 
    bot.on('/help', msg => { // rounda ne kadar kaldı  ... 
        let listReferenceid = 'list_'+msg.chat.id.toString().replace(/-|\s/g,''); 
        usecontrol =[]; usecontrol = accessControl({ groupindex : listReferenceid, groupisactive : listReferenceid }) // Bu grupta Calisabilirmi ve grup aktif mi?
        if(usecontrol.result == 'Ok') { 
            if (isgroupadmincontrol(msg.chat.id, msg.from.username)) { 

            // Yapılacaklar 

            } else {
                bot.sendMessage(msg.chat.id, RoundProcessMsg.notgroupadmin)
            }      
        } else {
            sendmsg(msg.chat.id, usecontrol.data)
        }        
    });

    // Gelen Mesajın ilk harifne gore davranma .. 
    bot.on('text', msg => {

        let listReferenceid = 'list_'+msg.chat.id.toString().replace(/-|\s/g,''); 
        let reply = msg.message_id;

            // Eleman Ekleme .. 
            if(msg.text.indexOf('@') == 0) {
                if (listegoster[listReferenceid].map(function(d) { return d['dropped']; }).indexOf(msg.text)==-1) {
                addparticipant(msg.chat.id, msg.from.username, msg.text, msg.text)
                } else {
                    girenid = listegoster[listReferenceid].map(function(d) { return d['dropped']; }).indexOf(msg.text)
                    bot.sendMessage(msg.chat.id, 'Dropped Account Added before! by ' , { reply })
                }

            }
            // Eleman Ekleme .. 
            if(msg.text.indexOf('D') == 0) {
                if (listegoster[listReferenceid].map(function(d) { return d['dropped']; }).indexOf(msg.text)==-1) {
                addparticipant(msg.chat.id, msg.from.username, msg.text, msg.text)
                } else {
                    girenid = listegoster[listReferenceid].map(function(d) { return d['dropped']; }).indexOf(msg.text)
                    bot.sendMessage(msg.chat.id, 'Dropped Account Added before! by ' , { reply })
            }

        }

    });


// ******** 
// Devam 
  function addparticipant(chatid, username, participant, liker) {
        
        let listReferenceid = 'list_'+chatid.toString().replace(/-|\s/g,'');

        let dropmessage = { username: username, dropped: participant, liker: liker};
        dbparticipants.child(listReferenceid).push(dropmessage);
        console.log('added - ' + dropmessage);
        console.log(listegoster[listReferenceid])

  }


function dbKontrol(listid) {

    let fullliste = []; 

    dbparticipants.child(listid).on('child_added', function(snap) {
        // Db ye yeni bir kayıt eklendiginde fullliste array içerisine eklenmesi. 
        // listegoster ilgili chat grubuna ait kayıtların tüm kod icerisinde kullanilabilmesi için olusturulan degisken. 

        let liste = snap.val();
        fullliste.push(liste);
        listegoster[listid] = fullliste;

    });

    dbparticipants.child(listid).on('child_removed', function(snap) {
        // Db den bir kayıt silindiğinde fullliste array içerisinde güncellenmesi.  
        // listegoster ilgili chat grubuna ait kayıtların tüm kod icerisinde kullanilabilmesi için olusturulan degisken. 
    
        fullliste = fullliste.filter(function(el){ return el.dropped != snap.val().dropped});
        listegoster[listid] = fullliste;

    });
};
