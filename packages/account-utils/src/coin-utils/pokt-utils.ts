import { BigNumber, bignumber, multiply } from 'mathjs';
import isString from 'lodash/isString';
import { JsonRpcProvider } from '@pokt-foundation/pocketjs-provider';
import { KeyManager } from '@pokt-foundation/pocketjs-signer';
import { TransactionBuilder } from '@pokt-foundation/pocketjs-transaction-builder';

enum PoktDenom {
  POKT = 'Pokt',
  UPOKT = 'Upokt',
}
enum PoktChain {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}
export class PoktUtils {

  static denom = PoktDenom.POKT;
  static baseDenom = PoktDenom.UPOKT;

  static chain = {
    MAINNET: PoktChain.MAINNET,
    TESTNET: PoktChain.TESTNET,
  }

  static baseFee = bignumber('10000');

  static baseMultiplier = bignumber('1000000');

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
  static async send(endpoint: string, key: string, recipientAddress: string, network: PoktChain, amount: string|BigNumber, memo: string|undefined, fee: string|BigNumber = PoktUtils.baseFee): Promise<string> {
    const amountStr = isString(amount) ? amount : amount.toString();
    const feeStr = isString(fee) ? fee : fee.toString();
    const provider = new JsonRpcProvider({
      rpcUrl: endpoint,
    });
    const signer = await KeyManager.fromPrivateKey(key);
    const transactionBuilder = new TransactionBuilder({
      provider,
      signer,
      chainID: network,
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

}
