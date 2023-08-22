// インポート
const fs = require('fs');
const path = require('path');
const {Client, Collection, Events, GatewayIntentBits, DiscordAPIError} = require('discord.js');
require('dotenv').config();

const config = require('./config.json');

// 環境変数からトークンを取得
/**
 * @type {string}
 */
const BOT_TOKEN = process.env.BOT_TOKEN;


// BOTのセットアップ

// clientインスタンスを作成
const client = new Client({intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  // GatewayIntentBits.GuildMembers,
]});

// コマンドを格納するCollectionを作成
client.commands = new Collection();

// コマンドを読み込み
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING]このコマンド(${filePath})は、必須の「データ」または「実行」プロパティがありません。`);
    }
  }
}


// イベント処理

// `client`はすでに使用されているため、cを使用
client.once(Events.ClientReady, (c) => {
  console.log(`${c.user.tag}としてログイン`);
});

// インタラクションを処理
client.on(Events.InteractionCreate, async (interaction) => {
  // コマンド以外は無視
  if (!interaction.isChatInputCommand()) return;

  // コマンド名を取得
  const command = interaction.client.commands.get(interaction.commandName);

  // コマンドが見つからない場合はエラーを表示
  if (!command) {
    console.error(`コマンド${interaction.commandName}は見つかりませんでした`);
    return;
  }

  // コマンドを実行
  try {
    await command.execute(client, interaction);
  } catch (error) {
    console.error(error);
    // エラーを返信
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({content: 'コマンドの実行中にエラーが発生しました', ephemeral: true});
    } else {
      await interaction.reply({content: 'コマンドの実行中にエラーが発生しました', ephemeral: true});
    }
  }
});


/**
 * config.jsonのansiコンフィグからヘルプメッセージを生成して返す
 * @param {Object} ansiConfig
 * @returns {String}
 */
const getHelpMessage = (ansiConfig) => `\
${ansiConfig.escape}[1m${ansiConfig.escape}[4m${ansiConfig.escape}[0;42m使い方${ansiConfig.escape}[0m
※メンションされたメッセージのみ置き換えを実行します

` +
Object.entries(ansiConfig.colors).map(([prefix, v]) =>
  Object.entries(v).map(([key, value]) =>
    `${ansiConfig.escape}${value}${prefix}${key}: ${
      ansiConfig.helpMessages[value] || 'Unknown'
    }${ansiConfig.escape}[0m`,
  ).join('\n'),
).join('');

client.on(Events.MessageCreate, async (message) => {
  try {
    const author = message.author;
    const mentions = message.mentions;
    const content = message.content;

    // BOTのメッセージは無視
    if (author.bot) return;
    // メンションされていない場合は無視
    if (!mentions.has(client.user)) return;
    // メッセージの中身が取得できない場合は無視
    if (content === '') return;

    console.log(`メッセージを受信: ${content}`);

    let replacedContent = content.toString();
    replacedContent = replacedContent.replace(
      new RegExp(` ?<@!?${client.user.id}> ?`),
      // `@${client.user.displayName}#${client.user.discriminator}`,
      '',
    );

    /*
    // メンションをユーザー名に置換
    replacedContent.replace(/ ?<@!?(\d+)> ?/g, (async (match, p1) => {
      try {
        console.log(`ユーザーID: ${p1}`);
        const user = await client.users.fetch(p1);
        return `@${user.displayName}`;
      } catch (error) {
        // ユーザーが見つからない場合は無視
        if (error instanceof DiscordAPIError && error.code === 10013) {
          return match;
        }
      } finally {
        return match;
      }
    }));
    */

    // ANSIエスケープシーケンスに置換
    replacedContent = replacedContent.replace(/\\&/g, '\\＆');
    Object.entries(config.ansi.colors).forEach(([prefix, v]) => {
      Object.entries(v).forEach(([key, value]) => {
        // console.log(`prefix: ${prefix}, key: ${key}, value: ${value}`);
        replacedContent = replacedContent.replace(
          new RegExp(`${prefix}${key}`, 'g'),
          `${config.ansi.escape}${value}`,
        );
      });
    });
    replacedContent = replacedContent.replace(/\\＆/g, '&');

    // ```は間に空白文字を入れることでコードブロックから外れることを回避
    replacedContent.replace(/```/g, '​`​`​`​');

    if (replacedContent === '') {
      replacedContent = getHelpMessage(config.ansi);
    }

    replacedContent = `\`\`\`ansi\n${replacedContent}\n\`\`\``;

    // メッセージを送信
    await message.reply({content: replacedContent, allowedMentions: {repliedUser: false, roles: [], users: []}});
  } catch (error) {
    // "Cannot send an empty message"エラーのときは無視
    if (error instanceof DiscordAPIError && error.code === 50006) {
      return;
    }

    console.error(error);

    try {
      await message.reply({content: 'エラーが発生しました', allowedMentions: {repliedUser: false, roles: [], users: []}});
    } catch (error) {
      console.error('エラーを返信できませんでした: ', error);
    }
  }
});


// トークンを使用してログイン!
client.login(BOT_TOKEN);
