import { ChainType, CoinType, UserStatus } from '@nodewallet/constants';
import { UserAccount, UserSettings } from './user';
import { CryptoAccount, UserWallet } from './wallet';
import { AccountTransaction } from './index';

export enum APIEvent {
  START_ONBOARDING = 'START_ONBOARDING',
  START_NEW_WALLET = 'START_NEW_WALLET',
  GET_USER_STATUS = 'GET_USER_STATUS',
  REGISTER_USER = 'REGISTER_USER',
  UNLOCK_USER_ACCOUNT = 'UNLOCK_USER_ACCOUNT',
  GET_USER_ACCOUNT = 'GET_USER_ACCOUNT',
  GENERATE_MNEMONIC = 'GENERATE_MNEMONIC',
  VALIDATE_MNEMONIC = 'VALIDATE_MNEMONIC',
  INSERT_HD_WALLET = 'INSERT_HD_WALLET',
  INSERT_LEGACY_WALLET = 'INSERT_LEGACY_WALLET',
  INSERT_CRYPTO_ACCOUNT = 'INSERT_CRYPTO_ACCOUNT',
  LOCK_USER_ACCOUNT = 'LOCK_USER_ACCOUNT',
  GET_ACCOUNT_BALANCES = 'GET_ACCOUNT_BALANCES',
  GET_ACCOUNT_TRANSACTIONS = 'GET_ACCOUNT_TRANSACTIONS',
  SEND_TRANSACTION = 'SEND_TRANSACTION',
  SAVE_ACTIVE_ACCOUNT = 'SAVE_ACTIVE_ACCOUNT',
  GET_ACTIVE_ACCOUNT = 'GET_ACTIVE_ACCOUNT',
  EXPORT_PRIVATE_KEY = 'EXPORT_PRIVATE_KEY',
  EXPORT_KEYFILE = 'EXPORT_KEYFILE',
  SAVE_FILE = 'SAVE_FILE',
  CONNECT_SITE = 'CONNECT_SITE',
  DISCONNECT_SITE = 'DISCONNECT_SITE',
  GET_ACTIVE_TAB_ORIGIN = 'GET_ACTIVE_TAB_ORIGIN',
  GET_VERSION = 'GET_VERSION',
  UPDATE_USER_SETTINGS = 'UPDATE_USER_SETTINGS',
}

export interface ErrorResult {
  error: {message: string, stack: string}
}

