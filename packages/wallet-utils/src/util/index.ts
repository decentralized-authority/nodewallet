import { HDNodeWallet } from 'ethers';
import { Account } from '../key-utils/ed25519';
import { HDNode } from '@sendnodes/hd-node';
import { Buffer } from 'buffer';

export const hdNodeToAccount = (node: HDNodeWallet|HDNode): Account => {
  return {
    address: node.address,
    privateKey: node.privateKey,
    publicKey: node.publicKey,
    index: node.index,
  };
};

/**
 * Creates a master id from a seed using the first 32 hex characters of the public key at path m
 * @param seed
 */
export const seedToMasterId = (seed: string): string => {
  const node = HDNodeWallet
    .fromSeed(Buffer.from(seed, 'hex'))
    .derivePath('m');
  return node.publicKey
    .split('')
    .slice(2, 34)
    .join('');
};

export * from './mnemonic';
