import { ChainType, CoinType, UserStatus } from '@nodewallet/constants';
import { UserAccount } from './user';
import { CryptoAccount, UserWallet } from './wallet';

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
  SEND_TRANSACTION = 'SEND_TRANSACTION',
  SAVE_ACTIVE_ACCOUNT = 'SAVE_ACTIVE_ACCOUNT',
  GET_ACTIVE_ACCOUNT = 'GET_ACTIVE_ACCOUNT',
  EXPORT_PRIVATE_KEY = 'EXPORT_PRIVATE_KEY',
  EXPORT_KEYFILE = 'EXPORT_KEYFILE',
  SAVE_FILE = 'SAVE_FILE',
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

  sendTransaction(params: SendTransactionParams): Promise<SendTransactionResult>

  saveActiveAccount(params: SaveActiveAccountParams): Promise<SaveActiveAccountResult>

  getActiveAccount(): Promise<GetActiveAccountResult>

  exportPrivateKey(params: ExportPrivateKeyParams): Promise<ExportPrivateKeyResult>

  exportKeyfile(params: ExportKeyfileParams): Promise<ExportKeyfileResult>

  saveFile(params: SaveFileParams): Promise<void>

}
