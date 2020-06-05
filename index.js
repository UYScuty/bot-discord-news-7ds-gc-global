const got = require('got');
const Discord = require('discord.js');
const client = new Discord.Client();
const he = require('he');
const fs = require('fs');
var recent = "";
var iterateur = 1;
const prefix = '&';
const token = process.env.DISCORD_API_TOKEN;

//Toutes les actions à faire quand le bot se connecte
async function help(message) {
    const msgEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Voici mes commandes')
    .setDescription('!! Attention les commandes si dessous sont utilisables seulement si vous êtes administateur du serveur !!')
    .addFields(
		{ name: 'enregistrer un channel', value: (prefix + 'init_news'), inline: true },
		{ name: 'oublier un channel', value: (prefix + 'suppr_news'), inline: true },
		{ name: 'montrer la dernière news', value: (prefix + 'last_news'), inline: true },
    )
    await message.channel.send(msgEmbed);
}

async function last_news(message) {
    var ts = Math.round((new Date()).getTime());
    console.log('test');
    const payload = await got(`https://forum.netmarble.com/api/game/nanagb/official/forum/7ds_en/article/list?rows=15&start=0&viewType=pv&menuSeq=27&_=${ts}`, JSON)
    var body = JSON.parse(payload.body)
    var firstarticle = body["articleList"][0]
    
    recent = firstarticle.id;                   //création des variabes du messages
    let title = he.decode(firstarticle.title);
    let description = firstarticle.content;
    description = description.replace(/\n/g, '');
    description = description.substring(0, 150);
    description = he.decode(description);
    let img = firstarticle.thumbnailUrl;

    const msgEmbed = new Discord.MessageEmbed()// création du message embed
	.setColor('#0099ff')
	.setTitle(title)
	.setURL('https://forum.netmarble.com/7ds_en/view/27/' + recent)
	.setDescription(description + "...")
    .setImage(img)

    await message.channel.send(msgEmbed);
}

async function suppr(message) {
    let curseur = await double_chall(message.channel.id);
    if (curseur === -1){
        message.channel.send("le channel n'est pas enregisté")
    }
    else {
        let data = fs.readFileSync("ddb.json");
        let ddb = JSON.parse(data);

        ddb.table.splice(curseur, 1);
        json = JSON.stringify(ddb);
        fs.writeFile('ddb.json', json, 'utf8', function(err, result) {
            if(err) console.log('error', err);
        });
    }
}

async function verif(message) {
    if (await double_chall(message.channel.id) === -1) {
        message.channel.send('ce channel a été enregistrer plus qu\'a attendre que des news sortes, Bon jeu a tous ! :)')
        add_chall(message);
    }
    else {
        message.channel.send('ce channel est deja enregistrer !')
    }
}

async function double_chall(idchannel){
    let data = fs.readFileSync("ddb.json");
    let ddb = JSON.parse(data);
    let curs_channel = ddb.table.length;
    curs_channel--;
    while (curs_channel >= 0)
    {
        console.log(ddb["table"][curs_channel].channel);
        if (ddb["table"][curs_channel].channel === idchannel){
            return(curs_channel);
        }
        curs_channel--;
    }
    return(-1);
}

async function add_chall(message){ //cette fonction ajoute un channel a la base de donnée 
    let data = fs.readFileSync("ddb.json");
    let ddb = JSON.parse(data);
    ddb.table.push({channel: message.channel.id});
    console.log(message.channel.id)
    json = JSON.stringify(ddb)
    fs.writeFile('ddb.json', json, 'utf8', function(err, result) {
        if(err) console.log('error', err);
    });
}

async function message_chall (recent, img, title, description) { //cette fonction envoie des embeds aux channels 

    let data = fs.readFileSync("ddb.json"); //recuperation du fichier ddb.json qui contients les channel enregistrer
    let ddb = JSON.parse(data);
    let curs_channel = ddb.table.length;
    const msgEmbed = new Discord.MessageEmbed()// création du message embed
	.setColor('#0099ff')
	.setTitle(title)
	.setURL('https://forum.netmarble.com/7ds_en/view/27/' + recent)
	.setDescription(description + "...")
    .setImage(img)
    
    curs_channel--;
    while (curs_channel >= 0)     // evoie a tout les channels enregistrés l'embed
    {
        console.log(ddb["table"][curs_channel].channel);
        await client.channels.cache.get(ddb["table"][curs_channel].channel).send(msgEmbed);
        curs_channel--;
    }
console.log('fin envoie message');
return(0);
}

client.on("ready", function () { //s'active quand le bot est pret
    console.log(`mon bot ${client.user} est pret`);
})
client.on('message', message => { //s'active si un message est ecris
    console.log(message.content);
    if (message.content === prefix + 'init_news') {
            if (message.member.hasPermission('ADMINISTRATOR') || message.member.id === '278202477986185217'){
                console.log('lancement verif')
                verif(message);
            }
        }
    else if (message.content === prefix + 'suppr_news') {
        if (message.member.hasPermission('ADMINISTRATOR') || message.member.id === '278202477986185217'){
            console.log('suppr_news')
            suppr(message);
        }
    }
    else if (message.content === prefix + 'go') {
        console.log(typeof message.member.id);
        if (message.member.id === '278202477986185217'){
            depart(recent, iterateur, client);
        }
    }
    else  if (message.content === prefix + 'last_news') {
        if (message.member.hasPermission('ADMINISTRATOR') || message.member.id === '278202477986185217'){
            last_news(message);
        }
    }
    else if (message.content === prefix + 'help') {
        help(message);
    }
});
async function depart (recent, iterateur, client) { //cette fonction verifie toutes les 10mns si une news est sortie

    var ts = Math.round((new Date()).getTime()); // ts = l'Heure Unix a 13 chiffres
    console.log('test');
    const payload = await got(`https://forum.netmarble.com/api/game/nanagb/official/forum/7ds_en/article/list?rows=15&start=0&viewType=pv&menuSeq=27&_=${ts}`, JSON)
    var body = JSON.parse(payload.body)
    var firstarticle = body["articleList"][0]
    if (firstarticle.id != recent) //la fonction passe dans ce "if" si il y a une nouvelle news
    {
        console.log('nouvelle news');
        console.log(firstarticle);
        let title = he.decode(firstarticle.title);             //création des variabes du messages
        recent = firstarticle.id;
        let description = firstarticle.content;
        description = description.replace(/\n/g, '');
        description = description.substring(0, 150);
        description = he.decode(description);
        let img = firstarticle.thumbnailUrl;
        await message_chall(recent, img, title, description) //fin création des variabes du messages
    }
    else {
        console.log('pas de recent news')
    }
    (function() {

        setTimeout(function()
        {  
            console.log("retry");
            let relance = depart(recent, iterateur, client);
        }, 600000);
    
    })();        
return(0);
}

client.login(token);
