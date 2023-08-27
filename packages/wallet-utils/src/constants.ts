import bip44Constants from 'bip44-constants';

export enum ChainType {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}
export enum KeyType {
  ED25519 = 'ED25519',
  SECP256K1 = 'SECP256K1',
}

export const bip44TestnetType = '1';
