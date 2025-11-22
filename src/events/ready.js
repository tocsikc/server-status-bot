const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🟩 Discord Ready: ${client.user.tag} is online.`);
        client.user.setActivity('greg is watching you proebably', { type: ActivityType.Watching });
    },
};
