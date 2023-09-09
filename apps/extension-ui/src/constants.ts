export enum routes {
  ROOT = '/',
  TOS = 'tos',
  WALLETS = 'wallets',
  ACCOUNT_DETAIL = 'wallets/:walletId/network/:networkId/chain/:chainId/account/:address',
  SEND = 'wallets/:walletId/network/:networkId/chain/:chainId/account/:address/send',
}

export enum AppView {
  BLANK = 'BLANK',
  ACCOUNT_DETAIL = 'ACCOUNT_DETAIL',
  MANAGE_WALLETS = 'MANAGE_WALLETS',
  NEW_HD_WALLET = 'NEW_HD_WALLET',
  SELECT_IMPORT_TYPE = 'SELECT_IMPORT_TYPE',
  TOS = 'TOS',
  REGISTER_ACCOUNT = 'REGISTER_ACCOUNT',
  SELECT_NEW_WALLET_TYPE = 'SELECT_NEW_WALLET_TYPE',
  UNLOCK_ACCOUNT = 'UNLOCK_ACCOUNT',
  SEND = 'SEND',
}

export const MAX_BODY_WIDTH = 1000;
export const POPUP_WIDTH = 400;
export const POPUP_HEIGHT = 600;

export const TOS_URL = process.env.REACT_APP_TOS_URL || '';

export const PASSWORD_MIN_LENGTH = 12;
