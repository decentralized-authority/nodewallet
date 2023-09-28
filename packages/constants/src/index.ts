export enum BackgroundListener {
  GET_LOGS = 'GET_LOGS',
  GENERATE_MNEMONIC = 'GENERATE_MNEMONIC',
}

export enum LocalStorageKey {
  LOGS = 'LOGS',
  USER_ACCOUNT = 'USER_ACCOUNT',
  HASH_SETTINGS = 'HASH_SETTINGS',
  KEY_SALT = 'KEY_SALT',
  ENCRYPTION_SETTINGS = 'ENCRYPTION_SETTINGS',
  SELECTED_CHAIN = 'SELECTED_CHAIN',
  ACTIVE_ACCOUNT = 'ACTIVE_ACCOUNT',
}
export enum SessionStorageKey {
  USER_ACCOUNT = 'USER_ACCOUNT',
  USER_KEY = 'USER_KEY',
  ENCRYPTION_SETTINGS = 'ENCRYPTION_SETTINGS',
  BALANCES = 'BALANCES',
  TRANSACTIONS = 'TRANSACTIONS',
}

export enum CoinType {
  POKT = 'POKT',
  ETH = 'ETH',
}
export enum ChainType {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}
export enum KeyType {
  ED25519 = 'ED25519',
  SECP256K1 = 'SECP256K1',
}

export enum AppLang {
  en = 'en',
}

export enum UserStatus {
  NOT_REGISTERED = 'NOT_REGISTERED',
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
}

export enum AlarmName {
  LOCK_USER_ACCOUNT = 'LOCK_USER_ACCOUNT',
}

export const POPUP_WIDTH = 400;
export const POPUP_HEIGHT = 600;

