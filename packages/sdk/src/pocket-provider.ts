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

export class PocketProviderRpc {

  _pocketNetwork: PocketNetwork
  _requestTimeout: number;
  _getConnectedChain: () => ChainType;

  constructor(pocketNetwork: PocketNetwork, requestTimeout: number, getConnectedChain: () => ChainType) {
    this._pocketNetwork = pocketNetwork;
    this._requestTimeout = requestTimeout;
    this._getConnectedChain = getConnectedChain;
  }

  async getBalance(address: string): Promise<bigint> {
    const balance = await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getBalance',
      chain: this._getConnectedChain(),
      params: {
        address,
      },
    }]) as string;
    return BigInt(balance);
  }

  async getBlock(blockNumber: number): Promise<Block> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getBlock',
      chain: this._getConnectedChain(),
      params: {
        block: blockNumber,
      },
    }]);
  }

  async getTransaction(transactionHash: string): Promise<Transaction> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getTransaction',
      chain: this._getConnectedChain(),
      params: {
        hash: transactionHash,
      },
    }]);
  }

  async getBlockNumber(): Promise<number> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getBlockNumber',
      chain: this._getConnectedChain(),
    }]);
  }

  async getNode({ address, blockHeight }: {address: string, blockHeight?: number}): Promise<Node> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getNode',
      chain: this._getConnectedChain(),
      params: {
        address,
        height: blockHeight,
      },
    }]);
  }

  async getApp({ address, blockHeight }: {address: string, blockHeight?: number}): Promise<App> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getApp',
      chain: this._getConnectedChain(),
      params: {
        address,
        height: blockHeight,
      },
    }]);
  }

  async getAccount(address: string): Promise<Account> {
    return await this._pocketNetwork.send(PocketNetworkMethod.RPC_REQUEST, [{
      method: 'getAccount',
      chain: this._getConnectedChain(),
      params: {
        address,
      },
    }]);
  }

  async getAccountWithTransactions(address: string, options?: GetAccountWithTransactionsOptions): Promise<AccountWithTransactions> {
    return {} as AccountWithTransactions;
  }

}

export class PocketProviderWallet {

  _pocketNetwork: PocketNetwork
  _requestTimeout: number;
  _getConnectedChain: () => ChainType;
  _getConnectedAddress: () => string;

  constructor(pocketNetwork: PocketNetwork, requestTimeout: number, getConnectedChain: () => ChainType, getConnectionAddress: () => string) {
    this._pocketNetwork = pocketNetwork;
    this._requestTimeout = requestTimeout;
    this._getConnectedChain = getConnectedChain;
    this._getConnectedAddress = getConnectionAddress;
  }

  balance(address: string): Promise<{balance: number}> {
    return this._pocketNetwork.send(PocketNetworkMethod.BALANCE, [{address}]);
  }

  height(): Promise<{height: number}> {
    return this._pocketNetwork.send(PocketNetworkMethod.HEIGHT);
  }

  tx(hash: string): Promise<Transaction> {
    return this._pocketNetwork.send(PocketNetworkMethod.TX, [{hash}]);
  }

  sendTransaction({ amount, to, from, memo = '' }: {amount: string, to: string, from: string, memo?: string}): Promise<{hash: string}> {
    return this._pocketNetwork.send(PocketNetworkMethod.SEND_TRANSACTION, [{amount, to, from, memo}]);
  }

  stakeNode({ address, amount, operatorPublicKey, chains, serviceURL }: {amount: string, address: string, operatorPublicKey: string, chains: string[], serviceURL: string}): Promise<{hash: string}> {
    return this._pocketNetwork.send(PocketNetworkMethod.STAKE_NODE, [{amount, address, operatorPublicKey, chains, serviceURL}]);
  }

  signMessage({ message, address }: {message: string, address: string}): Promise<{signature: string}> {
    return this._pocketNetwork.send(PocketNetworkMethod.SIGN_MESSAGE, [{message, address}]);
  }

}

export class PocketProvider {

  _pocketNetwork: PocketNetwork
  _requestTimeout: number;
  private _address: string = '';
  private _publicKey: string = '';
  private _chainType: ChainType = ChainType.MAINNET;
  private _nwSdkOptimized: boolean = false;

  rpc: PocketProviderRpc;
  wallet: PocketProviderWallet;

  constructor(pocketNetwork: PocketNetwork, requestTimeout: number) {
    this._pocketNetwork = pocketNetwork;
    this._requestTimeout = requestTimeout;
    this.rpc = new PocketProviderRpc(pocketNetwork, requestTimeout, () => this.getConnectedChain());
    this.wallet = new PocketProviderWallet(pocketNetwork, requestTimeout, () => this.getConnectedChain(), () => this.getConnectedAddress());
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

  async connect(): Promise<{address: string, publicKey: string, chain: ChainType}> {
    // ToDo use pokt_getAccounts to get active account
    const [ address ] = await this._pocketNetwork.send(PocketNetworkMethod.REQUEST_ACCOUNTS);
    this._address = address;
    try {
      const { chain } = await this._pocketNetwork.send(PocketNetworkMethod.CHAIN);
      this._chainType = chain;
    } catch (err) {
      // do nothing and leave the default because the wallet is not SDK optimized
    }
    try {
      const { publicKey } = await this._pocketNetwork.send(PocketNetworkMethod.PUBLIC_KEY, [{address}]);
      this._publicKey = publicKey;
    } catch (err) {
      // do nothing and leave the default because the wallet is not SDK optimized
    }
    this._nwSdkOptimized = await this.isNodeWalletSdkOptimized();
    return {
      address,
      publicKey: this._publicKey,
      chain: this._chainType,
    };
  }

  getConnectedAddress(): string {
    this.checkConnected();
    return this._address;
  }

  getConnectedPublicKey(): string {
    this.checkConnected();
    if (!this._nwSdkOptimized) {
      console.warn('The connected wallet is not Node Wallet SDK optimized. The wallet does not expose the public key.');
    }
    return this._publicKey;
  }

  getConnectedChain(): ChainType {
    this.checkConnected();
    if (!this._nwSdkOptimized) {
      console.warn('The connected wallet is not Node Wallet SDK optimized. The wallet does not expose the chain type, so MAINNET is assummed.');
    }
    return this._chainType;
  }

  // ToDo add stake method(s)

}
