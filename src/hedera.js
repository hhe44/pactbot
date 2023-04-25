import {
  AccountId,
  Client,
  PrivateKey,
  TransferTransaction,
} from "@hashgraph/sdk";
import fetch from 'node-fetch'
import * as config from "../config.js";

const hederaBaseUrl = config.HEDERA_BASE_URL;
const operatorId = AccountId.fromString(config.HEDERA_OPERATOR_ID);
const operatorKey = PrivateKey.fromString(config.HEDERA_OPERATOR_PRIVATE_KEY);
const dinuTokenId = config.DINU_TOKEN_ID;
const danksterNftId = config.DANKSTER_NFT_ID;
const winnerNftId = config.WINNER_NFT_ID;
const tokenDecimals = Number(config.DINU_DECIMALS);

export const client = Client.forName(config.HEDERA_NETWORK).setOperator(
  operatorId,
  operatorKey
);

export const tokenBalanceCheck = async (accountId) => {
  try {
    const baseUrl = `${hederaBaseUrl}/accounts/${accountId}/tokens`;
    const tokenQueries = `?token.id=${dinuTokenId}&token.id=${winnerNftId}&token.id=${danksterNftId}`;
    const url = baseUrl + tokenQueries;
    const data = await fetch(url).then((response) => response.json());
    if (!data || !data.tokens) {
      // Unfortunately rate limitations have been a frequent problems in the past
      // If this occurs, lookup user association status with AccountBalanceQuery (DEPRECATED)
      throw new Error(`Fetch at ${url} failed! Are we being rate limited again?`);
    }
    const isAssociated = data.tokens.length > 0;
    let isAdopter = false, isDankster = false, isWinner = false;
    if (isAssociated) {
      for (const token of data.tokens) {
        switch (token.token_id) {
          case dinuTokenId:
            isAdopter = ((token.balance / Math.pow(10, tokenDecimals)) >= 100000000000);
            break;
          case danksterNftId:
            isDankster = (token.balance > 0);
            break;
          case winnerNftId:
            isWinner = (token.balance > 0);
            break;
          default:
            throw new Error(`Unexpected case reached!`);
        }
      }
    }
    return ({ isAssociated, isAdopter, isDankster, isWinner });
  } catch (e) {
    console.error(e)
  }
};

export const tokenPayout = async (accountId, isAdopter, isDankster, isWinner) => {
  try {
    let payout = 0.420;
    isAdopter   ? payout += 10000.000   : payout;
    isDankster  ? payout += 420690.000  : payout;
    isWinner    ? payout += 7777.777    : payout;
    const finalPayout = payout * Math.pow(10, tokenDecimals);
    const tx = await new TransferTransaction()
      .addTokenTransfer(dinuTokenId, operatorId, -finalPayout)
      .addTokenTransfer(dinuTokenId, accountId, finalPayout)
      .freezeWith(client)
      .sign(operatorKey);
    const txResponse = await tx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    if (receipt.status._code == 22) {
      console.debug(`${finalPayout / Math.pow(10, tokenDecimals)} $DINU transferred to ${accountId}`);
    } else {
      throw new Error(`Receipt status is not a success!`);
    }
  } catch (e) {
    console.error(e);
  }
}