import {
  ContentAPI, ContentAPIEvent,
  GetBalanceParams,
  GetBalanceResult,
  GetHeightParams,
  GetHeightResponse,
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
    return {
      result: '1234321'
    };
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

  async getHeight(params: GetHeightParams): Promise<GetHeightResponse> {
    return {
      result: '1234555'
    };
  }

}
