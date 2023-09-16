import {
  AlarmName,
  AppLang,
  ChainType,
  CoinType,
  LocalStorageKey,
  SessionStorageKey,
  UserStatus
} from '@nodewallet/constants';
import { Logger } from './logger';
import { StorageManager } from './storage-manager';
import {
  APIEvent,
  CryptoAccount, ExportKeyfileParams, ExportKeyfileResult, ExportPrivateKeyParams, ExportPrivateKeyResult,
  GenerateMnemonicResult,
  GetAccountBalancesParams,
  GetAccountBalancesResult, GetAccountTransactionsParams, GetAccountTransactionsResult,
  GetActiveAccountResult,
  GetUserAccountResult,
  GetUserStatusResult,
  InsertCryptoAccountParams,
  InsertCryptoAccountResult,
  InsertHdWalletParams,
  InsertHdWalletResult,
  InsertLegacyWalletParams,
  InsertLegacyWalletResult,
  LockUserAccountResult, AccountTransaction,
  RegisterUserParams,
  RegisterUserResult,
  SaveActiveAccountParams,
  SaveActiveAccountResult, SaveFileParams,
  SendTransactionParams,
  SendTransactionResult,
  StartNewWalletResult,
  StartOnboardingResult,
  UnlockUserAccountParams,
  UnlockUserAccountResult,
  UserAccount,
  UserWallet,
  ValidateMnemonicParams,
  ValidateMnemonicResult,
  WalletAccount
} from '@nodewallet/types';
import { Messager, prepMnemonic, RouteBuilder } from '@nodewallet/util-browser';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  AES256GCMConfig,
  argon2,
  decrypt as generalDecrypt,
  defaultAES256GCMConfig,
  defaultArgon2Config,
  defaultSeedBits,
  encryptAES256GCM,
  EncryptionResult,
  generateSalt
} from '@nodewallet/util';
import {
  ED25519Utils,
  generateMnemonic,
  isValidMnemonic,
  mnemonicToSeed,
  PoktUtils,
  seedToMasterId
} from '@nodewallet/wallet-utils';
import omit from 'lodash/omit';
import { SessionSecretManager } from './session-secret-manager';

interface ExtendedCryptoAccount extends CryptoAccount {
  privateKey: EncryptionResult
}
interface ExtendedWalletAccount extends WalletAccount {
  accounts: ExtendedCryptoAccount[]
}
interface ExtendedUserWallet extends UserWallet {
  seed: EncryptionResult
  accounts: ExtendedWalletAccount[]
}
interface ExtendedLegacyUserWallet extends UserWallet {
  accounts: ExtendedWalletAccount[]
}
interface ExtendedUserAccount extends UserAccount {
  wallets: (ExtendedUserWallet|ExtendedLegacyUserWallet)[]
}

const findCryptoAccountInUserAccount = (userAccount: ExtendedUserAccount, accountId: string): ExtendedCryptoAccount|null => {
  let cryptoAccount: ExtendedCryptoAccount|null = null;
  for(const wallet of userAccount.wallets) {
    for(const walletAccount of wallet.accounts) {
      for(const ca of walletAccount.accounts) {
        if(ca.id === accountId) {
          cryptoAccount = ca;
          break;
        }
      }
    }
  }
  return cryptoAccount;
};

const rpcEndpoints: {[network: string]: {[chain: string]: string}} = {
  [CoinType.POKT]: {
    [ChainType.MAINNET]: process.env.POKT_MAINNET_ENDPOINT ||'',
    [ChainType.TESTNET]: process.env.POKT_TESTNET_ENDPOINT ||'',
  }
};

