const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dmuser')
		.setDescription('Sends a message to a specific user.')
        .addUserOption(option =>
			option
				.setName('user')
				.setDescription('The member that i should sends the message.')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('message')
				.setDescription('The message.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		const user = interaction.options.getUser('target');
		const message = interaction.options.getString('message') ?? 'No message was given!';

        await user.send(message);
		await interaction.reply({ content: 'The message was send! ;-)', ephemeral: true });
	},
};
