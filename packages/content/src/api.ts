import {
  ContentAPI,
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

export class API implements ContentAPI {

  async requestAccount(params: RequestAccountParams): Promise<RequestAccountResult> {
    return {
      result: {
        id: 'abcd1234',
        name: 'Test Account',
        address: '0x1234567890abcdef',
        network: CoinType.POKT,
        chain: ChainType.TESTNET,
        index: 0,
        publicKey: '',
        derivationPath: '',
      }
    };
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
