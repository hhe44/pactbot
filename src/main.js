import { Client as DiscordClient, IntentsBitField } from "discord.js";
import { tokenPayout, tokenBalanceCheck } from "./hedera.js";
import { registerCommands } from "./commands.js";
import { supabase } from "./db.js";
import { clearTableEvery8Hours } from "./cronjob.js";
import * as config from "../config.js";

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
      case "pull":
        const accountId = interaction.options.get("account-id").value;
        if (
          !accountId ||
          accountId.length > 32 ||
          !/^\d{1}\.\d{1}\.\d{2,16}$/.test(accountId)
        ) {
          interaction.reply(`That account ID is not valid.`);
          break;
        }
        let { data, error } = await supabase
          .from("danktable")
          .select("accountId")
          .eq("accountId", accountId);
        if (error || data.length > 1) {
          console.error(`Error: ${error.data}`);
          console.error(`Data: ${data}`);
          interaction.reply(`Something went wrong - try again!`);
          break;
        } else if (data.length === 1) {
          const { hrs, mins } = getResetTime();
          interaction.reply(`Your allotment of $DINU was given, check back in ${hrs} hours and ${mins} minutes.`);
          break;
        } else {
          const { isAssociated, isAdopter, isDankster, isWinner } = await tokenBalanceCheck(accountId);
          if (!isAssociated) {
            interaction.reply(`You have not associated with the token ID: ${config.DINU_TOKEN_ID}`);
            break;
          }
          await interaction.deferReply();
          await tokenPayout(accountId, isAdopter, isDankster, isWinner);
          await supabase.from("danktable").insert([{ accountId }]);
          interaction.editReply(`Your $DINU has been successfully sent to your account.`);
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
  const resetTime = 8 * 60 - Math.floor((new Date().getTime() / (1000 * 60)) % (8 * 60));
  const hrs = Math.floor(resetTime / 60);
  const mins = Math.floor(resetTime % 60);
  return { hrs, mins };
};

clearTableEvery8Hours();
discordBot.login(config.DISCORD_TOKEN);
