import {
  APIEvent,
  ClientAPI,
  ConnectSiteParams,
  ConnectSiteResult,
  DisconnectSiteParams,
  DisconnectSiteResult,
  ExportKeyfileParams,
  ExportKeyfileResult,
  ExportPrivateKeyParams,
  ExportPrivateKeyResult,
  GenerateMnemonicResult,
  GetAccountBalancesParams,
  GetAccountBalancesResult,
  GetAccountTransactionsParams,
  GetAccountTransactionsResult,
  GetActiveAccountResult,
  GetActiveTabOriginResult, GetRpcEndpointParams, GetRpcEndpointResult,
  GetUserAccountResult,
  GetUserStatusResult,
  GetVersionResult,
  InsertCryptoAccountParams,
  InsertCryptoAccountResult,
  InsertHdWalletParams,
  InsertHdWalletResult,
  InsertLegacyWalletParams,
  InsertLegacyWalletResult,
  LockUserAccountResult,
  RegisterUserParams,
  RegisterUserResult,
  SaveActiveAccountParams,
  SaveActiveAccountResult,
  SaveFileParams,
  SendTransactionParams,
  SendTransactionResult,
  SignMessageParams,
  SignMessageResult,
  StakeNodeParams,
  StakeNodeResult,
  StartNewWalletResult,
  StartOnboardingResult,
  UnlockUserAccountParams,
  UnlockUserAccountResult,
  UpdateAccountNameParams,
  UpdateAccountNameResult,
  UpdateRpcEndpointParams,
  UpdateRpcEndpointResult,
  UpdateUserSettingsParams,
  UpdateUserSettingsResult,
  UpdateWalletNameParams,
  UpdateWalletNameResult,
  ValidateMnemonicParams,
  ValidateMnemonicResult,
} from '@decentralizedauthority/nodewallet-types';
import { Messager } from '@decentralizedauthority/nodewallet-util-browser';

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

  async insertLegacyWallet(params: InsertLegacyWalletParams): Promise<InsertLegacyWalletResult> {
    return await this._messager.send(APIEvent.INSERT_LEGACY_WALLET, params);
  }

  async insertCryptoAccount(params: InsertCryptoAccountParams): Promise<InsertCryptoAccountResult> {
    return await this._messager.send(APIEvent.INSERT_CRYPTO_ACCOUNT, params);
  }

  async lockUserAccount(): Promise<LockUserAccountResult> {
    return await this._messager.send(APIEvent.LOCK_USER_ACCOUNT);
  }

  async getAccountBalances(params?: GetAccountBalancesParams): Promise<GetAccountBalancesResult> {
    return await this._messager.send(APIEvent.GET_ACCOUNT_BALANCES, params || {});
  }

  async getAccountTransactions(params?: GetAccountTransactionsParams): Promise<GetAccountTransactionsResult> {
    return await this._messager.send(APIEvent.GET_ACCOUNT_TRANSACTIONS, params || {});
  }

  async sendTransaction(params: SendTransactionParams): Promise<SendTransactionResult> {
    return await this._messager.send(APIEvent.SEND_TRANSACTION, params);
  }

  async stakeNode(params: StakeNodeParams): Promise<StakeNodeResult> {
    return await this._messager.send(APIEvent.STAKE_NODE, params);
  }

  async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
    return await this._messager.send(APIEvent.SIGN_MESSAGE, params);
  }

  async saveActiveAccount(params: SaveActiveAccountParams): Promise<SaveActiveAccountResult> {
    return await this._messager.send(APIEvent.SAVE_ACTIVE_ACCOUNT, params);
  }

  async getActiveAccount(): Promise<GetActiveAccountResult> {
    return await this._messager.send(APIEvent.GET_ACTIVE_ACCOUNT);
  }

  async exportPrivateKey(params: ExportPrivateKeyParams): Promise<ExportPrivateKeyResult> {
    return await this._messager.send(APIEvent.EXPORT_PRIVATE_KEY, params);
  }

  async exportKeyfile(params: ExportKeyfileParams): Promise<ExportKeyfileResult> {
    return await this._messager.send(APIEvent.EXPORT_KEYFILE, params);
  }

  async saveFile(params: SaveFileParams): Promise<void> {
    return await this._messager.send(APIEvent.SAVE_FILE, params);
  }

  async connectSite(params: ConnectSiteParams): Promise<ConnectSiteResult> {
    return await this._messager.send(APIEvent.CONNECT_SITE, params);
  }

  async disconnectSite(params: DisconnectSiteParams): Promise<DisconnectSiteResult> {
    return await this._messager.send(APIEvent.DISCONNECT_SITE, params);
  }

  async getActiveTabOrigin(): Promise<GetActiveTabOriginResult> {
    return await this._messager.send(APIEvent.GET_ACTIVE_TAB_ORIGIN);
  }

  async getVersion(): Promise<GetVersionResult> {
    try {
      const manifest = chrome.runtime.getManifest();
      return {
        result: manifest.version,
      };
    } catch(err: any) {
      return {
        error: {
          message: err.message,
          stack: err.stack,
        },
      };
    }
  }

  async updateUserSettings(params: UpdateUserSettingsParams): Promise<UpdateUserSettingsResult> {
    return await this._messager.send(APIEvent.UPDATE_USER_SETTINGS, params);
  }

  async updateWalletName(params: UpdateWalletNameParams): Promise<UpdateWalletNameResult> {
    return await this._messager.send(APIEvent.UPDATE_WALLET_NAME, params);
  }

  async updateAccountName(params: UpdateAccountNameParams): Promise<UpdateAccountNameResult> {
    return await this._messager.send(APIEvent.UPDATE_ACCOUNT_NAME, params);
  }

  async updateRpcEndpoint(params: UpdateRpcEndpointParams): Promise<UpdateRpcEndpointResult> {
    return await this._messager.send(APIEvent.UPDATE_RPC_ENDPOINT, params);
  }

  async getRpcEndpoint(params: GetRpcEndpointParams): Promise<GetRpcEndpointResult> {
    return await this._messager.send(APIEvent.GET_RPC_ENDPOINT, params);
  }

}
