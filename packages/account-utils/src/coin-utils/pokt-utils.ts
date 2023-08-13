import { BigNumber, bignumber, multiply } from 'mathjs';
import isString from 'lodash/isString';
import { JsonRpcProvider } from '@pokt-foundation/pocketjs-provider';
import { KeyManager } from '@pokt-foundation/pocketjs-signer';
import { TransactionBuilder } from '@pokt-foundation/pocketjs-transaction-builder';

enum PoktDenom {
  POKT = 'Pokt',
  UPOKT = 'Upokt',
}
enum PoktNetwork {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}
export class PoktUtils {

  static denom = PoktDenom.POKT;
  static baseDenom = PoktDenom.UPOKT;

  static network = {
    MAINNET: PoktNetwork.MAINNET,
    TESTNET: PoktNetwork.TESTNET,
  }

  static baseFee = bignumber('10000');

  static baseMultiplier = bignumber('1000000');

  static toBaseDenom(value: string|BigNumber): BigNumber {
    const bn = isString(value) ? bignumber(value) : value;
    return bn.mul(PoktUtils.baseMultiplier);
  }

  static fromBaseDenom(value: string|BigNumber): BigNumber {
    const bn = isString(value) ? bignumber(value) : value;
    return bn.div(PoktUtils.baseMultiplier);
  }

  static async getBalance(endpoint: string, address: string): Promise<BigNumber> {
    const provider = new JsonRpcProvider({rpcUrl: endpoint});
    const res = await provider.getBalance(address);
    return bignumber(res.toString());
  }

  static async send(endpoint: string, key: string, recipientAddress: string, network: PoktNetwork, amount: string|BigNumber, fee: string|BigNumber = PoktUtils.baseFee): Promise<string> {
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
      txMsg,
    });
    return txHash;
  }

}
