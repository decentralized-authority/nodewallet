# Nodewallet React SDK
Provides straightforward, programmatic access to the NodeWallet extension in React projects using the [NodeWallet SDK](https://github.com/decentralized-authority/nodewallet/tree/master/packages/sdk).

## Usage
Add the NodeWallet React SDK to your project:
```sh
npm install --save @decentralizedauthority/nodewallet-react-sdk
```
Add `NodeWalletProvider` to the top level of your application:
```tsx
import {
  NodeWalletProvider,
} from '@decentralizedauthority/nodewallet-react-sdk';

const AppContainer = () => {
  
  const nodeWalletOptions = {
    autoConnect: false,                // Optional. Auto connect on load. Defaults to false.
    connectTimeout: 10000,             // Optional. Timeout for connecting to the extension. Defaults to 10000ms.
    requestTimeout: 30000,             // Optional. Timeout for requests to the extension. Defaults to 30000ms.
    onConnectError: (err: Error) => {  // Optional. Called when there is an error on the initial connecting to the extension.
      console.error(err);
      alert('Unable to connect to the NodeWallet extension. Are you sure that you have it installed?');
    },
  };
  
  return (
    <NodeWalletProvider options={nodeWalletOptions}>
      <App />
    </NodeWalletProvider>
  );
};
```

Use the available hooks to interact with the NodeWallet extension:
```tsx
import {
  ConnectButton,
  useNodeWallet,
  useNodeWalletConnect,
} from '@decentralizedauthority/nodewallet-react-sdk';

export const App = () => {

  const {
    connected,
    address,
    publicKey,
    chain,
    pocket, // Instance of PocketProvider from the NodeWallet SDK
  } = useNodeWallet();

  // provides a function to initiate a connection to NodeWallet
  // not needed if autoConnect is set to true or if using the
  // ConnectButton component
  // const connect = useNodeWalletConnect();
  
  return (
    <div>
      <h1>NodeWallet React SDK Demo</h1>
      {!connected ?
        <ConnectButton />
        :
        <div>
          <p>Address: {address}</p>
          <p>Public Key: {publicKey}</p>
          <p>Chain: {chain}</p>
        </div>
      }
    </div>
  );
};
```
