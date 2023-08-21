const {SlashCommandBuilder} = require('discord.js');
const getEmbedBase = require('../../functions/get-embed-base.js');
const shuffleArray = require('../../functions/shuffle-array');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('team')
    .setDescription('指定した最大9人のユーザーを指定したチーム数へランダムに分配する。')
    .addIntegerOption((option) => option
      .setName('count')
      .setDescription('分けるチーム数を指定。')
      .setRequired(true))
    .addUserOption((option) => option
      .setName('user1')
      .setDescription('1人目のユーザーを指定。')
      .setRequired(true))
    .addUserOption((option) => option
      .setName('user2')
      .setDescription('2人目のユーザーを指定。')
      .setRequired(true))
    .addUserOption((option) => option
      .setName('user3')
      .setDescription('3人目のユーザーを指定。')
      .setRequired(true))
    .addUserOption((option) => option
      .setName('user4')
      .setDescription('4人目のユーザーを指定。')
      .setRequired(false))
    .addUserOption((option) => option
      .setName('user5')
      .setDescription('5人目のユーザーを指定。')
      .setRequired(false))
    .addUserOption((option) => option
      .setName('user6')
      .setDescription('6人目のユーザーを指定。')
      .setRequired(false))
    .addUserOption((option) => option
      .setName('user7')
      .setDescription('7人目のユーザーを指定。')
      .setRequired(false))
    .addUserOption((option) => option
      .setName('user8')
      .setDescription('8人目のユーザーを指定。')
      .setRequired(false))
    .addUserOption((option) => option
      .setName('user9')
      .setDescription('9人目のユーザーを指定。')
      .setRequired(false)),
  /**
   * @param {import('discord.js').Client} client
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async execute(client, interaction) {
    let Users = [];

    for (let i = 1; i <= 9; i += 1) {
      if (interaction.options.get(`user${i}`)) {
        Users.push(interaction.options.get(`user${i}`).user);
      }
    }

    Users = shuffleArray(Users);

    const Teams = {};
    const TeamValue = interaction.options.get('count').value;
    const TeamSize = Math.floor(Users.length / TeamValue);
    const TeamOverSize = Users.length % TeamValue;

    let Posision = 0;
    for (let i = 0; i < TeamValue; i += 1) {
      Teams[i + 1] = Users.slice(Posision, Posision + (TeamSize));
      Posision += TeamSize;
      if (i < TeamOverSize) {
        Teams[i + 1].push(Users[Posision]);
        Posision += 1;
      }
    }

    const embed = getEmbedBase()
      .setTitle('teamコマンド')
      .setDescription(`**${Users.length}人**を**${TeamValue}チーム**に`);

    Object.entries(Teams).forEach((value) => {
      embed.addFields({
        name: `チーム${value[0]}`,
        value: value[1].map((user) => `${user}`).join(' '),
      });
    });

    await interaction.reply({embeds: [embed]});
  },
};
