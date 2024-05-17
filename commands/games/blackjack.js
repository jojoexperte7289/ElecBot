const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const Blackjack = require('./bj-classes/main.js');

const collection = new Map();
const game = new Blackjack();
const { playerHand, dealerHand } = game;

const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("hit").setStyle(ButtonStyle.Success).setLabel("Karte").setDisabled(false),
    new ButtonBuilder().setCustomId("stand").setStyle(ButtonStyle.Danger).setLabel("Halten").setDisabled(false)
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Spielt Blackjack mit dir.'),
    async execute(interaction) {
        game.startgame();

        const startEmbed = new EmbedBuilder()
            .setAuthor({ name: "Blackjack - Spiel hat begonnen!", iconURL: interaction.user.avatarURL() })
            .addFields(
                { name: `Deine Hand [${playerHand.getValue()}]`, value: `${game.refresh()}` }
            )
            .setColor("Green")
            .setTimestamp();

        await interaction.reply({ embeds: [startEmbed], components: [row] });
        const msg = await interaction.fetchReply();
        collection.set(`${interaction.user.id}_data`, msg.id);

        const filter = (i) => ['hit', 'stand'].includes(i.customId) && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'hit') {
                game.hit(playerHand);
                if (playerHand.isBust()) {
                    const disabledRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('hit').setStyle(ButtonStyle.Success).setLabel('Karte').setDisabled(true),
                        new ButtonBuilder().setCustomId('stand').setStyle(ButtonStyle.Danger).setLabel('Halten').setDisabled(true)
                    );

                    const result = game.getResults();

                    const editedEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'Blackjack - Du bist ausgeschieden!' })
                        .addFields(
                            { name: 'Dein Punktestand:', value: `\`${result.playerValue}\``, inline: true },
                            { name: 'Punktestand des Dealers:', value: `\`${result.dealerValue}\``, inline: true }
                        )
                        .setColor('Red')
                        .setTimestamp();

                    await i.update({ embeds: [editedEmbed], components: [disabledRow] });
                    collector.stop();
                } else {
                    const updatedEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'Blackjack - Karte genommen!' })
                        .setDescription('Du hast eine Karte genommen. Spiel weiter mit den Buttons.')
                        .addFields(
                            { name: `Deine Hand [${playerHand.getValue()}]`, value: `${game.refresh()}` }
                        )
                        .setColor('Green')
                        .setTimestamp();

                    await i.update({ embeds: [updatedEmbed], components: [row] });
                }
            } else if (i.customId === 'stand') {
                const result = game.getResults();

                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('hit').setStyle(ButtonStyle.Success).setLabel('Karte').setDisabled(true),
                    new ButtonBuilder().setCustomId('stand').setStyle(ButtonStyle.Danger).setLabel('Halten').setDisabled(true)
                );

                let resultEmbed;
                if (result.iswon === false) {
                    resultEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'Blackjack - Du hast verloren!' })
                        .addFields(
                            { name: 'Dein Punktestand:', value: `\`${result.playerValue}\``, inline: true },
                            { name: 'Punktestand des Dealers:', value: `\`${result.dealerValue}\``, inline: true }
                        )
                        .setColor('Red')
                        .setTimestamp();
                } else if (result.iswon === true) {
                    resultEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'Blackjack - Du hast gewonnen!' })
                        .addFields(
                            { name: 'Dein Punktestand:', value: `\`${result.playerValue}\``, inline: true },
                            { name: 'Punktestand des Dealers:', value: `\`${result.dealerValue}\``, inline: true }
                        )
                        .setColor('Green')
                        .setTimestamp();
                } else {
                    resultEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'Blackjack - Unentschieden!' })
                        .addFields(
                            { name: 'Dein Punktestand:', value: `\`${result.playerValue}\``, inline: true },
                            { name: 'Punktestand des Dealers:', value: `\`${result.dealerValue}\``, inline: true }
                        )
                        .setColor('Orange')
                        .setTimestamp();
                }

                await i.update({ embeds: [resultEmbed], components: [disabledRow] });
                collector.stop();
            }
        });
    }
};


