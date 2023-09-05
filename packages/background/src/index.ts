import { AppLang, LocalStorageKey, UserStatus } from '@nodewallet/constants';
import { Logger } from './logger';
import { StorageManager } from './storage-manager';
import {
  APIEvent, GetUserAccountResult,
  GetUserStatusResult, RegisterUserParams,
  RegisterUserResult, StartNewWalletResult,
  StartOnboardingResult, UnlockUserAccountParams, UnlockUserAccountResult,
  UserAccount
} from '@nodewallet/types';
import { Messager } from '@nodewallet/util-browser';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  argon2,
  decrypt,
  defaultAES256GCMConfig,
  defaultArgon2Config,
  encryptAES256GCM, EncryptionResult,
  generateSalt
} from '@nodewallet/util';

const openTosTab = async () => {
  await chrome.tabs.create({
    active: true,
    url: chrome.runtime.getURL('index.html#tab'),
  });
};
const openNewWalletTab = async () => {
  await chrome.tabs.create({
    active: true,
    url: chrome.runtime.getURL('index.html#tab'),
  });
};

dayjs.extend(utc);

const messager = new Messager(chrome.runtime, true);

const storageManager = new StorageManager(chrome.storage.local);
const sessionManager = new StorageManager(chrome.storage.session);

let loggerInstance: Logger|null = null;

const getLogger = (): Logger => {
  if(!loggerInstance) {
    loggerInstance = new Logger(chrome.storage.local);
  }
  return loggerInstance;
};

export const startBackground = () => {

  const logger = getLogger();

  let userAccount: UserAccount|null = null;

  // messager.register(BackgroundListener.GET_LOGS, async () => {
  //   const logger = getLogger();
  //   const logs = logger.getLogs();
  //   return { logs };
  // });

  messager.register(APIEvent.START_ONBOARDING, async (): Promise<StartOnboardingResult> => {
    logger.info('Starting onboarding.');
    await openTosTab();
    return {
      result: true,
    };
  });

  messager.register(APIEvent.START_NEW_WALLET, async (): Promise<StartNewWalletResult> => {
    logger.info('Starting new wallet.');
    await openNewWalletTab();
    return {
      result: true,
    };
  });

  messager.register(APIEvent.GET_USER_STATUS, async (): Promise<GetUserStatusResult> => {
    if(userAccount) {
      return { result: UserStatus.UNLOCKED };
    }
    const res: string = await storageManager.get(LocalStorageKey.USER_ACCOUNT);
    if(res) {
      return { result: UserStatus.LOCKED };
    }
    return { result: UserStatus.NOT_REGISTERED };
  });

  messager.register(APIEvent.REGISTER_USER, async ({ password }: RegisterUserParams): Promise<RegisterUserResult> => {
    logger.info('Registering user.');
    const account: UserAccount = {
      language: AppLang.en,
      tosAccepted: dayjs.utc().toISOString(),
      settings: {
        showTestnets: false,
      },
      wallets: [],
    };

    const hashSettings = {
      ...defaultArgon2Config,
    };
    logger.info('Saving hash settings.');
    await storageManager.set(LocalStorageKey.HASH_SETTINGS, hashSettings);

    const encryptionSettings = {
      ...defaultAES256GCMConfig,
    };
    logger.info('Saving encryption settings.');
    await storageManager.set(LocalStorageKey.ENCRYPTION_SETTINGS, encryptionSettings);

    const salt = await generateSalt(encryptionSettings.keyLength);
    logger.info('Saving salt.');
    await storageManager.set(LocalStorageKey.KEY_SALT, salt);

    const key = await argon2(password, salt, encryptionSettings.keyLength, hashSettings);
    const encrypted = await encryptAES256GCM(account, key, encryptionSettings);

    logger.info('Saving encrypted user account.');
    await storageManager.set(LocalStorageKey.USER_ACCOUNT, encrypted);

    userAccount = account;
    return { result: account };
  });

  messager.register(APIEvent.UNLOCK_USER_ACCOUNT, async ({ password }: UnlockUserAccountParams): Promise<UnlockUserAccountResult> => {
    logger.info('Unlocking user account.');
    const encrypted: EncryptionResult = await storageManager.get(LocalStorageKey.USER_ACCOUNT);
    const hashSettings = await storageManager.get(LocalStorageKey.HASH_SETTINGS);
    const encryptionSettings = await storageManager.get(LocalStorageKey.ENCRYPTION_SETTINGS);
    const salt = await storageManager.get(LocalStorageKey.KEY_SALT);
    const key: string = await argon2(password, salt, encryptionSettings.keyLength, hashSettings);
    try {
      const decrypted: UserAccount = await decrypt(encrypted, key);
      userAccount = decrypted;
      return {result: decrypted};
    } catch(err) {
      return {result: null};
    }
  });

  messager.register(APIEvent.GET_USER_ACCOUNT, async (): Promise<GetUserAccountResult> => {
    if(!userAccount) {
      return {result: null};
    }
    return {result: userAccount};
  });

  chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    const logger = getLogger();
    if(reason === 'install') {
      logger.info('Extension installed!');
      await openTosTab();
    }
  });

};
