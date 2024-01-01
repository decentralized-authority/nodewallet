import { CryptoAccount } from './wallet';
import { ErrorResult, SendTransactionParams, SendTransactionResult, SignMessageParams, SignMessageResult } from './api';
import { ChainType, CoinType } from '@nodewallet/constants';
import { Account, App, Block, Node, Transaction } from '@pokt-foundation/pocketjs-types';

export enum ContentAPIEvent {
  REQUEST_ACCOUNT = 'CONTENT_REQUEST_ACCOUNT',
  GET_BALANCE = 'CONTENT_GET_BALANCE',
  SEND_TRANSACTION = 'CONTENT_SEND_TRANSACTION',
  GET_TRANSACTION = 'CONTENT_GET_TRANSACTION',
  GET_HEIGHT = 'CONTENT_GET_HEIGHT',
  SIGN_MESSAGE = 'CONTENT_SIGN_MESSAGE',
  POKT_RPC_REQUEST = 'CONTENT_POKT_RPC_REQUEST',
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

export interface PoktRpcGetBalanceParams {
  method: 'getBalance'
  chain: ChainType
  params: {
    address: string
  }
}
export type PoktRpcGetBalanceResult = ErrorResult | {
  result: string
}
export interface PoktRpcGetBlockParams {
  method: 'getBlock'
  chain: ChainType
  params: {
    block: number
  }
}
export type PoktRpcGetBlockResult = ErrorResult | {
  result: Block
}
export interface PoktRpcGetTransactionParams {
  method: 'getTransaction'
  chain: ChainType
  params: {
    hash: string
  },
}
export type PoktRpcGetTransactionResult = ErrorResult | {
  result: Transaction
}
export interface PoktRpcGetBlockNumberParams {
  method: 'getBlockNumber'
  chain: ChainType
}
export type PoktRpcGetBlockNumberResult = ErrorResult | {
  result: number
}
export interface PoktRpcGetNodeParams {
  method: 'getNode'
  chain: ChainType
  params: {
    address: string
    height?: number
  }
}
export type PoktRpcGetNodeResult = ErrorResult | {
  result: Node
}
export interface PoktRpcGetAppParams {
  method: 'getApp'
  chain: ChainType
  params: {
    address: string
    height?: number
  }
}
export type PoktRpcGetAppResult = ErrorResult | {
  result: App
}
export interface PoktRpcGetAccountParams {
  method: 'getAccount'
  chain: ChainType
  params: {
    address: string
  }
}
export type PoktRpcGetAccountResult = ErrorResult | {
  result: Account
}

export interface ContentAPI {

  requestAccount(params: RequestAccountParams): Promise<RequestAccountResult>

  getBalance(params: GetBalanceParams): Promise<GetBalanceResult>

  sendTransaction(params: SendTransactionParams): Promise<SendTransactionResult>

  signMessage(params: SignMessageParams): Promise<SignMessageResult>

  getTransaction(params: GetTransactionParams): Promise<GetTransactionResult>

  getHeight(params: GetHeightParams): Promise<GetHeightResult>

  poktRpcRequest(params: PoktRpcGetBalanceParams): Promise<PoktRpcGetBalanceResult>
  poktRpcRequest(params: PoktRpcGetBlockParams): Promise<PoktRpcGetBlockResult>
  poktRpcRequest(params: PoktRpcGetTransactionParams): Promise<PoktRpcGetTransactionResult>
  poktRpcRequest(params: PoktRpcGetBlockNumberParams): Promise<PoktRpcGetBlockNumberResult>
  poktRpcRequest(params: PoktRpcGetNodeParams): Promise<PoktRpcGetNodeResult>
  poktRpcRequest(params: PoktRpcGetAppParams): Promise<PoktRpcGetAppResult>
  poktRpcRequest(params: PoktRpcGetAccountParams): Promise<PoktRpcGetAccountResult>

}
