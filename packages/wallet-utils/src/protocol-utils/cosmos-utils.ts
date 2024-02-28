import { bignumber, BigNumber } from "mathjs";
import cosmosclient from '@cosmos-client/core';
import {
  Account200Response, AccountInfo200ResponseInfoPubKey,
  BroadcastTx200ResponseTxResponse,
  GetBlockByHeight200Response, SinceCosmosSdk047
} from '@cosmos-client/core/cjs/openapi';

export class CosmosUtils {

  static async getBlockHeight(endpoint: string, chainId: string): Promise<BigNumber> {
    // const res = await fetch(`${endpoint}/cosmos/base/tendermint/v1beta1/blocks/latest`);
    // const status = res.status;
    // if (status !== 200) {
    //   throw new Error(`/blocks/latest failed with status code ${status}`);
    // }
    // const parsed = await res.json();
    // const height = parsed.sdk_block?.header?.height as string;
    const client = new cosmosclient.CosmosSDK(endpoint, chainId);
    const res = await cosmosclient.rest.tendermint.getLatestBlock(client);
    if (res.status !== 200) {
      throw new Error(`getLastestBlock failed with status code ${res.status}`);
    }
    const blockCount = res.data.sdk_block?.header?.height;
    if (!blockCount) {
      throw new Error('unable to get height from block header');
    }
    return bignumber(blockCount);
  }

  static async getBalance(endpoint: string, chainId: string, address: string, denom: string): Promise<BigNumber> {
    const client = new cosmosclient.CosmosSDK(endpoint, chainId);
    const res = await cosmosclient.rest.bank.allBalances(client, address);
    const balance = res.data.balances?.find((b) => b.denom === denom);
    if (!balance) {
      throw new Error(`unable to find balance for ${address} with denom ${denom}`);
    }
    return bignumber(balance.amount);
  }

  // ToDo implement send()
  // ToDo implement sign()
  // ToDo implement getTransactions()

  static async getTransaction(endpoint: string, chainId: string, hash: string): Promise<BroadcastTx200ResponseTxResponse> {
    const client = new cosmosclient.CosmosSDK(endpoint, chainId);
    const res = await cosmosclient.rest.tx.getTx(client, hash);
    const tx = res.data.tx_response;
    if (!tx) {
      throw new Error(`unable to find transaction with hash ${hash}`);
    }
    return tx;
  }

  static async getBlock(endpoint: string, chainId: string, height: string): Promise<SinceCosmosSdk047> {
    const client = new cosmosclient.CosmosSDK(endpoint, chainId);
    const res = await cosmosclient.rest.tendermint.getBlockByHeight(client, BigInt(height.toString()));
    const block = res.data.sdk_block;
    if (!block) {
      throw new Error(`unable to find block with height ${height}`);
    }
    return block;
  }

  static async getAccount(endpoint: string, chainId: string, address: string, height?: number): Promise<AccountInfo200ResponseInfoPubKey> {
    const client = new cosmosclient.CosmosSDK(endpoint, chainId);
    // const res = await cosmosclient.rest.tendermint.getNodeInfo(client);
    const res = await cosmosclient.rest.auth.account(client, address)
    if (res.status !== 200) {
      throw new Error(`account failed with status code ${res.status}`);
    }
    const account = res.data.account;
    if (!account) {
      throw new Error(`unable to find account with address ${address}`);
    }
    return account;
  }

}
