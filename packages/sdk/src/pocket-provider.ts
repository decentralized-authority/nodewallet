import { PocketNetwork } from '@nodewallet/content-bridge';
import { ChainType } from '@nodewallet/constants';
import {
  Account,
  AccountWithTransactions,
  App,
  Block,
  GetAccountWithTransactionsOptions,
  Node,
  Transaction
} from '@pokt-foundation/pocketjs-types';
import { NodeWalletMethod, PocketNetworkMethod } from '@nodewallet/content';

export class PocketProvider {

  _pocketNetwork: PocketNetwork
  _requestTimeout: number;
  private _address: string = '';
  private _chainType: ChainType = ChainType.MAINNET;
  private _nwSdkOptimized: boolean = false;

  constructor(pocketNetwork: PocketNetwork, requestTimeout: number) {
    this._pocketNetwork = pocketNetwork;
    this._requestTimeout = requestTimeout;
  }

  private checkConnected(): void {
    if (!this.isConnected()) {
      throw new Error('Not connected. You must call connect() first.');
    }
  }

  async isNodeWalletSdkOptimized(): Promise<boolean> {
    // ToDo check if the extension wallet is node wallet sdk optimized
    try {
      this.checkConnected();
      return await this._pocketNetwork.send(NodeWalletMethod.IS_NODE_WALLET_SDK_OPTIMIZED);
    } catch (err) {
      return false;
    }
  }

  async isConnected(): Promise<boolean> {
    return !!this._pocketNetwork && !!window.pocketNetwork && !!this._address;
  }

  async connect(): Promise<string> {
    // ToDo use pokt_getAccounts to get active account
    const [ address ] = await this._pocketNetwork.send(PocketNetworkMethod.REQUEST_ACCOUNTS);
    this._address = address;
    try {
      const { chain } = await this._pocketNetwork.send(PocketNetworkMethod.CHAIN);
      this._chainType = chain;
    } catch (err) {
      // do nothing and leave the default because the wallet is not SDK optimized
    }
    this._nwSdkOptimized = await this.isNodeWalletSdkOptimized();
    return address;
  }

  getConnectedAddress(): string {
    this.checkConnected();
    return this._address;
  }

  getConnectedChain(): ChainType {
    this.checkConnected();
    if (!this._nwSdkOptimized) {
      console.warn('The connected wallet is not Node Wallet SDK optimized. The wallet does not expose the chain type, so MAINNET is assummed.');
    }
    return this._chainType;
  }

  async send(from: string, to: string, amount: string, memo?: string): Promise<string> {
    return '';
  }

  // ToDo add stake method(s)

  async getBalance(address: string): Promise<bigint> {
    const balance = await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getBalance',
      chain: this.getConnectedChain(),
      params: {
        address,
      },
    }]) as string;
    return BigInt(balance);
  }

  async getBlock(blockNumber: number): Promise<Block> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getBlock',
      chain: this.getConnectedChain(),
      params: {
        block: blockNumber,
      },
    }]);
  }

  async getTransaction(transactionHash: string): Promise<Transaction> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getTransaction',
      chain: this.getConnectedChain(),
      params: {
        hash: transactionHash,
      },
    }]);
  }

  async getBlockNumber(): Promise<number> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getBlockNumber',
      chain: this.getConnectedChain(),
    }]);
  }

  async getNode({ address, blockHeight }: {address: string, blockHeight?: number}): Promise<Node> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getNode',
      chain: this.getConnectedChain(),
      params: {
        address,
        height: blockHeight,
      },
    }]);
  }

  async getApp({ address, blockHeight }: {address: string, blockHeight?: number}): Promise<App> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getApp',
      chain: this.getConnectedChain(),
      params: {
        address,
        height: blockHeight,
      },
    }]);
  }

  async getAccount(address: string): Promise<Account> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getAccount',
      chain: this.getConnectedChain(),
      params: {
        address,
      },
    }]);
  }

  async getAccountWithTransactions(address: string, options?: GetAccountWithTransactionsOptions): Promise<AccountWithTransactions> {
    return {} as AccountWithTransactions;
  }

}
