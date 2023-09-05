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
  INSERT_CRYPTO_ACCOUNT = 'INSERT_CRYPTO_ACCOUNT',
  LOCK_USER_ACCOUNT = 'LOCK_USER_ACCOUNT',
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
export type InsertHdWalletResult = ErrorResult | {
  result: UserWallet
}
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

  insertCryptoAccount(params: InsertCryptoAccountParams): Promise<InsertCryptoAccountResult>

  lockUserAccount(): Promise<LockUserAccountResult>

}
