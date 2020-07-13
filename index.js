require('dotenv').config();
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const client = new CommandoClient({
    commandPrefix: '?',
    owner: '235929735643922433',
    commandEditableDuration: 0
});
client.registry.registerDefaultTypes();
client.registry.registerGroups([
    ['info', 'Info'],
    ['search', 'Bug Searching']
]);
client.registry.registerCommandsIn(path.join(__dirname,  'commands'));
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const colors = require('./colors.js');
client.colors = colors;
client.on('ready', async () => {
    console.log(chalk.yellow(figlet.textSync('DTesterHelper', { horizontalLayout: 'full' })));
    console.log(chalk.red(`Bot started!\n---\n`
    + `> Users: ${client.users.cache.size}\n`
    + `> Channels: ${client.channels.cache.size}\n`
    + `> Servers: ${client.guilds.cache.size}`));
    let botstatus = fs.readFileSync('./bot-status.json');
    botstatus = JSON.parse(botstatus);
    if(botstatus.activity == 'false') return;
    if(botstatus.activitytype == 'STREAMING'){
        client.user.setActivity(botstatus.activitytext, {
            type: botstatus.activitytype,
                url: botstatus.activityurl
            });
        } else {
            client.user.setActivity(botstatus.activitytext, {
                type: botstatus.activitytype
            });
        }
});
client.login(process.env.token);