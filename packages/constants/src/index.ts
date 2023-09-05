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