export type StartOnboardingResult = ErrorResult | {
  result: true
}
export type StartNewWalletResult = ErrorResult | {
  result: true
}
export type GetUserStatusResult = ErrorResult | {
  result: UserStatus
}
export interface RegisterUserParams {
  password: string
}
export type RegisterUserResult = ErrorResult | {
  result: UserAccount
}
export interface UnlockUserAccountParams {
  password: string
}
export type UnlockUserAccountResult = ErrorResult | {
  result: UserAccount|null
}
export type GetUserAccountResult = ErrorResult | {
  result: UserAccount|null
}
export type GenerateMnemonicResult = ErrorResult | {
  result: string
}
export interface ValidateMnemonicParams {
  mnemonic: string
}
export type ValidateMnemonicResult = ErrorResult | {
  result: boolean
}
export interface InsertHdWalletParams {
  mnemonic: string
}
interface InsertWalletResult {
  result: UserWallet
}
export type InsertHdWalletResult = ErrorResult | InsertWalletResult
export type InsertLegacyWalletParams = {
  network: CoinType
  chain: ChainType
  privateKey: string
} | {
  network: CoinType
  chain: ChainType
  privateKeyEncrypted: string
  privateKeyPassword: string
}
export type InsertLegacyWalletResult = ErrorResult | InsertWalletResult
export interface InsertCryptoAccountParams {
  walletId: string
  network: CoinType,
  chain: ChainType,
}
export type InsertCryptoAccountResult = ErrorResult | {
  result: CryptoAccount
}
export type LockUserAccountResult = ErrorResult | {
  result: true
}
export interface GetAccountBalancesParams {
  forceUpdate?: boolean
}
export type GetAccountBalancesResult = ErrorResult | {
  result: {[id: string]: string}
}
export interface GetAccountTransactionsParams {
  forceUpdate?: boolean
}
export type GetAccountTransactionsResult = ErrorResult | {
  result: {[id: string]: AccountTransaction[]}
}
export interface SendTransactionParams {
  accountId: string
  amount: string
  recipient: string
  memo?: string
}
export type SendTransactionResult = ErrorResult | {
  result: {
    txid: string
  }
}
export interface SaveActiveAccountParams {
  accountId: string
}
export type SaveActiveAccountResult = ErrorResult | {
  result: true
}
export type GetActiveAccountResult = ErrorResult | {
  result: string
}
export interface ExportPrivateKeyParams {
  password: string
  accountId: string
}
export type ExportPrivateKeyResult = ErrorResult | {
  result: string
}
export interface ExportKeyfileParams {
  password: string
  keyfilePassword: string
  accountId: string
}
export type ExportKeyfileResult = ErrorResult | {
  result: string
}
export interface SaveFileParams {
  filename: string
  url: string
}
export interface ConnectSiteParams {
  origin: string
}
export type ConnectSiteResult = ErrorResult | {
  result: boolean
}
export interface DisconnectSiteParams {
  origin: string
}
export type DisconnectSiteResult = ErrorResult | {
  result: boolean
}
export type GetActiveTabOriginResult = ErrorResult | {
  result: string
}
export type GetVersionResult = ErrorResult | {
  result: string
}
export type UpdateUserSettingsParams = Partial<UserSettings>
export type UpdateUserSettingsResult = ErrorResult | {
  result: UserSettings
}
export interface ClientAPI {

  startOnboarding(): Promise<StartOnboardingResult>

  startNewWallet(): Promise<StartNewWalletResult>

  getUserStatus(): Promise<GetUserStatusResult>

  registerUser(params: RegisterUserParams): Promise<RegisterUserResult>

  unlockUserAccount(params: UnlockUserAccountParams): Promise<UnlockUserAccountResult>

  getUserAccount(): Promise<GetUserAccountResult>

  generateMnemonic(): Promise<GenerateMnemonicResult>

  validateMnemonic(params: ValidateMnemonicParams): Promise<ValidateMnemonicResult>

  insertHdWallet(params: InsertHdWalletParams): Promise<InsertHdWalletResult>

  insertLegacyWallet(params: InsertLegacyWalletParams): Promise<InsertLegacyWalletResult>

  insertCryptoAccount(params: InsertCryptoAccountParams): Promise<InsertCryptoAccountResult>

  lockUserAccount(): Promise<LockUserAccountResult>

  getAccountBalances(params?: GetAccountBalancesParams): Promise<GetAccountBalancesResult>

  getAccountTransactions(params?: GetAccountTransactionsParams): Promise<GetAccountTransactionsResult>

  sendTransaction(params: SendTransactionParams): Promise<SendTransactionResult>

  saveActiveAccount(params: SaveActiveAccountParams): Promise<SaveActiveAccountResult>

  getActiveAccount(): Promise<GetActiveAccountResult>

  exportPrivateKey(params: ExportPrivateKeyParams): Promise<ExportPrivateKeyResult>

  exportKeyfile(params: ExportKeyfileParams): Promise<ExportKeyfileResult>

  saveFile(params: SaveFileParams): Promise<void>

  connectSite(params: ConnectSiteParams): Promise<ConnectSiteResult>

  disconnectSite(params: DisconnectSiteParams): Promise<DisconnectSiteResult>

  getActiveTabOrigin(): Promise<GetActiveTabOriginResult>

  getVersion(): Promise<GetVersionResult>

  updateUserSettings(params: UpdateUserSettingsParams): Promise<UpdateUserSettingsResult>

}
