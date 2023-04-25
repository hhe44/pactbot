import dotenv from "dotenv";
import path from "path";
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToEnv = path.join(__dirname, '/.env');
dotenv.config({path: pathToEnv});

export const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
export const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID;
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

export const HEDERA_NETWORK = process.env.HEDERA_NETWORK;

export const HEDERA_OPERATOR_ID = process.env.HEDERA_OPERATOR_ID;
export const HEDERA_OPERATOR_PRIVATE_KEY = process.env.HEDERA_OPERATOR_PRIVATE_KEY;

export const DINU_DECIMALS = process.env.DINU_DECIMALS;
export const DINU_TOKEN_ID = process.env.DINU_TOKEN_ID;
export const DANKSTER_NFT_ID = process.env.DANKSTER_NFT_ID;
export const WINNER_NFT_ID = process.env.WINNER_NFT_ID;

export const HEDERA_REST_API_VERSION = process.env.HEDERA_REST_API_VERSION;

export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
export const SUPABASE_URL = process.env.SUPABASE_URL;

// Derived configs below:
export const HEDERA_BASE_URL = (() => {
  switch (HEDERA_NETWORK) {
    case "mainnet":
      return `https://mainnet-public.mirrornode.hedera.com/api/${HEDERA_REST_API_VERSION}`;
    case "testnet":
      return `https://testnet.mirrornode.hedera.com/api/${HEDERA_REST_API_VERSION}`;
    case "previewnet":
      return `https://previewnet.mirrornode.hedera.com/api/${HEDERA_REST_API_VERSION}`;
  }
})()