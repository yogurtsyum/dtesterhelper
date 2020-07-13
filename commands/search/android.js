const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const Discord = require('discord.js');
module.exports = class AndroidCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'android',
            aliases: ['a'],
            group: 'search',
            memberName: 'android',
            description: 'Searches the Android bug reports board.',
            args: [
                {
                    key: 'query',
                    prompt: 'What would you like to search for?',
                    type: 'string'
                }
            ]
        });
    }

    async run (message, { query }) {
        if(message.reactions.cache.size !== 0) message.reactions.removeAll();
        let reaction = await message.react('731261108605681824');
        let cards = await fetch('https://api.trello.com/1/boards/Vqrkz3KO/cards');
        cards = await cards.json();
        let filteredCards = [];
        cards.forEach(async c => {
            if(c.name.startsWith(query) || c.name.includes(query) || c.name === query){
                filteredCards.push(c);
            }
        });
        await reaction.remove();
        if(filteredCards.length === 0){
            let embed = new Discord.MessageEmbed();
            embed.setDescription('Oops! No bugs found.');
            embed.setColor(message.client.colors.red);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            await message.react('727997516225708033');
            return message.embed(embed);
        }
        await message.react('727997516179570781');
        if(filteredCards.length <= 5){
            let embed = new Discord.MessageEmbed();
            embed.setDescription(`Found \`${filteredCards.length}\` bugs.`);
            filteredCards.forEach(async b => {
                embed.addField(b.name, `[Click to view](${b.url})`);
            });
            embed.setColor(message.client.colors.blurple);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            return message.embed(embed);
        }
        let pagedArray = [];
        let i, j, temparray, chunk = 5;
        for (i = 0, j = filteredCards.length; i < j; i += chunk) {
            temparray = filteredCards.slice(i, i + chunk);
            pagedArray.push(temparray);
        }
        let embed = new Discord.MessageEmbed();
        let currentpage = 1;
        // let bugs = pagedArray[0].map(c => `\n[${c.name}](${c.url})`).join('');
        embed.setDescription(`Found \`${filteredCards.length}\` bugs.`);
        pagedArray[0].forEach(async b => {
            embed.addField(b.name, `[Click to view](${b.url})`);
        });
        embed.setColor(message.client.colors.blurple);
        embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
        embed.setFooter(`[${currentpage}/${pagedArray.length}] | Developed by Lengo#0001`);
        let msg = await message.embed(embed);
        await msg.react('◀️');
        await msg.react('▶️');
        await msg.react('❌');
        let filter = (reaction, user) => ['◀️', '▶️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        async function awaitreact(){
          await msg.awaitReactions(filter, { time: 60000, max: 1 }).then(async (collected) => {
            if(collected.size == 0){
              msg.reactions.removeAll();
              return msg.edit(embed);
            }
            if(collected.first().emoji.name === '❌'){
                msg.reactions.removeAll();
                return msg.edit(embed);
            }
            if(collected.first().emoji.name === '◀️'){
              if(currentpage - 1 < 1){
                currentpage = pagedArray.length;
              } else {
                currentpage = currentpage - 1;
              }
            } else if(collected.first().emoji.name === '▶️'){
              if(currentpage + 1 > pagedArray.length){
                currentpage = 1;
              } else {
                currentpage = currentpage + 1;
              }
            }
            collected.first().users.remove(message.author);
            embed.setDescription(`Found \`${filteredCards.length}\` bugs.`);
            embed.fields = [];
            pagedArray[currentpage - 1].forEach(async b => {
                embed.addField(b.name, `[Click to view](${b.url})`);
            });
            embed.setColor(message.client.colors.blurple);
            embed.setAuthor(message.author.tag, message.author.displayAvatarURL());
            embed.setFooter(`[${currentpage}/${pagedArray.length}] | Developed by Lengo#0001`);
            msg.edit(embed);
            awaitreact();
          }).catch(console.error);
        }
        awaitreact();
    }
}
