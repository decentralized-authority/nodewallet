import {
  AlarmName,
  AppLang,
  ChainType,
  CoinType,
  defaultHideTestnets,
  defaultLockTimeout,
  LocalStorageKey,
  POPUP_HEIGHT,
  POPUP_WIDTH,
  SessionStorageKey,
  UserStatus
} from '@decentralizedauthority/nodewallet-constants';
import { Logger } from './logger';
import { StorageManager } from './storage-manager';
import {
  AllowedOrigin,
  APIEvent,
  ConnectSiteParams,
  ConnectSiteResult,
  ContentAPIEvent,
  CryptoAccount, DeleteWalletParams, DeleteWalletResult,
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
  GetActiveTabOriginResult,
  GetBalanceParams,
  GetBalanceResult,
  GetHeightParams,
  GetHeightResult, GetRpcEndpointParams, GetRpcEndpointResult,
  GetTransactionParams,
  GetTransactionResult,
  GetUserAccountResult,
  GetUserStatusResult,
  InsertCryptoAccountParams,
  InsertCryptoAccountResult,
  InsertHdWalletParams,
  InsertHdWalletResult,
  InsertLegacyWalletParams,
  InsertLegacyWalletResult,
  LockUserAccountResult,
  PoktRpcGetAccountParams,
  PoktRpcGetAccountResult,
  PoktRpcGetAppParams,
  PoktRpcGetAppResult,
  PoktRpcGetBalanceParams,
  PoktRpcGetBalanceResult,
  PoktRpcGetBlockNumberParams,
  PoktRpcGetBlockNumberResult,
  PoktRpcGetBlockParams,
  PoktRpcGetBlockResult,
  PoktRpcGetNodeParams,
  PoktRpcGetNodeResult,
  PoktRpcGetTransactionParams,
  PoktRpcGetTransactionResult,
  RegisterUserParams,
  RegisterUserResult,
  RequestAccountParams,
  RequestAccountResult,
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
  UpdateAccountNameResult, UpdateRpcEndpointParams, UpdateRpcEndpointResult,
  UpdateUserSettingsParams,
  UpdateUserSettingsResult,
  UpdateWalletNameParams,
  UpdateWalletNameResult,
  UserAccount,
  UserSettings,
  UserWallet,
  ValidateMnemonicParams,
  ValidateMnemonicResult,
  WalletAccount,
} from '@decentralizedauthority/nodewallet-types';
import {
  getHostFromOrigin,
  Messager,
  prepMnemonic,
  RouteBuilder
} from '@decentralizedauthority/nodewallet-util-browser';
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
} from '@decentralizedauthority/nodewallet-util';
import {
  ED25519Utils,
  generateMnemonic,
  isValidMnemonic,
  mnemonicToSeed,
  PoktUtils,
  seedToMasterId
} from '@decentralizedauthority/nodewallet-wallet-utils';
import omit from 'lodash/omit';
import { SessionSecretManager } from './session-secret-manager';
import isNumber from 'lodash/isNumber';
import MessageSender = chrome.runtime.MessageSender;

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

interface ExtendedCryptoAccountWithWalletId extends ExtendedCryptoAccount {
  walletId: string
}
const findCryptoAccountInUserAccountWithWalletId = (userAccount: ExtendedUserAccount, accountId: string): ExtendedCryptoAccountWithWalletId|null => {
  let cryptoAccount: ExtendedCryptoAccountWithWalletId|null = null;
  for(const wallet of userAccount.wallets) {
    for(const walletAccount of wallet.accounts) {
      for(const ca of walletAccount.accounts) {
        if(ca.id === accountId) {
          cryptoAccount = {
            ...ca,
            walletId: wallet.id,
          }
          break;
        }
      }
    }
  }
  return cryptoAccount;
};

