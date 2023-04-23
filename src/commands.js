
import { ApplicationCommandOptionType, REST, Routes } from "discord.js";
import * as config from "../config.js";

const clientId = config.DISCORD_CLIENT_ID;
const serverId = config.DISCORD_SERVER_ID;
const token = config.DISCORD_TOKEN;

const commands = [
  {
    name: "pull",
    description: "Receive your allotment of $DINU from the dankbot, resets every 8 hours",
    options: [
      { name: "account-id", description: "Hedera Hashgraph Account ID, i.e., 0.0.1234567", type: ApplicationCommandOptionType.String, required: true },
    ]
  }
]

const rest = new REST({ version: '10' }).setToken(token);

export const registerCommands = async () => {
  try {
    console.log("Registering slash commands..");
    await rest.put(
      Routes.applicationGuildCommands(clientId, serverId),
      { body: commands }
    );
    console.log("Commands successfully registered!");
  } catch (e) {
    console.error(e);
  }
};