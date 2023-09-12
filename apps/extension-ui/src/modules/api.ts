import {
  APIEvent,
  ClientAPI,
  GenerateMnemonicResult, GetAccountBalancesResult, GetActiveAccountResult,
  GetUserAccountResult,
  GetUserStatusResult,
  InsertCryptoAccountParams,
  InsertCryptoAccountResult,
  InsertHdWalletParams,
  InsertHdWalletResult,
  LockUserAccountResult,
  RegisterUserParams,
  RegisterUserResult, SaveActiveAccountParams, SaveActiveAccountResult, SendTransactionParams, SendTransactionResult,
  StartNewWalletResult,
  StartOnboardingResult,
  UnlockUserAccountParams,
  UnlockUserAccountResult,
  ValidateMnemonicParams,
  ValidateMnemonicResult,
} from '@nodewallet/types';
import { Messager } from '@nodewallet/util-browser';

export class API implements ClientAPI {

  _messager: Messager;

  constructor(messager: Messager) {
    this._messager = messager;
  }

  async startOnboarding(): Promise<StartOnboardingResult> {
    return await this._messager.send(APIEvent.START_ONBOARDING);
  }

  async startNewWallet(): Promise<StartNewWalletResult> {
    return await this._messager.send(APIEvent.START_NEW_WALLET);
  }

  async getUserStatus(): Promise<GetUserStatusResult> {
    return await this._messager.send(APIEvent.GET_USER_STATUS);
  }

  async registerUser(params: RegisterUserParams): Promise<RegisterUserResult> {
    return await this._messager.send(APIEvent.REGISTER_USER, params);
  }

  async unlockUserAccount(params: UnlockUserAccountParams): Promise<UnlockUserAccountResult> {
    return await this._messager.send(APIEvent.UNLOCK_USER_ACCOUNT, params);
  }

  async getUserAccount(): Promise<GetUserAccountResult> {
    return await this._messager.send(APIEvent.GET_USER_ACCOUNT);
  }

  async generateMnemonic(): Promise<GenerateMnemonicResult> {
    return await this._messager.send(APIEvent.GENERATE_MNEMONIC);
  }

  async validateMnemonic(params: ValidateMnemonicParams): Promise<ValidateMnemonicResult> {
    return await this._messager.send(APIEvent.VALIDATE_MNEMONIC, params);
  }

  async insertHdWallet(params: InsertHdWalletParams): Promise<InsertHdWalletResult> {
    return await this._messager.send(APIEvent.INSERT_HD_WALLET, params);
  }

  async insertCryptoAccount(params: InsertCryptoAccountParams): Promise<InsertCryptoAccountResult> {
    return await this._messager.send(APIEvent.INSERT_CRYPTO_ACCOUNT, params);
  }

  async lockUserAccount(): Promise<LockUserAccountResult> {
    return await this._messager.send(APIEvent.LOCK_USER_ACCOUNT);
  }

  async getAccountBalances(): Promise<GetAccountBalancesResult> {
    return await this._messager.send(APIEvent.GET_ACCOUNT_BALANCES);
  }

  async sendTransaction(params: SendTransactionParams): Promise<SendTransactionResult> {
    return await this._messager.send(APIEvent.SEND_TRANSACTION, params);
  }

  async saveActiveAccount(params: SaveActiveAccountParams): Promise<SaveActiveAccountResult> {
    return await this._messager.send(APIEvent.SAVE_ACTIVE_ACCOUNT, params);
  }

  async getActiveAccount(): Promise<GetActiveAccountResult> {
    return await this._messager.send(APIEvent.GET_ACTIVE_ACCOUNT);
  }

}
