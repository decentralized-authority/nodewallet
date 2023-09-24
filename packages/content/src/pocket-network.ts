import { EventEmitter } from 'events';
import { ContentBridge } from './content-bridge';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import { isHex } from '@nodewallet/util-browser';

enum PocketNetworkMethod {
  REQUEST_ACCOUNTS = 'pokt_requestAccounts',
  BALANCE = 'pokt_balance',
  SEND_TRANSACTION = 'pokt_sendTransaction',
  TX = 'pokt_tx',
  HEIGHT = 'pokt_height',
  // BLOCK = 'pokt_block',
}

const requestAccounts = async (): Promise<[string]> => {
  return ['abcd1234'];
};

const balance = async ([params]: {address: string}[]): Promise<{balance: number}> => {
  if(!params || !params.address) {
    throw new Error(`${PocketNetworkMethod.BALANCE} method params must be an array containing an object with an address string`);
  }
  return {balance: 1234};
};

const sendTransaction = async ([params]: {amount: string, to: string, from: string, memo?: string}[]): Promise<{hash: string}> => {
  if(!params || !isString(params.amount) || !isString(params.to) || !isString(params.from) || (params.memo && !isString(params.memo))) {
    throw new Error(`${PocketNetworkMethod.SEND_TRANSACTION} method params must be an array containing an object with an amount, to, from, and optional memo string`);
  }
  const amount = params.amount.trim();
  const to = params.to.trim();
  const from = params.from.trim();
  const memo = params.memo ? params.memo.trim() : '';
  if(!amount || /\D/.test(amount)) {
    throw new Error('invalid amount');
  } else if(!to || !isHex(to)) {
    throw new Error('invalid to address');
  } else if(!from || !isHex(from)) {
    throw new Error('invalid from address');
  }
  return {hash: '0123456789abcdef'};
};

const tx = async ([params]: {hash: string}[]): Promise<any> => {
  if(!params || !isString(params.hash)) {
    throw new Error(`${PocketNetworkMethod.TX} method params must be an array containing an object with a hash string`);
  }
  const hash = params.hash.trim();
  if(!hash || !isHex(hash)) {
    throw new Error('invalid hash');
  }
  return {tx: 'info'};
};

const height = async (): Promise<{height: number}> => {
  return {height: 1234};
};

class PocketNetwork extends EventEmitter implements ContentBridge {

  async send(method: PocketNetworkMethod, params: any[]): Promise<any> {
    if(!isString(method)) {
      throw new Error('Method must be a string');
    } else if(params && !isArray(params)) {
      throw new Error('Params must be an array');
    }
    switch(method) {
      case PocketNetworkMethod.REQUEST_ACCOUNTS:
        return requestAccounts();
      case PocketNetworkMethod.BALANCE:
        return balance(params);
      case PocketNetworkMethod.SEND_TRANSACTION:
        return sendTransaction(params);
      case PocketNetworkMethod.TX:
        return tx(params);
      case PocketNetworkMethod.HEIGHT:
        return height();
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

}

export const pocketNetwork = new PocketNetwork();
