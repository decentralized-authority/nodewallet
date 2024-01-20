import React, { useEffect, useState } from 'react';
import {
  useNodeWallet,
  NodeWalletProvider,
  useNodeWalletConnect
} from '@decentralizedauthority/nodewallet-react-sdk';

export const App = () => {

  const [ balance, setBalance ] = useState<string>('');

  const {
    connected,
    address,
    publicKey,
    chain,
    pocket,
  } = useNodeWallet();
  const connect = useNodeWalletConnect();

  useEffect(() => {
    if(connected) {
      pocket.wallet.balance(address)
        .then(({ balance }) => {
          setBalance(balance.toString());
        })
        .catch((error: any) => {
          console.error(error);
          alert('Unable to connect to the NodeWallet extension. Are you sure that you have it installed?');
        });
    }
  }, [connected, address, pocket]);

  const onConnectButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    connect();
  };

  return (
    <div>
      <h1>NodeWallet SDK Demo</h1>
      {connected ?
        null
        :
        <button onClick={onConnectButtonClick}>Connect</button>
      }
      {chain ?
        <div>
          <div>Chain:</div>
          <p><strong>{chain}</strong></p>
        </div>
        :
        null
      }
      {address ?
        <div>
          <div>Address:</div>
          <p><strong>{address}</strong></p>
        </div>
        :
        null
      }
      {publicKey ?
        <div>
          <div>Public Key:</div>
          <p><strong>{publicKey}</strong></p>
        </div>
        :
        null
      }
      {balance ?
        <div>
          <div>Balance:</div>
          <p><strong>{balance} uPOKT</strong></p>
        </div>
        :
        null
      }
    </div>
  );
};
export const AppContainer = () => {

  const nodeWalletOptions = {
    autoConnect: false,
    connectTimeout: 10000,
    requestTimeout: 10000,
    onConnectError: (err: Error) => {
      console.error(err);
    },
  };

  return (
    <NodeWalletProvider options={nodeWalletOptions}>
      <App />
    </NodeWalletProvider>
  );
};
