import { CryptoAccount, UserAccount } from '@nodewallet/types';
import { ChainType, CoinType } from '@nodewallet/constants';
import { AccountDetailParams } from './routes';

export * from './messager';
export * from './routes';

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

export const findCryptoAccountInUserAccountByAddress = (userAccount: UserAccount, walletId: string, networkId: CoinType, chain: ChainType, address: string): CryptoAccount|null => {
  const wallet = userAccount.wallets.find(w => w.id === walletId);
  const walletAccount = wallet?.accounts.find(a => a.network === networkId && a.chain === chain);
  const cryptoAccount = walletAccount?.accounts.find(a => a.address === address);
  return cryptoAccount || null;
};

export const getAccountDetailParamsFromUserAccount = (userAccount: UserAccount, accountId: string): AccountDetailParams|null => {
  for(const w of userAccount.wallets) {
    for(const wa of w.accounts) {
      for(const ca of wa.accounts) {
        if(ca.id === accountId) {
          return {
            walletId: w.id,
            networkId: wa.network,
            chainId: wa.chain,
            address: ca.address,
          };
        }
      }
    }
  }
  return null;
}
