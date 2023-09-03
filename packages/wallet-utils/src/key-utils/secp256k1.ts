import { HDNodeWallet } from 'ethers';
import * as bip39 from 'bip39';
import { hdNodeToAccount } from '../util';
import { Account } from './ed25519';
import { KeyType } from '@nodewallet/constants';

export class SECP256K1Utils {

  type = KeyType.SECP256K1;

  _path: string;

  constructor(path: string) {
    this._path = path;
  }

  async fromPhrase(mnemonicPhrase: string, idx = 0): Promise<Account> {
    const seed = await bip39.mnemonicToSeed(mnemonicPhrase);
    const node = HDNodeWallet.fromSeed(seed).derivePath(this.pathAtIdx(idx));
    return hdNodeToAccount(node);
  }

  async fromSeed(seed: string, idx = 0): Promise<Account> {
    const node = HDNodeWallet.fromSeed(Buffer.from(seed, 'hex')).derivePath(this.pathAtIdx(idx));
    return hdNodeToAccount(node);
  }

  pathAtIdx(idx: number): string {
    const split = this._path
      .split('/');
    return [
      ...split.slice(0, 5),
      idx,
    ].join('/');
  }

}
