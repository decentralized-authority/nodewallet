export enum AppView {
  ACCOUNT_DETAIL = 'ACCOUNT_DETAIL',
  MANAGE_WALLETS = 'MANAGE_WALLETS',
  NEW_HD_WALLET = 'NEW_HD_WALLET',
  SELECT_IMPORT_TYPE = 'SELECT_IMPORT_TYPE',
  TOS = 'TOS',
  REGISTER = 'REGISTER',
}

export const MAX_BODY_WIDTH = 1000;
export const POPUP_WIDTH = 400;
export const POPUP_HEIGHT = 600;

export const TOS_URL = process.env.REACT_APP_TOS_URL || '';
