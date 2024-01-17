import {
  ContentAPI, ContentAPIEvent,
  SendTransactionParams,
  SendTransactionResult,
  SignMessageParams,
  SignMessageResult,
  StakeNodeParams, StakeNodeResult,
  GetBalanceParams,
  GetBalanceResult,
  GetHeightParams,
  GetHeightResult,
  GetTransactionParams,
  GetTransactionResult,
  RequestAccountParams,
  RequestAccountResult,
} from '@nodewallet/types';
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
    return await this._messager.send(ContentAPIEvent.SEND_TRANSACTION, params);
  }

  async stakeNode(params: StakeNodeParams): Promise<StakeNodeResult> {
    return await this._messager.send(ContentAPIEvent.STAKE_NODE, params);
  }

  async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
    return await this._messager.send(ContentAPIEvent.SIGN_MESSAGE, params);
  }

  async getTransaction(params: GetTransactionParams): Promise<GetTransactionResult> {
    return await this._messager.send(ContentAPIEvent.GET_TRANSACTION, params);
  }

  async getHeight(params: GetHeightParams): Promise<GetHeightResult> {
    return await this._messager.send(ContentAPIEvent.GET_HEIGHT, params);
  }

  async poktRpcRequest(params: any): Promise<any> {
    return await this._messager.send(ContentAPIEvent.POKT_RPC_REQUEST, params);
  }

}