const openTosTab = async () => {
  await chrome.tabs.create({
    active: true,
    url: chrome.runtime.getURL(`index.html#${RouteBuilder.tos.fullPath()}`),
  });
};
const openNewWalletTab = async () => {
  await chrome.tabs.create({
    active: true,
    url: chrome.runtime.getURL(`index.html#${RouteBuilder.selectNewWalletType.fullPath()}`),
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

const sessionSecretManager = new SessionSecretManager(sessionManager);
sessionSecretManager.initialize()
  .then(() => {
    const logger = getLogger();
    logger.info('SessionSecretManager initialized.');
  })
  .catch(console.error);

const resetLockTimer = () => {
  chrome.alarms.clear(AlarmName.LOCK_USER_ACCOUNT)
    .then(() => {
      chrome.alarms.create(AlarmName.LOCK_USER_ACCOUNT, {
        delayInMinutes: 5,
      }).catch(err => {
        console.error(err);
      });
    })
    .catch(err => {
      console.error(err);
    });
};

const sanitizeCryptoAccount = (account: ExtendedCryptoAccount): CryptoAccount => {
  return {
    ...omit(account, ['privateKey']),
  };
};
const sanitizeWalletAccount = (account: ExtendedWalletAccount): WalletAccount => {
  return {
    ...account,
    accounts: account.accounts
      .map((a): CryptoAccount => sanitizeCryptoAccount(a)),
  };
};
const sanitizeUserWallet = (wallet: ExtendedUserWallet|ExtendedLegacyUserWallet): UserWallet => {
  if('seed' in wallet) {
    return {
      ...omit(wallet, ['seed']),
      accounts: wallet.accounts
        .map((a): WalletAccount => sanitizeWalletAccount(a)),
    };
  } else {
    return {
      ...wallet,
      accounts: wallet.accounts
        .map((a): WalletAccount => sanitizeWalletAccount(a)),
    };
  }
};
const sanitizeUserAccount = (account: ExtendedUserAccount): UserAccount => {
  return {
    ...account,
    wallets: account.wallets
      .map((w): UserWallet => sanitizeUserWallet(w)),
  };
};

export const startBackground = () => {

  const logger = getLogger();

  const getUserAccount = async (): Promise<ExtendedUserAccount|null> => {
    return await sessionManager.get(SessionStorageKey.USER_ACCOUNT) || null;
  };
  const getUserKey = async (): Promise<string|null> => {
    return await sessionSecretManager.get(SessionStorageKey.USER_KEY) || null;
  };
  const getEncryptionSettings = async (): Promise<AES256GCMConfig|null> => {
    return await sessionManager.get(SessionStorageKey.ENCRYPTION_SETTINGS) || null;
  };

  const encrypt = async (data: any): Promise<EncryptionResult> => {
    const key = await getUserKey();
    const encryptionSettings = await getEncryptionSettings();
    if(!key || !encryptionSettings) {
      throw new Error('User account locked.');
    }
    return await encryptAES256GCM(data, key, encryptionSettings);
  };
  const decrypt = async (encrypted: EncryptionResult): Promise<any> => {
    const key = await getUserKey();
    if(!key) {
      throw new Error('User account locked.');
    }
    return await generalDecrypt(encrypted, key);
  };

  const encryptSaveUserAccount = async (account: ExtendedUserAccount) => {
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
    const userAccount = await getUserAccount();
    if(userAccount) {
      return { result: UserStatus.UNLOCKED };
    }
    const res: EncryptionResult|undefined = await storageManager.get(LocalStorageKey.USER_ACCOUNT);
    if(res) {
      return { result: UserStatus.LOCKED };
    }
    return { result: UserStatus.NOT_REGISTERED };
  });

  messager.register(APIEvent.REGISTER_USER, async ({ password }: RegisterUserParams): Promise<RegisterUserResult> => {
    logger.info('Registering user.');
    const account: ExtendedUserAccount = {
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
    await sessionManager.set(SessionStorageKey.ENCRYPTION_SETTINGS, encryptionSettings);

    const salt = await generateSalt(encryptionSettings.keyLength);
    logger.info('Saving salt.');
    await storageManager.set(LocalStorageKey.KEY_SALT, salt);

    const key = await argon2(password, salt, encryptionSettings.keyLength, hashSettings);
    await sessionSecretManager.set(SessionStorageKey.USER_KEY, key);

    logger.info('Saving encrypted user account.');
    await encryptSaveUserAccount(account);

    await sessionManager.set(SessionStorageKey.USER_ACCOUNT, account);
    return { result: sanitizeUserAccount(account) };
  });

  messager.register(APIEvent.UNLOCK_USER_ACCOUNT, async ({ password }: UnlockUserAccountParams): Promise<UnlockUserAccountResult> => {
    logger.info('Unlocking user account.');
    const encrypted: EncryptionResult = await storageManager.get(LocalStorageKey.USER_ACCOUNT);
    const hashSettings = await storageManager.get(LocalStorageKey.HASH_SETTINGS);
    const encryptionSettings = await storageManager.get(LocalStorageKey.ENCRYPTION_SETTINGS);
    await sessionManager.set(SessionStorageKey.ENCRYPTION_SETTINGS, encryptionSettings);
    const salt = await storageManager.get(LocalStorageKey.KEY_SALT);
    const key = await argon2(password, salt, encryptionSettings.keyLength, hashSettings);
    await sessionSecretManager.set(SessionStorageKey.USER_KEY, key);

    try {
      const decrypted: ExtendedUserAccount = await decrypt(encrypted);
      await sessionManager.set(SessionStorageKey.USER_ACCOUNT, decrypted);

      await Promise.all([
        updateBalances(),
        updateAccountTransactions(),
      ]);

      return { result: sanitizeUserAccount(decrypted) };
    } catch(err) {
      return {result: null};
    }
  });

  messager.register(APIEvent.GET_USER_ACCOUNT, async (): Promise<GetUserAccountResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      return {result: null};
    }
    return {result: sanitizeUserAccount(userAccount)};
  });

  messager.register(APIEvent.GENERATE_MNEMONIC, async (): Promise<GenerateMnemonicResult> => {
    const mnemonic = await generateMnemonic(defaultSeedBits);
    return {result: mnemonic};
  });

  messager.register(APIEvent.VALIDATE_MNEMONIC, async ({ mnemonic }: ValidateMnemonicParams): Promise<ValidateMnemonicResult> => {
    const prepped = prepMnemonic(mnemonic);
    return {result: isValidMnemonic(prepped)};
  });

  messager.register(APIEvent.INSERT_HD_WALLET, async ({ mnemonic }: InsertHdWalletParams): Promise<InsertHdWalletResult> => {
    const userAccount = await getUserAccount();
    const prepped = prepMnemonic(mnemonic);
    const isValid = isValidMnemonic(prepped);
    if(!isValid) {
      throw new Error('Invalid mnemonic passphrase.');
    } else if(!userAccount) {
      throw new Error('User account locked.');
    }
    const seed = await mnemonicToSeed(prepped);
    const encryptedSeed = await encrypt(seed);
    const id = seedToMasterId(seed);
    const found = userAccount.wallets.find(w => w.id === id);
    if(found) {
      throw new Error('Wallet already exists.');
    }
    const ed25519Utils = new ED25519Utils(PoktUtils.chainMeta[ChainType.MAINNET].derivationPath);
    const account0Node = await ed25519Utils.fromSeed(seed, 0);
    const encryptedPrivateKey = await encrypt(account0Node.privateKey);
    const newWallet: ExtendedUserWallet = {
      id,
      name: `HD Wallet ${userAccount.wallets.filter(w => !w.legacy).length + 1}`,
      createdAt: dayjs.utc().toISOString(),
      legacy: false,
      seed: encryptedSeed,
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
              privateKey: encryptedPrivateKey,
              publicKey: account0Node.publicKey,
            }
          ]
        },
      ],
    };
    userAccount.wallets.push(newWallet);
    await sessionManager.set(SessionStorageKey.USER_ACCOUNT, userAccount);
    await encryptSaveUserAccount(userAccount);
    Promise
      .all([
        updateBalances(),
        updateAccountTransactions(),
      ])
      .catch(err => {
        console.error(err);
      });
    return {result: sanitizeUserWallet(newWallet)};
  });

  messager.register(APIEvent.INSERT_LEGACY_WALLET, async (params: InsertLegacyWalletParams): Promise<InsertLegacyWalletResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const { chain, network } = params;
    let privateKey: string;
    if('privateKeyEncrypted' in params) {
      const res = await PoktUtils.getAccountFromEncryptedPrivateKey(
        params.privateKeyEncrypted.trim(),
        params.privateKeyPassword.trim(),
      );
      privateKey = res.privateKey;
    } else {
      privateKey = params.privateKey.trim();
    }
    const account = await PoktUtils.getAccountFromPrivateKey(privateKey);
    const encryptedPrivateKey = await encrypt(privateKey);
    const cryptoAccount: ExtendedCryptoAccount = {
      id: generateCryptoAccountId(CoinType.POKT, chain, account.address),
      name: `${CoinType.POKT} Account ${account.address.slice(-4)}`,
      network,
      chain,
      derivationPath: '',
      index: -1,
      address: account.address,
      privateKey: encryptedPrivateKey,
      publicKey: account.publicKey,
    };
    const walletId = `${account.address}-${chain}`;
    const prev = userAccount.wallets.find(w => w.id === walletId);
    if(prev) {
      throw new Error('Wallet already exists.');
    }
    const legacyWalletCount = userAccount.wallets
      .filter(w => w.legacy)
      .filter(w => w.accounts.some(a => a.network === network && a.chain === chain))
      .length;
    const newWallet: ExtendedLegacyUserWallet = {
      id: walletId,
      name: `Legacy Wallet ${legacyWalletCount + 1}`,
      createdAt: dayjs.utc().toISOString(),
      legacy: true,
      language: userAccount.language,
      accounts: [
        {
          network,
          chain,
          accounts: [
            cryptoAccount,
          ],
        },
      ],
    };
    userAccount.wallets.push(newWallet);
    await sessionManager.set(SessionStorageKey.USER_ACCOUNT, userAccount);
    await encryptSaveUserAccount(userAccount);
    Promise
      .all([
        updateBalances(),
        updateAccountTransactions(),
      ])
      .catch(err => {
        console.error(err);
      });
    return {result: sanitizeUserWallet(newWallet)};
  });

  messager.register(APIEvent.INSERT_CRYPTO_ACCOUNT, async ({ walletId, network, chain }: InsertCryptoAccountParams): Promise<InsertCryptoAccountResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const walletIdx = userAccount.wallets.findIndex(w => w.id === walletId);
    if(walletIdx < 0) {
      throw new Error('Wallet not found.');
    }
    let walletAccountIdx = userAccount.wallets[walletIdx].accounts.findIndex(a => a.network === network && a.chain === chain);
    if(walletAccountIdx < 0) {
      const newLength = userAccount.wallets[walletIdx].accounts.push({
        network,
        chain,
        accounts: [],
      });
      walletAccountIdx = newLength - 1;
    }
    const lastDerivationIdx = userAccount.wallets[walletIdx].accounts[walletAccountIdx].accounts
      .reduce((num, a) => {
        return a.index > num ? a.index : num;
      }, -1);
    const ed25519Utils = new ED25519Utils(PoktUtils.chainMeta[chain].derivationPath);
    if('seed' in userAccount.wallets[walletIdx]) {
      // @ts-ignore
      const seed = await decrypt(userAccount.wallets[walletIdx].seed);
      if(!seed) {
        throw new Error('Wallet seed not found.');
      }
      const accountNode = await ed25519Utils.fromSeed(seed, lastDerivationIdx + 1);
      const encryptedPrivateKey = await encrypt(accountNode.privateKey);
      const newCryptAccount: ExtendedCryptoAccount = {
        id: generateCryptoAccountId(network, chain, accountNode.address),
        name: `${network} Account ${accountNode.index + 1}`,
        network,
        chain,
        derivationPath: ed25519Utils.pathAtIdx(accountNode.index),
        index: accountNode.index,
        address: accountNode.address,
        privateKey: encryptedPrivateKey,
        publicKey: accountNode.publicKey,
      };
      userAccount.wallets[walletIdx].accounts[walletAccountIdx].accounts.push(newCryptAccount);
      await sessionManager.set(SessionStorageKey.USER_ACCOUNT, userAccount);
      await encryptSaveUserAccount(userAccount);
      return {result: sanitizeCryptoAccount(newCryptAccount)};
    } else {
      throw new Error('You cannot insert new accounts into legacy wallets.');
    }
  });

  const lockUserAccount = async (): Promise<void> => {
    await sessionManager.remove(SessionStorageKey.USER_ACCOUNT);
    await sessionSecretManager.remove(SessionStorageKey.USER_KEY);
    await sessionManager.remove(SessionStorageKey.ENCRYPTION_SETTINGS);
  };

  messager.register(APIEvent.LOCK_USER_ACCOUNT, async (): Promise<LockUserAccountResult> => {
    await lockUserAccount();
    return {result: true};
  });

  const updateBalances = async (): Promise<void> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      return;
    }
    const balances: {[id: string]: string} = {};
    const promises: Promise<void>[] = [];
    for(const wallet of userAccount.wallets) {
      for(const walletAccount of wallet.accounts) {
        for(const account of walletAccount.accounts) {
          promises.push((async () => {
            switch(account.network) {
              case CoinType.POKT: {
                const endpoint = rpcEndpoints[account.network][account.chain];
                if(!endpoint) {
                  balances[account.id] = '0';
                } else {
                  try {
                    const res = await PoktUtils.getBalance(endpoint, account.address);
                    balances[account.id] = PoktUtils.fromBaseDenom(res).toString();
                  } catch(err) {
                    balances[account.id] = '0';
                  }
                }
                break;
              } default: {
                balances[account.id] = '0';
              }
            }
          })());
        }
      }
    }
    await Promise.all(promises);
    await sessionManager.set(SessionStorageKey.BALANCES, balances);
  };
  setInterval(updateBalances, 30000);

  messager.register(APIEvent.GET_ACCOUNT_BALANCES, async (params?: GetAccountBalancesParams): Promise<GetAccountBalancesResult> => {
    let balances = await sessionManager.get(SessionStorageKey.BALANCES);
    if(!balances || params?.forceUpdate) {
      await updateBalances();
      balances = await sessionManager.get(SessionStorageKey.BALANCES) || {};
    }
    return {result: balances};
  });

  const updateAccountTransactions = async (): Promise<void> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      return;
    }
    const transactions: {[id: string]: any[]} = {};
    const total = 10;
    const promises: Promise<void>[] = [];
    for(const wallet of userAccount.wallets) {
      for(const walletAccount of wallet.accounts) {
        for(const account of walletAccount.accounts) {
          promises.push((async () => {
            switch(account.network) {
              case CoinType.POKT: {
                const endpoint = rpcEndpoints[account.network][account.chain];
                if(!endpoint) {
                  transactions[account.id] = [];
                } else {
                  try {
                    transactions[account.id] = await PoktUtils.getTransactions(endpoint, account.address, total);
                  } catch(err) {
                    transactions[account.id] = [];
                  }
                }
                break;
              } default: {
                transactions[account.id] = [];
              }
            }
          })());
        }
      }
    }
    await Promise.all(promises);
    await sessionManager.set(SessionStorageKey.TRANSACTIONS, transactions);
  };
  setInterval(updateAccountTransactions, 60000);

  messager.register(APIEvent.GET_ACCOUNT_TRANSACTIONS, async (params?: GetAccountTransactionsParams): Promise<GetAccountTransactionsResult> => {
    let transactions = await sessionManager.get(SessionStorageKey.TRANSACTIONS);
    if(!transactions || params?.forceUpdate) {
      await updateAccountTransactions();
      transactions = await sessionManager.get(SessionStorageKey.TRANSACTIONS) || {};
    }
    return {result: transactions};
  });

  messager.register(APIEvent.SEND_TRANSACTION, async (params: SendTransactionParams): Promise<SendTransactionResult> => {
    const { accountId, amount, recipient, memo } = params;
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const cryptoAccount = findCryptoAccountInUserAccount(userAccount, accountId);
    if(!cryptoAccount) {
      throw new Error('Account not found.');
    }
    switch(cryptoAccount.network) {
      case CoinType.POKT: {
        const endpoint = rpcEndpoints[cryptoAccount.network][cryptoAccount.chain];
        if(!endpoint) {
          throw new Error(`${cryptoAccount.network} ${cryptoAccount.chain} endpoint not found.`);
        } else if(!cryptoAccount.privateKey) {
          throw new Error('Private key not found.');
        }
        const privateKey = await decrypt(cryptoAccount.privateKey);
        const res = await PoktUtils.send(
          endpoint,
          privateKey,
          recipient,
          cryptoAccount.chain,
          PoktUtils.toBaseDenom(amount),
          memo
        );
        return {
          result: {
            txid: res,
          },
        };
      } default: {
        throw new Error('Unsupported network.');
      }
    }
  });

  messager.register(APIEvent.SAVE_ACTIVE_ACCOUNT, async (params: SaveActiveAccountParams): Promise<SaveActiveAccountResult> => {
    const { accountId } = params;
    const encrypted = await encrypt(accountId);
    await storageManager.set(LocalStorageKey.ACTIVE_ACCOUNT, encrypted);
    return {result: true};
  });

  messager.register(APIEvent.GET_ACTIVE_ACCOUNT, async (): Promise<GetActiveAccountResult> => {
    try {
      const encrypted = await storageManager.get(LocalStorageKey.ACTIVE_ACCOUNT);
      if(!encrypted) {
        return {result: ''};
      }
      const decrypted = await decrypt(encrypted);
      return {result: decrypted};
    } catch(err) {
      return {result: ''};
    }
  });

  messager.register(APIEvent.EXPORT_PRIVATE_KEY, async (params: ExportPrivateKeyParams): Promise<ExportPrivateKeyResult> => {
    const { accountId } = params;
    const password = params.password.trim();
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const cryptoAccount = findCryptoAccountInUserAccount(userAccount, accountId);
    if(!cryptoAccount) {
      throw new Error('Account not found.');
    }
    switch(cryptoAccount.network) {
      case CoinType.POKT: {
        if(!cryptoAccount.privateKey) {
          throw new Error('Private key not found.');
        }
        const hashSettings = await storageManager.get(LocalStorageKey.HASH_SETTINGS);
        const encryptionSettings = await storageManager.get(LocalStorageKey.ENCRYPTION_SETTINGS);
        const salt = await storageManager.get(LocalStorageKey.KEY_SALT);
        const key = await argon2(password, salt, encryptionSettings.keyLength, hashSettings);
        const privateKey = await generalDecrypt(cryptoAccount.privateKey, key);
        return {
          result: privateKey,
        };
      } default: {
        throw new Error('Unsupported network.');
      }
    }
  });

  messager.register(APIEvent.EXPORT_KEYFILE, async (params: ExportKeyfileParams): Promise<ExportKeyfileResult> => {
    const { accountId } = params;
    const password = params.password.trim();
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const cryptoAccount = findCryptoAccountInUserAccount(userAccount, accountId);
    if(!cryptoAccount) {
      throw new Error('Account not found.');
    }
    switch(cryptoAccount.network) {
      case CoinType.POKT: {
        if(!cryptoAccount.privateKey) {
          throw new Error('Private key not found.');
        }
        const hashSettings = await storageManager.get(LocalStorageKey.HASH_SETTINGS);
        const encryptionSettings = await storageManager.get(LocalStorageKey.ENCRYPTION_SETTINGS);
        const salt = await storageManager.get(LocalStorageKey.KEY_SALT);
        const key = await argon2(password, salt, encryptionSettings.keyLength, hashSettings);
        const privateKey = await generalDecrypt(cryptoAccount.privateKey, key);
        const encrypted = await PoktUtils.encryptExportPrivateKey(privateKey, password);
        return {
          result: encrypted,
        };
      } default: {
        throw new Error('Unsupported network.');
      }
    }
  });

  messager.register(APIEvent.SAVE_FILE, async ({ filename, url }: SaveFileParams): Promise<void> => {
    await chrome.downloads.download({
      saveAs: true,
      url,
      filename,
    });
  });

  chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    const logger = getLogger();
    if(reason === 'install') {
      logger.info('Extension installed!');
      await openTosTab();
    }
  });

  chrome.runtime.onMessage.addListener(() => {
    resetLockTimer();
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    switch(alarm.name) {
      case AlarmName.LOCK_USER_ACCOUNT: {
        await lockUserAccount();
        break;
      }
    }
  });

};
