const {REST, Routes, Client} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN;

const client = new Client({intents: []});

client.on('ready', () => {
  const clientId = client.user.id;

  const commands = [];
  // Grab all the command files from the commands directory you created earlier
  const foldersPath = path.join(__dirname, 'commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        console.log(`コマンド${command.data.name}を読み込み`);
        commands.push(command.data.toJSON());
      } else {
        console.warn(`[WARN]このコマンド(${filePath})は、必須の「データ」または「実行」プロパティがありません。`);
      }
    }
  }

  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(BOT_TOKEN);

  // and deploy your commands!
  (async () => {
    try {
      console.log(`${commands.length}個のスラッシュコマンドを読み込み開始`);

      const data = await rest.put(
        Routes.applicationCommands(clientId),
        {body: commands},
      );

      console.log(`${data.length}個のスラッシュコマンドを読み込み完了`);
    } catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error(error);
    } finally {
      client.destroy();
      process.exit();
    }
  })();
});

client.login(BOT_TOKEN);
