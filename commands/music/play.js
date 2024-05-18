const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const queues = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays music.')
        .addStringOption(option =>
            option
                .setName('song')
                .setDescription('The name or URL of the song.')
                .setRequired(true)),
    async execute(interaction) {
        console.log('Executing play command...');
        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: "Gehe zuerst in einen Voice-Channel!", ephemeral: true });
        }

        const songInput = interaction.options.getString('song');
        let songInfo;
        try {
            console.log(`Searching for song: ${songInput}`);
            const { videos } = await ytSearch(songInput);
            if (!videos.length) throw new Error('No video found');
            const song = videos[0];
            songInfo = {
                title: song.title,
                url: song.url,
                member: interaction.member
            };
        } catch (error) {
            console.error('Error searching for song:', error);
            return interaction.reply({ content: "Kein Video gefunden!", ephemeral: true });
        }

        const serverQueue = queues.get(interaction.guildId) ?? { songs: [] };
        if (!queues.has(interaction.guildId)) {
            queues.set(interaction.guildId, serverQueue);
        }

        serverQueue.songs.push(songInfo);

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });

            const player = createAudioPlayer();

            // Handler for when the bot is ready in the voice channel
            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('Bot is ready in the voice channel');
                playSong(player, serverQueue);
            });

            interaction.reply(`:notes: Hinzugefügt zur Warteschlange: ${songInfo.title}`);
        } catch (error) {
            console.error('Error joining voice channel:', error);
            return interaction.reply({ content: "Ein Fehler ist beim Betreten des Voice-Channels aufgetreten!", ephemeral: true });
        }
    }
};

async function playSong(player, serverQueue) {
    if (!serverQueue || !serverQueue.songs.length) return;

    const song = serverQueue.songs[0];
    const stream = ytdl(song.url, { filter: 'audioonly' });

    const resource = createAudioResource(stream, { inlineVolume: true });
    player.play(resource);

    player.on('error', error => {
        console.error('Error playing song:', error);
        serverQueue.songs.shift();
        playSong(player, serverQueue);
    });

    player.on('stateChange', (oldState, newState) => {
        console.log(`Player transitioned from ${oldState.status} to ${newState.status}`);
        if (newState.status === 'idle') {
            serverQueue.songs.shift();
            playSong(player, serverQueue);
        }
    });
}
