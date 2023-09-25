import { CryptoAccount } from './wallet';
import { ErrorResult } from './api';
import { ChainType, CoinType } from '@nodewallet/constants';

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
export interface SendTransactionParams {
  accountId: string
  amount: string
  recipient: string
  memo?: string
}
export type SendTransactionResult = ErrorResult | {
  result: {
    txid: string
  }
}
export interface GetTransactionParams {
  txid: string
}
export type GetTransactionResult = ErrorResult | {
  result: any
}
export interface GetHeightParams {
  network: CoinType
  chain: ChainType
}
export type GetHeightResponse = ErrorResult | {
  result: string
}

export interface ContentAPI {

  requestAccount(params: RequestAccountParams): Promise<RequestAccountResult>

  getBalance(params: GetBalanceParams): Promise<GetBalanceResult>

  sendTransaction(params: SendTransactionParams): Promise<SendTransactionResult>

  getTransaction(params: GetTransactionParams): Promise<GetTransactionResult>

  getHeight(params: GetHeightParams): Promise<GetHeightResponse>

}
