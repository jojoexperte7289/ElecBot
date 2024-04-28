const SlashCommand = require("../../modules/slashcommands");

client.channels.fetch(channelid).then(channel => {
    channel.messages.delete(messageid);
  });