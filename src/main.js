import { Client as DiscordClient, IntentsBitField } from "discord.js";
import { tokenPayout, tokenAssociationCheck } from "./hedera.js";
import { registerCommands } from "./commands.js";
import { supabase } from "./db.js";
import * as config from "./config.js";

const discordBot = new DiscordClient({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

discordBot.on("ready", (c) => {
  console.log(`${c.user.tag} has logged in`);
  registerCommands();
});

discordBot.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
    switch (interaction.commandName) {
      case "pray":
        const accountId = interaction.options.get("account-id").value;
        // Checks against accountId including:
        // Null or Empty Check, Length Check
        // Regex Check for 0.0.1234567... format
        if (
          !accountId ||
          accountId.length > 32 ||
          !/^\d{1}\.\d{1}\.\d{2,16}$/.test(accountId)
        ) {
          interaction.reply(`That account ID is not valid.`);
          break;
        }
        let { data, error } = await supabase
          .from("prayers")
          .select("accountId")
          .eq("accountId", accountId);
        if (error || data.length > 1) {
          console.error(`Error: ${error}`);
          console.error(`Data: ${data}`);
          interaction.reply(`Something went wrong - try again!`);
          break;
        } else if (data.length === 1) {
          interaction.reply(`Its prayers has already been received. Your allotment of PACT was given.`);
          break;
        } else {
          const isAssociated = await tokenAssociationCheck(accountId);
          if (!isAssociated) {
            interaction.reply(`You have not associated with the token ID: ${config.HEDERA_TOKEN_ID}`);
            break;
          }
          await tokenPayout(accountId);
          await supabase.from("prayers").insert([{ accountId }]);
          interaction.reply(`Your prayers have been received, and new PACT is forged...`);
          break;
        }
      default:
        interaction.reply(`I don't know that command!`);
        break;
    }
  } catch (e) {
    console.error(e);
  }
});

const getResetTime = () => {
  const resetTime =
    24 * 60 - Math.floor((new Date().getTime() / (1000 * 60)) % (24 * 60));
  const hrs = Math.floor(timeTilReset / 60);
  const mins = Math.floor(timeTilReset % 60);
  return { hrs, mins };
};

discordBot.login(config.DISCORD_TOKEN);
