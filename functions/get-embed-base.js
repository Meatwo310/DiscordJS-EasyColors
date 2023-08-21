const {EmbedBuilder} = require('discord.js');

module.exports = () => new EmbedBuilder()
  .setColor('Grey')
  .setTimestamp(new Date());