const rpcEndpointss: {[network: string]: {[chain: string]: string}} = {
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
const splitCryptoAccountId = (accountId: string): {network: CoinType, chain: ChainType, address: string} => {
  const [ network, chain, address ] = accountId.split('-') as [CoinType, ChainType, string];
  return {
    network,
    chain,
    address,
  };
};

dayjs.extend(utc);

const messager = new Messager(chrome.runtime, true);

const storageManager = new StorageManager(chrome.storage.local);
const sessionManager = new StorageManager(chrome.storage.session);

const getRpcEndpoint = async (network: CoinType, chain: ChainType): Promise<string> => {
  if (network == CoinType.POKT && chain == ChainType.MAINNET) {
    const customEndpoint = await storageManager.get(LocalStorageKey.POKT_MAINNET_ENDPOINT);
    return customEndpoint || rpcEndpointss[network][chain];
  } else if (network == CoinType.POKT && chain == ChainType.TESTNET) {
    const customEndpoint = await storageManager.get(LocalStorageKey.POKT_TESTNET_ENDPOINT);
    return customEndpoint || rpcEndpointss[network][chain];
  }
  return '';
};

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

  const resetLockTimer = async () => {
    const userAccount = await getUserAccount();
    if(userAccount) {
      const timeout = isNumber(userAccount.settings.lockTimeout) ? userAccount.settings.lockTimeout : defaultLockTimeout;
      chrome.alarms.clear(AlarmName.LOCK_USER_ACCOUNT)
        .then(() => {
          chrome.alarms.create(AlarmName.LOCK_USER_ACCOUNT, {
            delayInMinutes: timeout,
          }).catch(err => {
            console.error(err);
          });
        })
        .catch(err => {
          console.error(err);
        });
    }
  };

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
      allowedOrigins: [],
      settings: {
        hideTestnets: defaultHideTestnets,
        lockTimeout: defaultLockTimeout,
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

      await resetLockTimer();

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
    let walletCount = userAccount.wallets.filter(w => !w.legacy).length;
    let walletName = '';
    while (!walletName || userAccount.wallets.some(w => w.name === walletName)) {
      walletCount++;
      walletName = `HD Wallet ${walletCount}`;
    }
    const newWallet: ExtendedUserWallet = {
      id,
      name: walletName,
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
    const { network } = params;
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
      id: generateCryptoAccountId(CoinType.POKT, ChainType.MAINNET, account.address),
      name: `${CoinType.POKT} Account ${account.address.slice(-4)}`,
      network,
      chain: ChainType.MAINNET,
      derivationPath: '',
      index: -1,
      address: account.address,
      privateKey: encryptedPrivateKey,
      publicKey: account.publicKey,
    };
    const walletId = account.address;
    const prev = userAccount.wallets.find(w => w.id === walletId);
    if(prev) {
      throw new Error('Wallet already exists.');
    }
    const legacyWalletCount = userAccount.wallets
      .filter(w => w.legacy)
      .filter(w => w.accounts.some(a => a.network === network && a.chain === ChainType.MAINNET))
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
          chain: ChainType.MAINNET,
          accounts: [
            cryptoAccount,
          ],
        },
        {
          network,
          chain: ChainType.TESTNET,
          accounts: [
            {
              ...cryptoAccount,
              id: generateCryptoAccountId(CoinType.POKT, ChainType.TESTNET, account.address),
              chain: ChainType.TESTNET,

            },
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

  const rpcTries = 2;

  const poktMultiSyncGetBalance = async (endpoint: string, address: string, inUPokt = false): Promise<string> => {
    for(let i = 0; i < rpcTries; i++) {
      try {
        const res = await PoktUtils.getBalance(endpoint, address);
        if(inUPokt) {
          return res.toString();
        } else {
          return PoktUtils.fromBaseDenom(res).toString();
        }
      } catch(err) {
        // do nothing and let loop continue
      }
    }
    return '0';
  };

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
                const endpoint = await getRpcEndpoint(account.network, account.chain);
                if(!endpoint) {
                  balances[account.id] = '0';
                } else {
                  balances[account.id] = await poktMultiSyncGetBalance(endpoint, account.address);
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
                const endpoint = await getRpcEndpoint(account.network, account.chain);
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
        const endpoint = await getRpcEndpoint(cryptoAccount.network, cryptoAccount.chain);
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

  messager.register(APIEvent.STAKE_NODE, async (params: StakeNodeParams): Promise<StakeNodeResult> => {
    const {
      accountId,
      operatorPublicKey = '',
      amount,
      chains,
      serviceURL,
    } = params;
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
        const endpoint = await getRpcEndpoint(cryptoAccount.network, cryptoAccount.chain);
        if(!endpoint) {
          throw new Error(`${cryptoAccount.network} ${cryptoAccount.chain} endpoint not found.`);
        } else if(!cryptoAccount.privateKey) {
          throw new Error('Private key not found.');
        }
        const privateKey = await decrypt(cryptoAccount.privateKey);
        const res = await PoktUtils.stakeNode({
          endpoint,
          network: cryptoAccount.chain,
          operatorPublicKey,
          ownerPrivateKey: privateKey,
          amount: PoktUtils.toBaseDenom(amount),
          serviceURL,
          chains,
        });
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

  messager.register(ContentAPIEvent.STAKE_NODE, async (params: StakeNodeParams, sender): Promise<StakeNodeResult> => {
    const {
      accountId,
      operatorPublicKey = '',
      amount,
      chains,
      serviceURL,
    } = params;
    const userAccount = await unlockAndGetUserAccount();
    checkIfOriginAllowedAndThrow(userAccount, sender);
    const cryptoAccount = findCryptoAccountInUserAccountWithWalletId(userAccount, accountId);
    if(!cryptoAccount) {
      throw new Error('Account not found.');
    }
    const urlPath = RouteBuilder.stake.generateFullPath({
      walletId: cryptoAccount.walletId,
      networkId: cryptoAccount.network,
      chainId: cryptoAccount.chain,
      address: cryptoAccount.address,
    });
    const url = chrome.runtime.getURL(`index.html#${urlPath}?amount=${encodeURIComponent(Number(amount) / 1000000)}&operator=${encodeURIComponent(operatorPublicKey)}${chains.length > 0 ? `&chains=${encodeURIComponent(chains.join(','))}` : ''}&serviceurl=${encodeURIComponent(serviceURL)}&content=true`);
    const popup = await createPopupWindow(url);
    let txid = '';
    const txidListener = (message: {type: string, payload: string}, sender: MessageSender) => {
      const { type, payload } = message;
      if(sender.tab?.windowId === popup.id && type === 'txid') {
        chrome.runtime.onMessage.removeListener(txidListener);
        txid = payload;
      }
    };
    chrome.runtime.onMessage.addListener(txidListener);
    await waitForWindowClose(popup);
    if(!txid) {
      chrome.runtime.onMessage.removeListener(txidListener);
      throw new Error('Transaction cancelled.');
    }
    return {
      result: {
        txid,
      },
    };
  });

  messager.register(APIEvent.SIGN_MESSAGE, async (params: SignMessageParams): Promise<SignMessageResult> => {
    const { accountId, message } = params;
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
        const endpoint = await getRpcEndpoint(cryptoAccount.network, cryptoAccount.chain);
        if(!endpoint) {
          throw new Error(`${cryptoAccount.network} ${cryptoAccount.chain} endpoint not found.`);
        } else if(!cryptoAccount.privateKey) {
          throw new Error('Private key not found.');
        }
        const privateKey = await decrypt(cryptoAccount.privateKey);
        const signature = await PoktUtils.sign(message, privateKey);
        return {
          result: {
            signature,
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

  const getActiveAccount = async (): Promise<string> => {
    const encrypted = await storageManager.get(LocalStorageKey.ACTIVE_ACCOUNT);
    if(!encrypted) {
      return '';
    }
    return await decrypt(encrypted);
  }

  messager.register(APIEvent.GET_ACTIVE_ACCOUNT, async (): Promise<GetActiveAccountResult> => {
    try {
      const result = await getActiveAccount();
      if(!result) {
        return {result: ''};
      }
      return {result};
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

  messager.register(APIEvent.CONNECT_SITE, async ({ origin = '' }: ConnectSiteParams): Promise<ConnectSiteResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const { allowedOrigins = [] } = userAccount;
    const found = allowedOrigins.some(o => o.origin === origin.toLowerCase());
    if(found) { // origin has already been allowed
      return {
        result: true,
      };
    }
    const host = getHostFromOrigin(origin).toLowerCase();
    const newOrigin: AllowedOrigin = {
      date: dayjs.utc().toISOString(),
      origin: origin.toLowerCase(),
      host,
    };
    if(userAccount.allowedOrigins) {
      userAccount.allowedOrigins.push(newOrigin);
    } else {
      userAccount.allowedOrigins = [newOrigin];
    }
    await sessionManager.set(SessionStorageKey.USER_ACCOUNT, userAccount);
    await encryptSaveUserAccount(userAccount);
    return {
      result: true,
    };
  });

  messager.register(APIEvent.DISCONNECT_SITE, async ({ origin = '' }: DisconnectSiteParams): Promise<DisconnectSiteResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const { allowedOrigins = [] } = userAccount;
    userAccount.allowedOrigins = allowedOrigins
      .filter(o => o.origin !== origin.toLowerCase());
    await sessionManager.set(SessionStorageKey.USER_ACCOUNT, userAccount);
    await encryptSaveUserAccount(userAccount);
    return {
      result: true,
    };
  });

  messager.register(APIEvent.GET_ACTIVE_TAB_ORIGIN, async (): Promise<GetActiveTabOriginResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const [ tab ] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    const url = tab?.url || '';
    const originPatt = /^(https?:\/\/[^/?#]+)/;
    const matches = url
      .toLowerCase()
      .match(originPatt);
    return {
      result: matches ? matches[1] : '',
    };
  });

  messager.register(APIEvent.UPDATE_USER_SETTINGS, async (params: UpdateUserSettingsParams): Promise<UpdateUserSettingsResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const newSettings: UserSettings = {
      ...userAccount.settings,
      ...params,
    };
    userAccount.settings = newSettings;
    await sessionManager.set(SessionStorageKey.USER_ACCOUNT, userAccount);
    await encryptSaveUserAccount(userAccount);
    await resetLockTimer();
    return {
      result: newSettings,
    };
  });

  messager.register(APIEvent.UPDATE_WALLET_NAME, async (params: UpdateWalletNameParams): Promise<UpdateWalletNameResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const walletIdx = userAccount.wallets.findIndex(w => w.id === params.id);
    if(walletIdx < 0) {
      throw new Error(`Wallet ${params.id} not found.`);
    }
    userAccount.wallets[walletIdx].name = params.name;
    await sessionManager.set(SessionStorageKey.USER_ACCOUNT, userAccount);
    await encryptSaveUserAccount(userAccount);
    return {
      result: true,
    };
  });

  messager.register(APIEvent.UPDATE_ACCOUNT_NAME, async (params: UpdateAccountNameParams): Promise<UpdateAccountNameResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    for(let i = 0; i < userAccount.wallets.length; i++) {
      for(let j = 0; j < userAccount.wallets[i].accounts.length; j++) {
        for(let k = 0; k < userAccount.wallets[i].accounts[j].accounts.length; k++) {
          const account = userAccount.wallets[i].accounts[j].accounts[k];
          if(account.id === params.id) {
            account.name = params.name;
            await sessionManager.set(SessionStorageKey.USER_ACCOUNT, userAccount);
            await encryptSaveUserAccount(userAccount);
            return {
              result: true,
            };
          }
        }
      }
    }
    throw new Error(`Account ${params.id} not found.`);
  });

  messager.register(APIEvent.UPDATE_RPC_ENDPOINT, async (params: UpdateRpcEndpointParams): Promise<UpdateRpcEndpointResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const { network, chain, endpoint } = params;
    if (network === CoinType.POKT && chain === ChainType.MAINNET) {
      await storageManager.set(LocalStorageKey.POKT_MAINNET_ENDPOINT, endpoint);
    } else if (network === CoinType.POKT && chain === ChainType.TESTNET) {
      await storageManager.set(LocalStorageKey.POKT_TESTNET_ENDPOINT, endpoint);
    } else {
      return {
        result: false,
      };
    }
    return {
      result: true,
    };
  });

  messager.register(APIEvent.GET_RPC_ENDPOINT, async (params: GetRpcEndpointParams): Promise<GetRpcEndpointResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    const { network, chain } = params;
    let endpoint = '';
    if (network === CoinType.POKT && chain === ChainType.MAINNET) {
      endpoint =  await storageManager.get(LocalStorageKey.POKT_MAINNET_ENDPOINT) as string;
    } else if (network === CoinType.POKT && chain === ChainType.TESTNET) {
      endpoint =  await storageManager.get(LocalStorageKey.POKT_TESTNET_ENDPOINT) as string;
    }
    return {
      result: endpoint || '',
    };
  });

  messager.register(APIEvent.DELETE_WALLET, async (params: DeleteWalletParams): Promise<DeleteWalletResult> => {
    const userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    if (userAccount.wallets.length === 1) {
      throw new Error('Cannot delete only wallet.');
    }
    const { id } = params;
    const walletIdx = userAccount.wallets.findIndex(w => w.id === id);
    if(walletIdx < 0) {
      throw new Error(`Wallet ${id} not found.`);
    }
    userAccount.wallets = [
      ...userAccount.wallets.slice(0, walletIdx),
      ...userAccount.wallets.slice(walletIdx + 1),
    ];
    await sessionManager.set(SessionStorageKey.USER_ACCOUNT, userAccount);
    await encryptSaveUserAccount(userAccount);
    return {
      result: true,
    };
  });

  const createPopupWindow = async (url: string): Promise<chrome.windows.Window> => {
    const currentWindow = await chrome.windows.getCurrent();
    // @ts-ignore
    const windowLeft = currentWindow.left + currentWindow.width - POPUP_WIDTH;
    // @ts-ignore
    const windowTop = currentWindow.top || 0;
    return await chrome.windows.create({
      focused: true,
      url,
      width: POPUP_WIDTH,
      height: POPUP_HEIGHT + 35,
      type: 'popup',
      left: windowLeft,
      top: windowTop + 68,
    });
  };

  const waitForWindowClose = (window: chrome.windows.Window): Promise<void> => {
    return new Promise<void>(resolve => {
      const onRemovedCallback = (windowId: number): void => {
        if(windowId === window.id) {
          chrome.windows.onRemoved.removeListener(onRemovedCallback);
          resolve();
        }
      };
      chrome.windows.onRemoved.addListener(onRemovedCallback);
    });
  };

  const unlockAndGetUserAccount = async (): Promise<ExtendedUserAccount> => {
    let userAccount = await getUserAccount();
    if(userAccount) {
      return userAccount;
    }
    const urlPath = RouteBuilder.unlock.generateFullPath({});
    const url = chrome.runtime.getURL(`index.html#${urlPath}?content=true`);
    const popup = await createPopupWindow(url);
    await waitForWindowClose(popup);
    userAccount = await getUserAccount();
    if(!userAccount) {
      throw new Error('User account locked.');
    }
    return userAccount;
  }

  const checkIfOriginAllowed = (userAccount: ExtendedUserAccount, sender: MessageSender): boolean => {
    const { origin = '' } = sender;
    if(!origin) {
      throw new Error('Invalid sender.');
    }
    const { allowedOrigins = [] } = userAccount;
    return allowedOrigins.some(o => o.origin === origin.toLowerCase());
  }

  const checkIfOriginAllowedAndThrow = (userAccount: ExtendedUserAccount, sender: MessageSender): void => {
    const allowed = checkIfOriginAllowed(userAccount, sender);
    if(!allowed) {
      throw new Error('Not allowed by user.');
    }
  }

  messager.register(ContentAPIEvent.REQUEST_ACCOUNT, async ({ network }: RequestAccountParams, sender): Promise<RequestAccountResult> => {
    let userAccount = await unlockAndGetUserAccount();
    const { origin = '', tab } = sender;
    if(!tab) {
      throw new Error('Invalid sender.');
    }

    let allowed = checkIfOriginAllowed(userAccount, sender);

    if(!allowed) {
      const { favIconUrl = '', title = '' } = tab;
      const urlPath = RouteBuilder.connect.generateFullPath({});
      const url = chrome.runtime.getURL(`index.html#${urlPath}?content=true&favicon=${encodeURIComponent(favIconUrl)}&title=${encodeURIComponent(title)}&origin=${encodeURIComponent(origin.toLowerCase())}`);
      const popup = await createPopupWindow(url);
      await waitForWindowClose(popup);
      const updatedUserAccount = await getUserAccount();
      if(!updatedUserAccount) {
        throw new Error('Updated user account not found!');
      }
      userAccount = updatedUserAccount;
      checkIfOriginAllowedAndThrow(userAccount, sender);
    }

    let activeAccount = await getActiveAccount();
    if(!activeAccount) {
      const urlPath = RouteBuilder.selectAccount.generateFullPath({});
      const url = chrome.runtime.getURL(`index.html#${urlPath}?content=true`);
      const popup = await createPopupWindow(url);
      await waitForWindowClose(popup);
      activeAccount = await getActiveAccount();
      if(!activeAccount) {
        throw new Error('No account selected.');
      }
    }

    const cryptoAccount = findCryptoAccountInUserAccount(userAccount, activeAccount);
    if(!cryptoAccount) {
      throw new Error('Account not found.');
    }
    return {
      result: sanitizeCryptoAccount(cryptoAccount),
    };
  });

  messager.register(ContentAPIEvent.GET_BALANCE, async ({ accountId }: GetBalanceParams, sender): Promise<GetBalanceResult> => {
    const userAccount = await unlockAndGetUserAccount();
    checkIfOriginAllowedAndThrow(userAccount, sender);
    const cryptoAccount = findCryptoAccountInUserAccount(userAccount, accountId);
    if(!cryptoAccount) {
      throw new Error('Account not found.');
    }
    let result: string;
    switch(cryptoAccount.network) {
      case CoinType.POKT: {
        const endpoint = await getRpcEndpoint(cryptoAccount.network, cryptoAccount.chain);
        if(!endpoint) {
          throw new Error(`No RPC endpoint found for ${cryptoAccount.network} ${cryptoAccount.chain}.`);
        } else {
          result = await poktMultiSyncGetBalance(endpoint, cryptoAccount.address, true);
        }
        return {
          result,
        };
      } default: {
        throw new Error('Unsupported network.');
      }
    }
  });

  // messager.register(ContentAPIEvent.RPC_GET_BALANCE, async ({ network, chain, address }: RpcGetBalanceParams, sender): Promise<RpcGetBalanceResult> => {
  //   const userAccount = await unlockAndGetUserAccount();
  //   checkIfOriginAllowedAndThrow(userAccount, sender);
  //   let result: string;
  //   switch(network) {
  //     case CoinType.POKT: {
  //       const endpoint = rpcEndpoints[network][chain];
  //       if(!endpoint) {
  //         throw new Error(`No RPC endpoint found for ${network} ${chain}.`);
  //       }
  //       const balance = await PoktUtils.getBalance(endpoint, address);
  //       return {
  //         result: balance.toString(),
  //       };
  //     } default: {
  //       throw new Error('Unsupported network.');
  //     }
  //   }
  // });

  function poktRpcRequestHandler(params: PoktRpcGetBalanceParams): Promise<PoktRpcGetBalanceResult>
  function poktRpcRequestHandler(params: PoktRpcGetBlockParams): Promise<PoktRpcGetBlockResult>
  function poktRpcRequestHandler(params: PoktRpcGetTransactionParams): Promise<PoktRpcGetTransactionResult>
  function poktRpcRequestHandler(params: PoktRpcGetBlockNumberParams): Promise<PoktRpcGetBlockNumberResult>
  function poktRpcRequestHandler(params: PoktRpcGetNodeParams): Promise<PoktRpcGetNodeResult>
  function poktRpcRequestHandler(params: PoktRpcGetAppParams): Promise<PoktRpcGetAppResult>
  function poktRpcRequestHandler(params: PoktRpcGetAccountParams): Promise<PoktRpcGetAccountResult>
  async function poktRpcRequestHandler(params: any): Promise<any> {
    const network = CoinType.POKT;
    const { chain } = params;
    const endpoint = await getRpcEndpoint(network, chain);
    if(!endpoint) {
      throw new Error(`No RPC endpoint found for ${network} ${chain}.`);
    }
    switch(params.method) {
      case 'getBalance': {
        const { address } = params.params;
        const balance = await PoktUtils.getBalance(endpoint, address);
        return {
          result: balance.toString(),
        };
      } case 'getBlock': {
        const { height } = params.params;
        const block = await PoktUtils.getBlock(endpoint, height);
        return {
          result: block,
        };
      } case 'getTransaction': {
        const { hash } = params.params;
        const transaction = await PoktUtils.getTransaction(endpoint, hash);
        return {
          result: transaction,
        };
      } case 'getBlockNumber': {
        const blockNumber = await PoktUtils.getBlockHeight(endpoint);
        return {
          result: Number(blockNumber.toString()),
        };
      } case 'getNode': {
        const { address, height } = params.params;
        const node = await PoktUtils.getNode(endpoint, address, height);
        return {
          result: node,
        };
      } case 'getApp': {
        const { address, height } = params.params;
        const app = await PoktUtils.getApp(endpoint, address, height);
        return {
          result: app,
        };
      } case 'getAccount': {
        const { address } = params.params;
        const account = await PoktUtils.getAccount(endpoint, address);
        return {
          result: account,
        };
      } default:
        throw new Error('Unsupported method.');
    }
  }

  messager.register(ContentAPIEvent.POKT_RPC_REQUEST, async (params: any, sender): Promise<any> => {
    const userAccount = await unlockAndGetUserAccount();
    checkIfOriginAllowedAndThrow(userAccount, sender);
    return await poktRpcRequestHandler(params);
  });

  messager.register(ContentAPIEvent.GET_HEIGHT, async ({ network, chain }: GetHeightParams, sender): Promise<GetHeightResult> => {
    const userAccount = await unlockAndGetUserAccount();
    checkIfOriginAllowedAndThrow(userAccount, sender);
    let result: string;
    switch(network) {
      case CoinType.POKT: {
        const endpoint = await getRpcEndpoint(network, chain);
        if(!endpoint) {
          throw new Error(`No RPC endpoint found for ${network} ${chain}.`);
        } else {
          try {
            const res = await PoktUtils.getBlockHeight(endpoint);
            result = res.toString();
          } catch(err) {
            result = '0';
          }
        }
        return {
          result,
        };
      } default: {
        throw new Error('Unsupported network.');
      }
    }
  });

  messager.register(ContentAPIEvent.GET_TRANSACTION, async ({ txid, network, chain }: GetTransactionParams, sender): Promise<GetTransactionResult> => {
    const userAccount = await unlockAndGetUserAccount();
    checkIfOriginAllowedAndThrow(userAccount, sender);
    let result: string;
    switch(network) {
      case CoinType.POKT: {
        const endpoint = await getRpcEndpoint(network, chain);
        if(!endpoint) {
          throw new Error(`No RPC endpoint found for ${network} ${chain}.`);
        }
        return {
          result: await PoktUtils.getTransaction(endpoint, txid),
        };
      } default: {
        throw new Error('Unsupported network.');
      }
    }
  });

  messager.register(ContentAPIEvent.SEND_TRANSACTION, async ({ accountId, amount, recipient, memo }: SendTransactionParams, sender): Promise<SendTransactionResult> => {
    const userAccount = await unlockAndGetUserAccount();
    checkIfOriginAllowedAndThrow(userAccount, sender);
    const cryptoAccount = findCryptoAccountInUserAccountWithWalletId(userAccount, accountId);
    if(!cryptoAccount) {
      throw new Error('Account not found.');
    }
    const urlPath = RouteBuilder.send.generateFullPath({
      walletId: cryptoAccount.walletId,
      networkId: cryptoAccount.network,
      chainId: cryptoAccount.chain,
      address: cryptoAccount.address,
    });
    const url = chrome.runtime.getURL(`index.html#${urlPath}?amount=${encodeURIComponent(Number(amount) / 1000000)}&recipient=${encodeURIComponent(recipient)}&memo=${encodeURIComponent(memo || '')}&content=true`);
    const popup = await createPopupWindow(url);
    let txid = '';
    const txidListener = (message: {type: string, payload: string}, sender: MessageSender) => {
      const { type, payload } = message;
      if(sender.tab?.windowId === popup.id && type === 'txid') {
        chrome.runtime.onMessage.removeListener(txidListener);
        txid = payload;
      }
    };
    chrome.runtime.onMessage.addListener(txidListener);
    await waitForWindowClose(popup);
    if(!txid) {
      chrome.runtime.onMessage.removeListener(txidListener);
      throw new Error('Transaction cancelled.');
    }
    return {
      result: {
        txid,
      },
    };
  });


  messager.register(ContentAPIEvent.SIGN_MESSAGE, async ({ accountId, message }: SignMessageParams, sender): Promise<SignMessageResult> => {
    const userAccount = await unlockAndGetUserAccount();
    checkIfOriginAllowedAndThrow(userAccount, sender);
    const cryptoAccount = findCryptoAccountInUserAccountWithWalletId(userAccount, accountId);
    if(!cryptoAccount) {
      throw new Error('Account not found.');
    }
    const urlPath = RouteBuilder.sign.generateFullPath({
      walletId: cryptoAccount.walletId,
      networkId: cryptoAccount.network,
      chainId: cryptoAccount.chain,
      address: cryptoAccount.address,
    });
    const url = chrome.runtime.getURL(`index.html#${urlPath}?message=${encodeURIComponent(message)}&content=true`);
    const popup = await createPopupWindow(url);
    let signature = '';
    const signatureListener = (message: {type: string, payload: string}, sender: MessageSender) => {
      const { type, payload } = message;
      if(sender.tab?.windowId === popup.id && type === 'signature') {
        chrome.runtime.onMessage.removeListener(signatureListener);
        signature = payload;
      }
    };
    chrome.runtime.onMessage.addListener(signatureListener);
    await waitForWindowClose(popup);
    if(!signature) {
      chrome.runtime.onMessage.removeListener(signatureListener);
      throw new Error('Sign cancelled.');
    }
    return {
      result: {
        signature,
      },
    };
  });

  chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    const logger = getLogger();
    if(reason === 'install') {
      logger.info('Extension installed!');
      await openTosTab();
    }
  });

  chrome.runtime.onMessage.addListener(async () => {
    await resetLockTimer();
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
