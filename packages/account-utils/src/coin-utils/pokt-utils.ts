import { BigNumber, bignumber, multiply } from 'mathjs';
import isString from 'lodash/isString';
import { JsonRpcProvider } from '@pokt-foundation/pocketjs-provider';

enum PoktDenom {
  POKT = 'Pokt',
  UPOKT = 'Upokt',
}
export class PoktUtils {

  static denom = PoktDenom.POKT;
  static baseDenom = PoktDenom.UPOKT;

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

}
