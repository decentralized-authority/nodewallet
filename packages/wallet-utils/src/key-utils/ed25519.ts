import { HDNode } from '@sendnodes/hd-node';
import * as bip39 from 'bip39';
import { hdNodeToAccount } from '../util';
import { Buffer } from 'buffer';
import { KeyType } from '@nodewallet/constants';

export interface Account {
  address: string;
  privateKey: string;
  publicKey: string;
  index: number;
}

export class ED25519Utils {

  type = KeyType.ED25519;

  _path: string;

  constructor(path: string) {
    this._path = path;
  }

  async fromPhrase(mnemonicPhrase: string, idx = 0): Promise<Account> {
    const seed = await bip39.mnemonicToSeed(mnemonicPhrase);
    const node = HDNode.fromSeed(seed)
      .derivePath(this._path)
      .derivePath(this.pathAtIdx(idx));
    return hdNodeToAccount(node);
  }

  async fromSeed(seed: string, idx = 0): Promise<Account> {
    const node = HDNode.fromSeed(Buffer.from(seed, 'hex'))
      .derivePath(this._path)
      .derivePath(this.pathAtIdx(idx));
    return hdNodeToAccount(node);
  }

  pathAtIdx(idx: number): string {
    const split = this._path
      .split('/');
    if(!/'$/.test(split[4])) {
      split[4] += `'`;
    }
    return [
      ...split.slice(0, 5),
      idx,
    ].join('/');
  }

}
