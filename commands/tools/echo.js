const {SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('入力をそのまま返します')
    .addStringOption((option) => option
      .setName('input')
      .setDescription('返させる文字列')
      .setRequired(true),
    ),
  /**
   * @param {import('discord.js').Client} client
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async execute(client, interaction) {
    await interaction.reply(interaction.options.getString('input'));
  },
};
