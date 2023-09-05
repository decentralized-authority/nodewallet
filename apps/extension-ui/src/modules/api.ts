import {
  APIEvent,
  ClientAPI,
  GenerateMnemonicResult,
  GetUserAccountResult,
  GetUserStatusResult, InsertCryptoAccountParams, InsertCryptoAccountResult, InsertHdWalletParams, InsertHdWalletResult,
  RegisterUserParams,
  RegisterUserResult,
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

}
