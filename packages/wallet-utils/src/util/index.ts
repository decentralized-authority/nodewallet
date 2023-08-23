import { HDNodeWallet } from 'ethers';
import { Account } from '../key-utils/ed25519';
import { HDNode } from '@sendnodes/hd-node';

export const hdNodeToAccount = (node: HDNodeWallet|HDNode): Account => {
  return {
    address: node.address,
    privateKey: node.privateKey,
    publicKey: node.publicKey,
    index: node.index,
  };
};

export * from './mnemonic';
