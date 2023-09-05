import { AppLang, ChainType, CoinType, LocalStorageKey, UserStatus } from '@nodewallet/constants';
import { Logger } from './logger';
import { StorageManager } from './storage-manager';
import {
  APIEvent, CryptoAccount, GetUserAccountResult,
  GetUserStatusResult, InsertHdWalletParams, InsertHdWalletResult, RegisterUserParams,
  RegisterUserResult, StartNewWalletResult,
  StartOnboardingResult, UnlockUserAccountParams, UnlockUserAccountResult,
  UserAccount, UserWallet, ValidateMnemonicParams, ValidateMnemonicResult, WalletAccount
} from '@nodewallet/types';
import { Messager, prepMnemonic } from '@nodewallet/util-browser';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  AES256GCMConfig,
  argon2, Argon2Config,
  decrypt as generalDecrypt,
  defaultAES256GCMConfig,
  defaultArgon2Config,
  encryptAES256GCM, EncryptionResult,
  generateSalt
} from '@nodewallet/util';
import { ED25519Utils, isValidMnemonic, mnemonicToSeed, PoktUtils, seedToMasterId } from '@nodewallet/wallet-utils';
import omit from 'lodash/omit';

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
const generateCryptoAccountId = (network: CoinType, chain: ChainType, address: string): string => {
  return `${network}-${chain}-${address}`;
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

type EncryptFunc = (data: any)=>Promise<EncryptionResult>;
type DecryptFunc = (encrypted: EncryptionResult)=>Promise<any>
const generateEncryptionFuncs = async (password: string, salt: string, hashSettings: Argon2Config, encryptionSettings: AES256GCMConfig): Promise<[EncryptFunc, DecryptFunc]> => {

  const key = await argon2(password, salt, encryptionSettings.keyLength, hashSettings);

  return [
    async (data: any) => {
      return await encryptAES256GCM(data, key, encryptionSettings);
    },
    async (encrypted: EncryptionResult) => {
      return await generalDecrypt(encrypted, key);
    }
  ]
};

const sanitizeCryptoAccount = (account: CryptoAccount): CryptoAccount => {
  return {
    ...omit(account, ['privateKey']),
  };
};
const sanitizeWalletAccount = (account: WalletAccount): WalletAccount => {
  return {
    ...account,
    accounts: account.accounts
      .map((a): CryptoAccount => sanitizeCryptoAccount(a)),
  };
};
const sanitizeUserWallet = (wallet: UserWallet): UserWallet => {
  return {
    ...omit(wallet, ['passphrase']),
    accounts: wallet.accounts
      .map((a): WalletAccount => sanitizeWalletAccount(a)),
  };
};
const sanitizeUserAccount = (account: UserAccount): UserAccount => {
  return {
    ...account,
    wallets: account.wallets
      .map((w): UserWallet => sanitizeUserWallet(w)),
  };
};

export const startBackground = () => {

  const logger = getLogger();

  let userAccount: UserAccount|null = null;

  let encrypt: EncryptFunc|null = null;
  let decrypt: DecryptFunc|null = null;

  const encryptSaveUserAccount = async (account: UserAccount) => {
    if(!encrypt) {
      throw new Error('Encryption functions not initialized.');
    }
    const encrypted = await encrypt(account);
    await storageManager.set(LocalStorageKey.USER_ACCOUNT, encrypted);
  }

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

    const encryptionFuncs = await generateEncryptionFuncs(password, salt, hashSettings, encryptionSettings);
    encrypt = encryptionFuncs[0];
    decrypt = encryptionFuncs[1];
    const encrypted = await encrypt(account);

    logger.info('Saving encrypted user account.');
    await encryptSaveUserAccount(account);

    userAccount = account;
    return { result: sanitizeUserAccount(account) };
  });

  messager.register(APIEvent.UNLOCK_USER_ACCOUNT, async ({ password }: UnlockUserAccountParams): Promise<UnlockUserAccountResult> => {
    logger.info('Unlocking user account.');
    const encrypted: EncryptionResult = await storageManager.get(LocalStorageKey.USER_ACCOUNT);
    const hashSettings = await storageManager.get(LocalStorageKey.HASH_SETTINGS);
    const encryptionSettings = await storageManager.get(LocalStorageKey.ENCRYPTION_SETTINGS);
    const salt = await storageManager.get(LocalStorageKey.KEY_SALT);

    const encryptionFuncs = await generateEncryptionFuncs(password, salt, hashSettings, encryptionSettings);
    encrypt = encryptionFuncs[0];
    decrypt = encryptionFuncs[1];

    try {
      const decrypted: UserAccount = await decrypt(encrypted);
      userAccount = decrypted;
      return { result: sanitizeUserAccount(decrypted) };
    } catch(err) {
      return {result: null};
    }
  });

  messager.register(APIEvent.GET_USER_ACCOUNT, async (): Promise<GetUserAccountResult> => {
    if(!userAccount) {
      return {result: null};
    }
    return {result: sanitizeUserAccount(userAccount)};
  });

  messager.register(APIEvent.VALIDATE_MNEMONIC, async ({ mnemonic }: ValidateMnemonicParams): Promise<ValidateMnemonicResult> => {
    const prepped = prepMnemonic(mnemonic);
    return {result: isValidMnemonic(prepped)};
  });

  messager.register(APIEvent.INSERT_HD_WALLET, async ({ mnemonic }: InsertHdWalletParams): Promise<InsertHdWalletResult> => {
    const prepped = prepMnemonic(mnemonic);
    const isValid = isValidMnemonic(prepped);
    if(!isValid) {
      throw new Error('Invalid mnemonic passphrase.');
    } else if(!userAccount) {
      throw new Error('User account locked.');
    }
    const seed = await mnemonicToSeed(prepped);
    const id = seedToMasterId(seed);
    const found = userAccount.wallets.find(w => w.id === id);
    if(found) {
      throw new Error('Wallet already exists.');
    }
    const ed25519Utils = new ED25519Utils(PoktUtils.chainMeta[ChainType.MAINNET].derivationPath);
    const account0Node = await ed25519Utils.fromSeed(seed, 0);
    const newWallet: UserWallet = {
      id,
      name: `HD Wallet ${userAccount.wallets.filter(w => !w.legacy).length + 1}`,
      createdAt: dayjs.utc().toISOString(),
      legacy: false,
      passphrase: prepped,
      language: userAccount.language,
      accounts: [
        {
          network: CoinType.POKT,
          chain: ChainType.MAINNET,
          accounts: [
            {
              id: generateCryptoAccountId(CoinType.POKT, ChainType.MAINNET, account0Node.address),
              name: `${CoinType.POKT} Account ${account0Node.index + 1}`,
              network: CoinType.POKT,
              chain: ChainType.MAINNET,
              derivationPath: ed25519Utils.pathAtIdx(0),
              index: account0Node.index,
              address: account0Node.address,
              privateKey: account0Node.privateKey,
              publicKey: account0Node.publicKey,
            }
          ]
        },
      ],
    };
    userAccount.wallets.push(newWallet);
    await encryptSaveUserAccount(userAccount);
    return {result: sanitizeUserWallet(newWallet)};
  });

  chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    const logger = getLogger();
    if(reason === 'install') {
      logger.info('Extension installed!');
      await openTosTab();
    }
  });

};
