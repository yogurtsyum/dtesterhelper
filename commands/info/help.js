const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const Discord = require('discord.js');
module.exports = class DesktopCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            aliases: ['h'],
            group: 'info',
            memberName: 'help',
            description: 'Displays some bot information.',
            args: [
                {
                    key: 'command',
                    prompt: 'What command would you like to search for?',
                    type: 'string',
                    default: '',
                    validate: async command => {
                        let cmd = await client.registry.commands.get(command);
                        if(!cmd){
                            let cmd = await client.registry.commands.find(c => c.aliases.includes(command));
                            if(!cmd) return false;
                        }
                        if(cmd) return true;
                    }
                }
            ]
        });
    }

    async run(message, { command }){
        if(command !== ''){
            let cmd = await message.client.registry.commands.get(command);
            if(!cmd){
                cmd = await client.registry.commands.find(c => c.aliases.includes(command));
            }
            if(cmd){
                let embed = new Discord.MessageEmbed();
                embed.setTitle(`📖 \`${cmd.name} ${cmd.format}\``);
                embed.setDescription(`${cmd.description}`);
                embed.addField('Module', `${cmd.group.name}`);
                if(cmd.aliases.length !== 0) embed.addField('Aliases', `${cmd.aliases.join(', ')}`);
                embed.setFooter(`Developed by Lengo#0001`);
                embed.setColor(message.client.colors.blurple);
                return message.embed(embed);
            }
        }
        let embed = new Discord.MessageEmbed();
        embed.setTitle('🔥 DTesterHelper');
        embed.setDescription('An extremely epic Discord bot that can search for reported Discord bugs.');
        embed.setFooter(`Page [1/3] | Developed by Lengo#0001`);
        embed.setColor(message.client.colors.blurple);
        let msg = await message.embed(embed);
        let filter = (reaction, user) => ['◀️', '▶️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        await msg.react('◀️');
        await msg.react('▶️');
        await msg.react('❌');
        let currentpage = 1;
        async function awaitreact() {
            await msg.awaitReactions(filter, { time: 60000, max: 1 }).then(async (collected) => {
            if(collected.size == 0){
                return msg.reactions.removeAll();
            }
            if(collected.first().emoji.name === '❌'){
                return msg.reactions.removeAll();
            }
            if(collected.first().emoji.name === '◀️'){
                if(currentpage === 1){
                currentpage = 2;
                } else {
                    currentpage = currentpage - 1;
                }
            } else if(collected.first().emoji.name === '▶️'){
                if(currentpage === 3){
                    currentpage = 1;
                } else {
                    currentpage = currentpage + 1;
                }
            }
            collected.first().users.remove(message.author);
            if(currentpage === 1){
                let embed = new Discord.MessageEmbed();
                embed.setTitle('🔥 DTesterHelper');
                embed.setDescription('An extremely epic Discord bot that can search for reported Discord bugs.');
                embed.setFooter(`Page [1/3] | Developed by Lengo#0001`);
                embed.setColor(message.client.colors.blurple);
                msg.edit(embed);
            } else if(currentpage === 2){
                let groups = message.client.registry.groups.array();
                let string = '';
                groups.forEach(async g => {
                    let commands = g.commands.array().map(c => `\`${c.name}\` - ${c.description}\n`).join('');
                    string = string + `__${g.name}__\n${commands}`;
                });
                let embed = new Discord.MessageEmbed();
                embed.setTitle('🔥 DTesterHelper');
                embed.setDescription(`**Commands**\nType \`${message.client.commandPrefix}help <command>\` for more details about a specific comamnd.\n\n${string}`);
                embed.setFooter(`Page [2/3] | Developed by Lengo#0001`);
                embed.setColor(message.client.colors.blurple);
                msg.edit(embed);
            } else if(currentpage === 3){
                let embed = new Discord.MessageEmbed();
                embed.setTitle('🔥 DTesterHelper');
                embed.setDescription('By using this bot, you agree to its [privacy policy](https://gist.github.com/yogurtsyum/68177acb31112357dea95f262a92f0f0).\n\nDTesterHelper is not affiliated with Discord.');
                embed.setFooter(`Page [3/3] | Developed by Lengo#0001`);
                embed.setColor(message.client.colors.blurple);
                msg.edit(embed);
            }
            awaitreact();
            }).catch(console.error);
        }
        awaitreact();
    }
}
