import { StorageManager } from './storage-manager';
import {
  AES256GCMConfig,
  decrypt,
  defaultAES256GCMConfig,
  encryptAES256GCM,
  EncryptionResult,
  generateRandom
} from '@decentralizedauthority/nodewallet-util';

export class SessionSecretManager {

  static storageKey = 'SSM_STORAGE';
  static passKey = 'SSM_PASS';
  static settingsKey = 'SSM_SETTINGS';

  static generateItemKey(key: string): string {
    return `${SessionSecretManager.storageKey}_ITEM_${key}`;
  }

  private _sessionStorage: StorageManager;
  private _encryptionKey: string = '';
  private _encryptionSettings: AES256GCMConfig|null = null;

  constructor(sessionStorage: StorageManager) {
    this._sessionStorage = sessionStorage;
  }

  async initialize() {

    let settings: AES256GCMConfig|null = await this._sessionStorage.get(SessionSecretManager.settingsKey) || null;
    if(!settings) {
      settings = defaultAES256GCMConfig;
      await this._sessionStorage.set(SessionSecretManager.settingsKey, settings);
    }
    this._encryptionSettings = settings;

    let key: string = await this._sessionStorage.get(SessionSecretManager.passKey) || '';
    if(!key) {
      key = await generateRandom(settings.keyLength);
      await this._sessionStorage.set(SessionSecretManager.passKey, key);
    }
    this._encryptionKey = key;

  }

  isInitialized(): boolean {
    return !!this._encryptionKey && !!this._encryptionSettings;
  }

  private async _encrypt(value: string): Promise<EncryptionResult> {
    if(!this._encryptionSettings) {
      throw new Error('SessionSecretManager not initialized');
    }
    return await encryptAES256GCM(
      value,
      this._encryptionKey,
      this._encryptionSettings,
    );
  }

  private async _decrypt(encrypted: EncryptionResult): Promise<string> {
    if(!this._encryptionKey) {
      throw new Error('SessionSecretManager not initialized');
    }
    return await decrypt(
      encrypted,
      this._encryptionKey,
    );
  }

  async get(key: string): Promise<string|null> {
    const itemKey = SessionSecretManager.generateItemKey(key);
    const encrypted = await this._sessionStorage.get(itemKey);
    if(!encrypted) {
      return null;
    }
    return await this._decrypt(encrypted);
  }

  async set(key: string, value: string): Promise<void> {
    const itemKey = SessionSecretManager.generateItemKey(key);
    const encrypted = await this._encrypt(value);
    await this._sessionStorage.set(itemKey, encrypted);
  }

  async remove(key: string): Promise<void> {
    const itemKey = SessionSecretManager.generateItemKey(key);
    await this._sessionStorage.remove(itemKey);
  }

}
