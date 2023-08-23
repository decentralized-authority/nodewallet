import { HDNodeWallet } from 'ethers';
import { Account } from '../key-utils/secp256k1';

export const hdNodeToAccount = (node: HDNodeWallet): Account => {
  return {
    address: node.address,
    privateKey: node.privateKey,
    publicKey: node.publicKey,
    index: node.index,
  };
};

export * from './mnemonic';
