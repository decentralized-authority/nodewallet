import { UserStatus } from '@nodewallet/constants';
import { UserAccount } from './user';

export enum APIEvent {
  START_ONBOARDING = 'START_ONBOARDING',
  START_NEW_WALLET = 'START_NEW_WALLET',
  GET_USER_STATUS = 'GET_USER_STATUS',
  REGISTER_USER = 'REGISTER_USER',
  UNLOCK_USER_ACCOUNT = 'UNLOCK_USER_ACCOUNT',
  GET_USER_ACCOUNT = 'GET_USER_ACCOUNT',
  GENERATE_MNEMONIC = 'GENERATE_MNEMONIC',
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
export interface ClientAPI {

  startOnboarding(): Promise<StartOnboardingResult>

  startNewWallet(): Promise<StartNewWalletResult>

  getUserStatus(): Promise<GetUserStatusResult>

  registerUser(params: RegisterUserParams): Promise<RegisterUserResult>

  unlockUserAccount(params: UnlockUserAccountParams): Promise<UnlockUserAccountResult>

  getUserAccount(): Promise<GetUserAccountResult>

  generateMnemonic(): Promise<GenerateMnemonicResult>

}
