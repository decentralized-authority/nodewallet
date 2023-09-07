import { CryptoAccount, UserAccount } from '@nodewallet/types';

export * from './messager';

export const splitMnemonic = (mnemonic: string): string[] => {
  return mnemonic
    .split(/\s+/g)
    .map(s => s.trim())
    .filter(s => !!s);
};
export const joinMnemonic = (mnemonic: string[]): string => {
  return mnemonic.join(' ');
};
export const prepMnemonic = (mnemonic: string): string => {
  return joinMnemonic(splitMnemonic(mnemonic));
}
export const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const isHex = (str: string): boolean => {
  const prepped = /^0x/.test(str) ? str.slice(2) : str;
  return /^[0-9a-f]+$/i.test(prepped);
};

export const findCryptoAccountInUserAccount = (userAccount: UserAccount, accountId: string): CryptoAccount|null => {
  let cryptoAccount: CryptoAccount|null = null;
  for(const wallet of userAccount.wallets) {
    for(const walletAccount of wallet.accounts) {
      for(const ca of walletAccount.accounts) {
        if(ca.id === accountId) {
          cryptoAccount = ca;
          break;
        }
      }
    }
  }
  return cryptoAccount;
};
