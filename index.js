const got = require('got');
const Discord = require('discord.js');
var recent = "";
var iterateur = 1;
const client = new Discord.Client();
var sleep = require('sleep');
var he = require('he');

//Toutes les actions à faire quand le bot se connecte

async function depart (message, recent, iterateur) { 
    while (iterateur > 0) 
    {
        var ts = Math.round((new Date()).getTime());
        console.log('test');
        const payload = await got(`https://forum.netmarble.com/api/game/nanagb/official/forum/7ds_en/article/list?rows=15&start=0&viewType=pv&menuSeq=27&_=${ts}`, JSON)
        var body = JSON.parse(payload.body)
        var firstarticle = body["articleList"][0]
        if (firstarticle.id != recent) 
        {
            console.log('nouvelle news');
            console.log(firstarticle);
            let title = he.decode(firstarticle.title);
            recent = firstarticle.id;
            let description = firstarticle.content;
            description = description.replace(/\n/g, '');
            description = description.substring(0, 150);
            description = he.decode(description);
            let img = firstarticle.thumbnailUrl;
            await message_chall(recent, message, img, title, description);
            console.log('ok');
        }
        else {
            console.log('pas de recent news')
        }
        sleep.sleep(600);
    }
    return(0);
}
async function message_chall (recent, message, img, title, description) {
    const exampleEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle(title)
	.setURL('https://forum.netmarble.com/7ds_en/view/27/' + recent)
	.setDescription(description + "...")
	.setImage(img)
await message.channel.send(exampleEmbed);
console.log('fin envoie message');
return(0);
}
client.on("ready", function () {
    console.log(`mon bot ${client.user} est pret`);
})
client.on('message', message => {
    console.log(message.content);
    if (message.content === '-news') {
            message.channel.send('MISE EN MARCHE DU BOT')
            depart(message, recent, iterateur);
        }
});

client.login("token");
