import { bignumber, multiply } from 'mathjs';
import { EventEmitter } from 'events';
import { CoinType } from '@nodewallet/constants';
import cloneDeep from 'lodash/cloneDeep';

export type PricingMultipliers = {[ticker: string]: string}
export enum PricingEvent {
  UPDATE = 'UPDATE',
}

export class Pricing extends EventEmitter {

  static supportedCoins: CoinType[] = [
    CoinType.POKT,
  ];

  static toUSD(ticker: CoinType, amount: string, multipliers: PricingMultipliers): string {
    try {
      const multiplier = multipliers[ticker] || '0';
      const usd = multiply(
        bignumber(amount),
        bignumber(multiplier),
      ).toString();
      return Number(usd).toFixed(2);
    } catch(err) {
      return '0.00';
    }
  }

  private multipliers: PricingMultipliers = {};

  async update() {
    for(const ticker of Pricing.supportedCoins) {
      try {
        const poktRes = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${ticker}&tsyms=USD`);
        this.multipliers[ticker] = (await poktRes.json())['USD'] || '0';
      } catch(err) {
        // do nothing
      }
    }
    this.emit(PricingEvent.UPDATE, cloneDeep(this.multipliers));
  }

}
