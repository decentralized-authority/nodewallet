import React, { useEffect, useRef, useState } from 'react';
import { ChainType, NodeWalletSDK } from '@nodewallet/sdk';
import isNull from 'lodash/isNull';
import { PocketProvider } from '@nodewallet/sdk/dist/pocket-provider';

const handleError = (err: any) => {
  console.error(err);
  alert(err.message);
};

export const App = () => {

  const pocketRef = useRef<PocketProvider>();

  const [ sdkOptimized, setSdkOptimized ] = useState<boolean|null>(false);
  const [ address, setAddress ] = useState<string>('');
  const [ publicKey, setPublicKey ] = useState<string>('');
  const [ chain, setChain ] = useState<ChainType|null>(null);
  const [ balance, setBalance ] = useState<string>('');
  const [ height, setHeight ] = useState<number|null>(null);
  const [ txRecipient, setTxRecipient ] = useState<string>('');
  const [ txAmount, setTxAmount ] = useState<string>('');
  const [ txMemo, setTxMemo ] = useState<string>('');
  const [ signingPayload, setSigningPayload ] = useState<string>('');
  const [ signature, setSignature ] = useState<string>('');
  const [ txid, setTxid ] = useState<string>('');
  const [ transaction, setTransaction ] = useState<any>(null);
  const [ stakeAmount, setStakeAmount ] = useState<string>('');
  const [ stakeServiceUrl, setStakeServiceUrl ] = useState<string>('');
  const [ stakeChains, setStakeChains ] = useState<string>('');
  const [ stakeOperatorPublicKey, setStakeOperatorPublicKey ] = useState<string>('');

  useEffect(() => {
    const sdk = new NodeWalletSDK();
    sdk.getPocket()
      .then(async (pocket) => {
        pocketRef.current = pocket;

        // Check if wallet is SDK optimized
        const optimized = await pocket.isNodeWalletSdkOptimized();
        setSdkOptimized(optimized);

        // Connect to extension wallet
        const res = await pocket.connect();
        console.log('connected account', res);

        // Get account address
        const connectedAddress = pocket.getConnectedAddress();
        setAddress(connectedAddress);

        // Get account public key
        const connectedPublicKey = pocket.getConnectedPublicKey();
        setPublicKey(connectedPublicKey);

        // Get active chain
        const chain = pocket.getConnectedChain();
        setChain(chain);

        // Get account balance
        const { balance } = await pocket.wallet.balance(connectedAddress);
        setBalance(balance.toString(10));

        // Get chain height
        const { height } = await pocket.wallet.height();
        setHeight(height);

        // {
        //   // RPC Methods
        //   const poktAccount = await pocket.rpc.getAccount(connectedAddress);
        //   console.log('poktAccount', poktAccount);
        //   const balance = await pocket.rpc.getBalance(connectedAddress);
        //   console.log('balance', balance);
        //   const height = await pocket.rpc.getBlockNumber();
        //   console.log('height', height);
        //   const block = await pocket.rpc.getBlock(height);
        //   console.log('block', block);
        // }

      })
      .catch((err) => {
        handleError(err);
      });
  }, []);

  const onTxRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTxRecipient(e.target.value);
  };
  const onTxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTxAmount(e.target.value);
  };
  const onTxMemoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTxMemo(e.target.value);
  };
  const onSigningPayloadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSigningPayload(e.target.value);
  };
  const onTxidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTxid(e.target.value);
  };
  const onStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setStakeAmount(e.target.value);
  };
  const onStakeServiceUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setStakeServiceUrl(e.target.value);
  };
  const onStakeChainsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setStakeChains(e.target.value);
  };
  const onStakeOperatorPublicKeyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setStakeOperatorPublicKey(e.target.value);
  };

  // Send Transaction
  const onSendTransactionSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!pocketRef.current) {
        return;
      }
      const pocket = pocketRef.current;
      try {
        const { hash } = await pocket.wallet.sendTransaction({
          amount: txAmount,
          to: txRecipient,
          from: address,
          memo: txMemo
        });
        alert(`Transaction sent with hash:\n\n${hash}`);
        setTxRecipient('');
        setTxAmount('');
        setTxMemo('');
      } catch (err) {
        handleError(err);
      }
    } catch (err) {
      handleError(err);
    }
  };

  // Sign Message
  const onSignSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!pocketRef.current) {
        return;
      }
      const pocket = pocketRef.current;
      const res = await pocket.wallet.signMessage({
        message: signingPayload,
        address,
      });
      setSignature(res.signature);
    } catch (err) {
      handleError(err);
    }
  };

  // Get Transaction
  const onGetTransactionSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!pocketRef.current) {
        return;
      }
      const pocket = pocketRef.current;
      const tx = await pocket.wallet.tx(txid);
      setTransaction(tx);
    } catch (err) {
      handleError(err);
    }
  };

  // Stake Node
  const onStakeSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!pocketRef.current) {
        return;
      }
      const pocket = pocketRef.current;
      const { hash } = await pocket.wallet.stakeNode({
        amount: stakeAmount,
        chains: stakeChains.split(','),
        address,
        operatorPublicKey: stakeOperatorPublicKey,
        serviceURL: stakeServiceUrl,
      });
      alert(`Stake transaction sent with hash:\n\n${hash}`);
      setStakeAmount('');
      setStakeServiceUrl('');
      setStakeChains('');
      setStakeOperatorPublicKey('');
    } catch (err) {
      handleError(err);
    }
  };

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
      {chain ?
        <div>
          <div>Chain:</div>
          <p><strong>{chain}</strong></p>
        </div>
        :
        null
      }
      {height ?
        <div>
          <div>Height:</div>
          <p><strong>{height}</strong></p>
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
      <div>
        <h2>Send Transaction</h2>
        <form onSubmit={onSendTransactionSubmit}>
          <div>
            <label>Recipient Address:</label>
            <input type="text" placeholder="Enter recipient address" value={txRecipient}
                   onChange={onTxRecipientChange}/>
          </div>
          <div>
            <label>Amount in uPOKT:</label>
            <input type="number" placeholder="Enter amount" value={txAmount} onChange={onTxAmountChange}/>
          </div>
          <div>
            <label>Memo (optional):</label>
            <input type="text" placeholder="Enter memo" value={txMemo} onChange={onTxMemoChange}/>
          </div>
          <button type="submit">Send Transaction</button>
        </form>
      </div>

      <div>
        <h2>Sign Message</h2>
        <form onSubmit={onSignSubmit}>
          <div>
            <label>Message:</label>
            <input type="text" placeholder="Message to sign" value={signingPayload} onChange={onSigningPayloadChange}/>
          </div>
          <button type="submit">Sign Message</button>
        </form>
        {signature ?
          <div style={styles.signatureContainer as React.CSSProperties}>{signature}</div>
          :
          null
        }
      </div>

      <div>
        <h2>Get Transaction</h2>
        <form onSubmit={onGetTransactionSubmit}>
          <div>
            <label>Transaction Hash:</label>
            <input type="text" placeholder="Transaction Hash" value={txid} onChange={onTxidChange}/>
          </div>
          <button type="submit">Get Transaction</button>
        </form>
        {transaction ?
          <div style={styles.txContainer as React.CSSProperties}>{JSON.stringify(transaction, null, '  ')}</div>
          :
          null
        }
      </div>

      <div>
        <h2>Stake Node</h2>
        <form onSubmit={onStakeSubmit}>
          <div>
            <label>Amount in uPOKT:</label>
            <input type="number" placeholder="Enter amount to stake" value={stakeAmount}
                   onChange={onStakeAmountChange}/>
          </div>
          <div>
            <label>Service URL:</label>
            <input type="text" placeholder="Enter service URL" value={stakeServiceUrl}
                   onChange={onStakeServiceUrlChange}/>
          </div>
          <div>
            <label>Chains:</label>
            <input type="text" placeholder="Enter chains, separated by comma" value={stakeChains}
                   onChange={onStakeChainsChange}/>
          </div>
          <div>
            <label>Operator Public Key:</label>
            <textarea rows={3} style={styles.textarea as React.CSSProperties} placeholder="Enter operator public key"
                      value={stakeOperatorPublicKey} onChange={onStakeOperatorPublicKeyChange}/>
          </div>
          <button type="submit">Stake Node</button>
        </form>
      </div>

    </div>
  );
};

const styles = {
  signatureContainer: {
    fontFamily: 'monospace',
    overflowWrap: 'break-word',
  },
  txContainer: {
    fontFamily: 'monospace',
    whiteSpace: 'pre',
  },
  textarea: {
    resize: 'vertical',
  },
}
