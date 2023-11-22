import { CryptoAccount } from './wallet';
import { ErrorResult, SendTransactionParams, SendTransactionResult, SignMessageParams, SignMessageResult } from './api';
import { ChainType, CoinType } from '@nodewallet/constants';

export enum ContentAPIEvent {
  REQUEST_ACCOUNT = 'CONTENT_REQUEST_ACCOUNT',
  GET_BALANCE = 'CONTENT_GET_BALANCE',
  SEND_TRANSACTION = 'CONTENT_SEND_TRANSACTION',
  GET_TRANSACTION = 'CONTENT_GET_TRANSACTION',
  GET_HEIGHT = 'CONTENT_GET_HEIGHT',
  SIGN_MESSAGE = 'CONTENT_SIGN_MESSAGE',
}

export interface RequestAccountParams {
  network: CoinType
}
export type RequestAccountResult = ErrorResult | {
  result: CryptoAccount
}
export interface GetBalanceParams {
  accountId: string
}
export type GetBalanceResult = ErrorResult | {
  result: string
}
export interface GetTransactionParams {
  txid: string
  network: CoinType
  chain: ChainType
}
export type GetTransactionResult = ErrorResult | {
  result: any
}
export interface GetHeightParams {
  network: CoinType
  chain: ChainType
}
export type GetHeightResult = ErrorResult | {
  result: string
}

export interface ContentAPI {

  requestAccount(params: RequestAccountParams): Promise<RequestAccountResult>

  getBalance(params: GetBalanceParams): Promise<GetBalanceResult>

  sendTransaction(params: SendTransactionParams): Promise<SendTransactionResult>

  signMessage(params: SignMessageParams): Promise<SignMessageResult>

  getTransaction(params: GetTransactionParams): Promise<GetTransactionResult>

  getHeight(params: GetHeightParams): Promise<GetHeightResult>

}
