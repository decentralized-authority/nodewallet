import { HDNode } from '@sendnodes/hd-node';
import * as bip39 from 'bip39';
import { hdNodeToAccount } from '../util';
import { pbkdf2, toUtf8Bytes } from 'ethers';
import { derivePath, getMasterKeyFromSeed, getPublicKey } from 'ed25519-hd-key';
import { getAddressFromPublicKey } from '@pokt-foundation/pocketjs-utils';
import { KeyManager } from '@pokt-foundation/pocketjs-signer';

export function mnemonicToSeed(mnemonic: string, password?: string): string {
  if (!password) { password = ""; }

  const salt = toUtf8Bytes("mnemonic" + password, 'NFKD');

  return pbkdf2(toUtf8Bytes(mnemonic, 'NFKD'), salt, 2048, 64, "sha512");
}

export interface Account {
  address: string;
  privateKey: string;
  publicKey: string;
  index: number;
}

export class ED25519Utils {

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
