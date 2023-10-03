import { EventEmitter } from 'events';
import { ContentBridge } from './content-bridge';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import { isHex } from '@nodewallet/util-browser';
import { API } from './api';
import { CryptoAccount } from '@nodewallet/types';
import { CoinType } from '@nodewallet/constants';

export enum PocketNetworkMethod {
  REQUEST_ACCOUNTS = 'pokt_requestAccounts',
  BALANCE = 'pokt_balance',
  SEND_TRANSACTION = 'pokt_sendTransaction',
  TX = 'pokt_tx',
  HEIGHT = 'pokt_height',
  CHAIN = 'pokt_chain',
  // BLOCK = 'pokt_block',
}

const notConnectedErrorMessage = 'Not connected. You must run requestAccounts first.';
const notFoundErrorMessage = 'Invalid address. Please run requestAccounts to get the connected address.';

const addressToAccount = new Map<string, CryptoAccount>();
let connected = false;

const requestAccounts = async (api: API): Promise<[string]> => {
  const res = await api.requestAccount({
    network: CoinType.POKT,
  });
  if('error' in res) {
    throw new Error(res.error.message);
  }
  addressToAccount.set(res.result.address, res.result);
  connected = true;
  return [res.result.address];
};

const checkConnected = (): void => {
  if(!connected) {
    throw new Error(notConnectedErrorMessage);
  }
}

const getAccount = (address: string): CryptoAccount => {
  const account = addressToAccount.get(address);
  if(!account) {
    throw new Error(notFoundErrorMessage);
  }
  return account;
}

const balance = async (paramsArr: {address: string}[], api: API): Promise<{balance: number}> => {
  checkConnected();
  const [ params ] = paramsArr || [];
  if(!params || !params.address || !isString(params.address)) {
    throw new Error(`${PocketNetworkMethod.BALANCE} method params must be an array containing an object with an address string`);
  }
  const account = getAccount(params.address);
  const res = await api.getBalance({
    accountId: account.id,
  });
  if('error' in res) {
    throw new Error(res.error.message);
  }
  return {balance: Number(res.result)};
};

const sendTransaction = async (paramsArr: {amount: string, to: string, from: string, memo?: string}[], api: API): Promise<{hash: string}> => {
  checkConnected();
  const [ params ] = paramsArr || [];
  if(!params || !isString(params.amount) || !isString(params.to) || !isString(params.from) || (params.memo && !isString(params.memo))) {
    throw new Error(`${PocketNetworkMethod.SEND_TRANSACTION} method params must be an array containing an object with an amount, to, from, and optional memo string`);
  }
  const amount = params.amount.trim();
  const to = params.to.trim();
  const from = params.from.trim();
  const memo = params.memo ? params.memo.trim() : '';
  const account = getAccount(from);
  if(!amount || /\D/.test(amount)) {
    throw new Error('invalid amount');
  } else if(!to || !isHex(to)) {
    throw new Error('invalid to address');
  } else if(!from || !isHex(from)) {
    throw new Error('invalid from address');
  }
  const res = await api.sendTransaction({
    accountId: account.id,
    amount,
    recipient: to,
    memo: memo,
  });
  if('error' in res) {
    throw new Error(res.error.message);
  }
  return {hash: res.result.txid};
};

const tx = async (paramsArr: {hash: string}[], api: API): Promise<any> => {
  checkConnected();
  const [ params ] = paramsArr || [];
  if(!params || !params || !isString(params.hash)) {
    throw new Error(`${PocketNetworkMethod.TX} method params must be an array containing an object with a hash string`);
  }
  const hash = params.hash.trim();
  if(!hash || !isHex(hash)) {
    throw new Error('invalid hash');
  }
  const [ account ] = [...addressToAccount.values()];
  const res = await api.getTransaction({
    txid: hash,
    network: account.network,
    chain: account.chain,
  });
  if('error' in res) {
    throw new Error(res.error.message);
  }
  return {tx: res.result};
};

const height = async (api: API): Promise<{height: number}> => {
  checkConnected();
  const [ account ] = [...addressToAccount.values()];
  const res = await api.getHeight({
    network: account.network,
    chain: account.chain,
  });
  if('error' in res) {
    throw new Error(res.error.message);
  }
  return {height: Number(res.result)};
};

const chain = async (): Promise<{chain: string}> => {
  checkConnected();
  const [ account ] = [...addressToAccount.values()];
  return {chain: account.chain};
};

export class PocketNetwork extends EventEmitter implements ContentBridge {

  _api: API;

  constructor(api: API) {
    super();
    this._api = api;
  }

  async send(method: PocketNetworkMethod, params: any[]): Promise<any> {
    if(!isString(method)) {
      throw new Error('Method must be a string');
    } else if(params && !isArray(params)) {
      throw new Error('Params must be an array');
    }
    switch(method) {
      case PocketNetworkMethod.REQUEST_ACCOUNTS:
        return requestAccounts(this._api);
      case PocketNetworkMethod.BALANCE:
        return balance(params, this._api);
      case PocketNetworkMethod.SEND_TRANSACTION:
        return sendTransaction(params, this._api);
      case PocketNetworkMethod.TX:
        return tx(params, this._api);
      case PocketNetworkMethod.HEIGHT:
        return height(this._api);
      case PocketNetworkMethod.CHAIN:
        return chain();
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

}
