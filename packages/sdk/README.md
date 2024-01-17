# NodeWallet SDK
Provides straightforward, programmatic access to the NodeWallet extension wallet in TypeScript/JavaScript projects.

## Available Methods
```ts
class NodeWalletSDK {
  getPocket(): Promise<PocketProvider>
}
class PocketProvider {

  connect(): Promise<{address: string, publicKey: string, chain: ChainType}>
  
  checkConnected(): void;
  isNodeWalletSdkOptimized(): Promise<boolean>
  isConnected(): Promise<boolean>
  getConnectedAddress(): string
  getConnectedPublicKey(): string
  getConnectedChain(): ChainType
  
  wallet: PocketProviderWallet
  rpc: PocketProviderRpc
  
}

class PocketProviderWallet {
  balance(address: string): Promise<{balance: number}>
  height(): Promise<{height: number}>
  tx(hash: string): Promise<Transaction>
  sendTransaction(params: {amount: string, to: string, from: string, memo?: string}): Promise<{hash: string}>
  signMessage(params: {message: string, address: string}): Promise<{signature: string}>
  stakeNode(params: {amount: string, address: string, operatorPublicKey: string, chains: string[], serviceURL: string}): Promise<{hash: string}>
}

class PocketProviderRpc {
  getBalance(address: string): Promise<bigint>
  getBlock(blockNumber: number): Promise<Block>
  getTransaction(transactionHash: string): Promise<Transaction>
  getBlockNumber(): Promise<number>
  getNode(params: {address: string, blockHeight?: number}): Promise<Node>
  getApp(params: {address: string, blockHeight?: number}): Promise<App>
  getAccount(address: string): Promise<Account>
}
```

## Usage
```ts
// Construct the SDK
const sdk = new NodeWalletSDK({
  connectTimeout: 30000,
  requestTimeout: 30000,
});
// Get the Pocket Provider
const pocket = await sdk.getPocket();
// Connect to the extension wallet
const { address, publicKey, chain } = await pocket.connect();
// You can now call any of the available methods in pocket.wallet and pocket.rpc
```
