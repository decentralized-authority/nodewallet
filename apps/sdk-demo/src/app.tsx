import React, { useEffect, useState } from 'react';
import { ChainType, NodeWalletSDK } from '@nodewallet/sdk';
import isNull from 'lodash/isNull';

export const App = () => {

  const [ sdkOptimized, setSdkOptimized ] = useState<boolean|null>(false);
  const [ address, setAddress ] = useState<string>('');
  const [ chain, setChain ] = useState<ChainType|null>(null);
  const [ balance, setBalance ] = useState<string>('');

  useEffect(() => {
    const sdk = new NodeWalletSDK();
    sdk.getPocket()
      .then(async (pocket) => {
        const optimized = await pocket.isNodeWalletSdkOptimized();
        setSdkOptimized(optimized);
        await pocket.connect();
        const connectedAddress = pocket.getConnectedAddress();
        setAddress(connectedAddress);
        const chain = pocket.getConnectedChain();
        setChain(chain);
        const balance = await pocket.getBalance(connectedAddress);
        // const balance = await pocket.getBalance('5340d7a8637a2f355f3c1acb05635f6aaad0d2ab');
        console.log('balance', balance);
        setBalance(balance.toString(10));
      });
  }, []);

  return (
    <div>
      <h1>NodeWallet SDK Demo</h1>
      {!isNull(sdkOptimized) ?
        <div>
          <div>SDK Optimized:</div>
          <p><strong>{sdkOptimized ? 'Yes' : 'No'}</strong></p>
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
      {chain ?
        <div>
          <div>Chain:</div>
          <p><strong>{chain}</strong></p>
        </div>
        :
        null
      }
      {balance ?
        <div>
          <div>Balance:</div>
          <p><strong>{balance}</strong></p>
        </div>
        :
        null
      }
    </div>
  );
};
