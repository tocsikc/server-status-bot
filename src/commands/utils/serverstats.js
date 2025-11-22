const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { handleStart, handleStop } = require('../../utils/updateStatus.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverstats')
        .setDescription('Setup server stats.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start displaying server stats.')
                .addStringOption(option =>
                    option.setName('server-ip').setDescription('Server IP Address.').setRequired(true)
                )
                .addChannelOption(option =>
                    option.setName('channel').setDescription('Channel to send message.').setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('version').setDescription('Minecraft Version.')
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('stop').setDescription('Stop displaying server stats.')
        ),

    requiredRole: 'adminRoles',

    async execute(interaction) {
        await interaction.deferReply();

        switch (interaction.options.getSubcommand()) {
            case "start": {
                try {
                    const serverIP = interaction.options.getString('server-ip');
                    const version = interaction.options.getString('version');
                    const channel = interaction.options.getChannel('channel');

                    if (version) {
                        return handleStart(interaction, channel, serverIP, version);
                    }
                    return handleStart(interaction, channel, serverIP);
                } catch(error) {
                    console.error(error);

                    const errorEmbed = new EmbedBuilder()
                        .setColor(15548997)
                        .setAuthor({ name: "❌ An Error has occurred" })
                        .setDescription(`\`\`\`${error}\`\`\``)

                    return interaction.editReply({ embeds: [errorEmbed] });
                }
            }
            case "stop": {
                try {
                    return handleStop(interaction);
                } catch(error) {
                    console.error(error);

                    const errorEmbed = new EmbedBuilder()
                        .setColor(15548997)
                        .setAuthor({ name: "❌ An Error has occurred" })
                        .setDescription(`\`\`\`${error}\`\`\``)

                    return interaction.editReply({ embeds: [errorEmbed] });
                }
            }
        }
    }
};