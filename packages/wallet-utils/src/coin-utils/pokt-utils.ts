import { BigNumber, bignumber } from 'mathjs';
import isString from 'lodash/isString';
import { JsonRpcProvider } from '@pokt-foundation/pocketjs-provider';
import { KeyManager } from '@pokt-foundation/pocketjs-signer';
import { TransactionBuilder } from '@pokt-foundation/pocketjs-transaction-builder';
import bip44Constants from 'bip44-constants';
import { ChainMeta } from '../interfaces';
import { ChainType, CoinType, KeyType } from '@nodewallet/constants';
import { isHex } from '@nodewallet/util-browser';

// https://github.com/satoshilabs/slips/blob/master/slip-0044.md
const bip44Type = bip44Constants.findIndex((c) => c[1] === 'POKT');

export enum PoktDenom {
  POKT = 'Pokt',
  UPOKT = 'Upokt',
}
export class PoktUtils {

  static network: CoinType = CoinType.POKT;

  static denom = PoktDenom.POKT;
  static baseDenom = PoktDenom.UPOKT;
  static baseFee = bignumber('10000');
  static baseMultiplier = bignumber('1000000');

  static chain = {
    MAINNET: ChainType.MAINNET,
    TESTNET: ChainType.TESTNET,
  }

  static chainMeta: {[chainType: string]: ChainMeta} = {
    [ChainType.MAINNET]: {
      chain: ChainType.MAINNET,
      bip44Type: bip44Type,
      derivationPath: `m/44'/${bip44Type}'/0'/0`,
      keyType: KeyType.ED25519,
    },
    [ChainType.TESTNET]: {
      chain: ChainType.TESTNET,
      bip44Type: bip44Type,
      derivationPath: `m/44'/${bip44Type}'/0'/0`,
      keyType: KeyType.ED25519,
    },
  }

  /**
   * Converts a value to the base denomination
   * @param value The value in uPokt
   */
  static toBaseDenom(value: string|BigNumber): BigNumber {
    const bn = isString(value) ? bignumber(value) : value;
    return bn.mul(PoktUtils.baseMultiplier);
  }

  /**
   * Converts a value from the base denomination
   * @param value The value in Pokt
   */
  static fromBaseDenom(value: string|BigNumber): BigNumber {
    const bn = isString(value) ? bignumber(value) : value;
    return bn.div(PoktUtils.baseMultiplier);
  }

  /**
   * RPC Utilities
   */

  /**
   * Gets the balance of an account
   * @param endpoint Pocket Network RPC endpoint
   * @param address Address to get balance of
   */
  static async getBalance(endpoint: string, address: string): Promise<BigNumber> {
    const provider = new JsonRpcProvider({rpcUrl: endpoint});
    const res = await provider.getBalance(address);
    return bignumber(res.toString());
  }

  /**
   * Sends coin from an account to a recipient address
   * @param endpoint Pocket Network RPC endpoint
   * @param key Sender's raw private key
   * @param recipientAddress Recipient address
   * @param network Network ID
   * @param amount Amount to send in uPokt
   * @param memo Optional memo
   * @param fee Fee in uPokt
   */
  static async send(endpoint: string, key: string, recipientAddress: string, network: ChainType, amount: string|BigNumber, memo: string|undefined, fee: string|BigNumber = PoktUtils.baseFee): Promise<string> {
    const amountStr = isString(amount) ? amount : amount.toString();
    const feeStr = isString(fee) ? fee : fee.toString();
    const provider = new JsonRpcProvider({
      rpcUrl: endpoint,
    });
    const signer = await KeyManager.fromPrivateKey(key);
    const transactionBuilder = new TransactionBuilder({
      provider,
      signer,
      // @ts-ignore
      chainID: network.toLowerCase(),
    });
    const txMsg = transactionBuilder.send({
      fromAddress: signer.getAddress(),
      toAddress: recipientAddress,
      amount: amountStr,
    });
    const { txHash } = await transactionBuilder.submit({
      fee: feeStr,
      memo,
      txMsg,
    });
    return txHash;
  }

  static async getAccountFromPrivateKey(privateKey: string): Promise<{address: string, publicKey: string}> {
    privateKey = privateKey.trim();
    if(privateKey.length !== 128 || !isHex(privateKey)) {
      throw new Error('Invalid private key');
    }
    const account = await KeyManager.fromPrivateKey(privateKey);
    return {
      address: account.getAddress(),
      publicKey: account.getPublicKey(),
    };
  }

  _chain: ChainType;

  constructor(chain: ChainType) {
    this._chain = chain;
  }

}
