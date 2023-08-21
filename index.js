// インポート
const fs = require('fs');
const path = require('path');
const {Client, Collection, Events, GatewayIntentBits} = require('discord.js');
require('dotenv').config();


// 環境変数からトークンを取得
/**
 * @type {string}
 */
const BOT_TOKEN = process.env.BOT_TOKEN;


// BOTのセットアップ

// clientインスタンスを作成
const client = new Client({intents: [GatewayIntentBits.Guilds]});

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

// トークンを使用してログイン!
client.login(BOT_TOKEN);
