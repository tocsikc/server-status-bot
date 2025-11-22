const { EmbedBuilder, MessageFlags } = require('discord.js');
const axios = require('axios'); 

const serverStatusLoops = new Map();

async function getData(serverIP) {
    if (!serverIP) {
        return null;
    }

    const res = await axios.get(`https://api.mcsrvstat.us/3/${serverIP}`);
    return res.data;
}

async function updateServerStatus(message, serverIP, givenVersion = null) {

    const data = await getData(serverIP);
    if (!data) {
        const offlineEmbed = new EmbedBuilder()
            .setTitle('`🟥` Server Not Found')
            .setColor('#ff0000')
            .addFields(
                { name: 'Server IP', value: `\`${serverIP}\``, inline: false },
            )
            .setTimestamp();

        await message.edit({ embeds: [offlineEmbed] });
        return;
    }

    let status, version;

    const isOnline = !!data.online;

    const playersList = data.players?.list ?? [];
    const onlineCount = data.players?.online ?? 0;
    const maxPlayers = data.players?.max ?? 0;

    if (isOnline && data.version !== '◉ Sleeping') {
        status = '`🟩` Server Online';
        version = data.version;
        color = '#79ec40'

    } else {
        status = '`🟥` Server Offline';
        version = givenVersion ? givenVersion : `N/A`
        color = '#d43636'
    }

    const playersFormatted =
        playersList.length > 0
            ? playersList.map(p => `\`${p.name}\``).join(', ')
            : '`No players online`';

    const embed = new EmbedBuilder()
        .setTitle(status)
        .setColor(color)
        .addFields(
            { name: 'Server IP', value: `\`${serverIP}\``, inline: false },
            { name: 'Version', value: `\`${version}\``, inline: false },
            { 
                name: `Player list (\`${onlineCount}\`/\`${maxPlayers}\`)`,
                value: playersFormatted, 
                inline: false 
            }
        )
        .setTimestamp();

    await message.edit({ embeds: [embed] });
}

async function handleStart(interaction, channel, serverIP, givenVersion = null) {
    const guildId = interaction.guildId;

    if (serverStatusLoops.has(guildId)) {
        return interaction.editReply({
            content: 'Server status updater is already running',
            flags: MessageFlags.Ephemeral,
        });
    }

    const initialEmbed = new EmbedBuilder()
        .setTitle('Finding Server')
        .setDescription('Starting status updates...');

    const message = await channel.send({
        embeds: [initialEmbed]
    });

    interaction.editReply({
        content: 'Starting Status Updates! yay',
    });

    await updateServerStatus(message, serverIP, givenVersion).catch(console.error);

    const interval = setInterval(() => {
        updateServerStatus(message, serverIP, givenVersion).catch(console.error);
    }, 60_000);

    serverStatusLoops.set(guildId, { interval, message });
}

async function handleStop(interaction) {
    const guildId = interaction.guildId;
    const data = serverStatusLoops.get(guildId);

    if (!data) {
        return interaction.editReply({
            content: 'Server stats updates are not running.',
            flags: MessageFlags.Ephemeral,
        });
    }

    clearInterval(data.interval);
    serverStatusLoops.delete(guildId);

    await data.message.delete();

    return interaction.editReply({
        content: 'Stopped updating server status.',
        flags: MessageFlags.Ephemeral,
    });
}

module.exports = { handleStart, handleStop };
