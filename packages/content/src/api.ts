import {
  ContentAPI, ContentAPIEvent,
  GetBalanceParams,
  GetBalanceResult,
  GetHeightParams,
  GetHeightResult,
  GetTransactionParams,
  GetTransactionResult,
  RequestAccountParams,
  RequestAccountResult
} from '@nodewallet/types/dist/content-api';
import { ChainType, CoinType } from '@nodewallet/constants';
import { SendTransactionParams, SendTransactionResult } from '@nodewallet/types';
import { Messager } from '@nodewallet/util-browser';

export class API implements ContentAPI {

  _messager: Messager;

  constructor(messager: Messager) {
    this._messager = messager;
  }

  async requestAccount(params: RequestAccountParams): Promise<RequestAccountResult> {
    return await this._messager.send(ContentAPIEvent.REQUEST_ACCOUNT, params);
  }

  async getBalance(params: GetBalanceParams): Promise<GetBalanceResult> {
    return await this._messager.send(ContentAPIEvent.GET_BALANCE, params);
  }

  async sendTransaction(params: SendTransactionParams): Promise<SendTransactionResult> {
    return {
      result: {
        txid: '0123456789abcdef'
      },
    };
  }

  async getTransaction(params: GetTransactionParams): Promise<GetTransactionResult> {
    return {
      result: {
        tx: 'some tx'
      },
    };
  }

  async getHeight(params: GetHeightParams): Promise<GetHeightResult> {
    return await this._messager.send(ContentAPIEvent.GET_HEIGHT, params);
  }

}
