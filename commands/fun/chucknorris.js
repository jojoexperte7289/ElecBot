const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chucknorris')
		.setDescription('Replies with a Chuck Norris fact.'),
	async execute(interaction) {
		const response = await fetch("https://api.chucknorris.io/jokes/random");
        const fact = await response.json();
        let r = fact.value;
        interaction.reply(r)
	},
};