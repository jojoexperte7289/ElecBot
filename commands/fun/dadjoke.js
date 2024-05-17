const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dadjoke')
		.setDescription('Replies with a dad joke. xD'),
	async execute(interaction) {
		const getJoke = async () => {
            try {
              const resp = await fetch("https://icanhazdadjoke.com", {
                method: "GET",
                headers: { Accept: "application/json" },
              });
              const json = await resp.json();
              const joke = json.joke;
      
              return joke;
            } catch (error) {
              console.error(error);
            }
          };
          const joke = await getJoke();
          interaction.reply(joke);
        }
	};