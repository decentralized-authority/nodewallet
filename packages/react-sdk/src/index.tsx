import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ChainType } from '@decentralizedauthority/nodewallet-constants';
import { NodeWalletSDK, PocketProvider } from '@decentralizedauthority/nodewallet-sdk';

const defaultConnectTimeout = 10000;
const defaultRequestTimeout = 30000;

export interface NodeWalletState {
  connected: boolean
  address: string
  publicKey: string
  chain: ChainType|string
  pocket: PocketProvider|null
}
export interface NodeWalletNotConnectedState extends NodeWalletState {
  connected: false
  address: ''
  publicKey: ''
  chain: ''
  pocket: null
}
export interface NodeWalletConnectedState extends NodeWalletState {
  connected: true
  address: string
  publicKey: string
  chain: ChainType
  pocket: PocketProvider
}
const defaultNodeWalletState = (): NodeWalletNotConnectedState => {
  return {
    connected: false,
    address: '',
    publicKey: '',
    chain: '',
    pocket: null
  };
};

const NodeWalletStateContext = createContext<NodeWalletConnectedState|NodeWalletNotConnectedState>(defaultNodeWalletState());
export const useNodeWallet = () => useContext(NodeWalletStateContext);

const NodeWalletConnectContext = createContext<()=>void>(()=>{});
export const useNodeWalletConnect = () => useContext(NodeWalletConnectContext);

const connectToNodeWallet = async (options: NodeWalletProviderOptions): Promise<NodeWalletConnectedState> => {
  const {
    connectTimeout = defaultConnectTimeout,
    requestTimeout = defaultRequestTimeout,
  } = options;
  const sdk = new NodeWalletSDK({
    connectTimeout,
    requestTimeout
  });
  const pocket = await sdk.getPocket();
  const { address, publicKey, chain } = await pocket.connect();
  return {
    connected: true,
    address,
    publicKey,
    chain,
    pocket,
  };
};

export interface NodeWalletProviderOptions {
  autoConnect?: boolean
  connectTimeout?: number
  requestTimeout?: number
  onConnectError?: (error: Error) => void
}
const NodeWalletInnerProvider = ({ children, options, setState }: {children: any, options: NodeWalletProviderOptions, setState: (newState: NodeWalletConnectedState)=>void}) => {

  const {
    autoConnect = false,
    onConnectError,
  } = options;

  const { connected } = useContext(NodeWalletStateContext);

  useEffect(() => {
    if (autoConnect && !connected) {
      connectToNodeWallet(options)
        .then((newState) => {
          setState(newState);
        })
        .catch((error: any) => {
          if (onConnectError) {
            onConnectError(error);
          }
        });
    }
  }, [autoConnect, connected]);

  const connect = useCallback(() => {
    if (connected) {
      return;
    }
    connectToNodeWallet(options)
      .then((newState) => {
        setState(newState);
      })
      .catch((error: any) => {
        if (onConnectError) {
          onConnectError(error);
        }
      });
  }, [connected]);

  return (
    <NodeWalletConnectContext.Provider value={connect}>
      {children}
    </NodeWalletConnectContext.Provider>
  );
};
export const NodeWalletProvider = ({ children, options }: {children: any, options?: NodeWalletProviderOptions}) => {

  const [ state, setState ] = useState<NodeWalletConnectedState|NodeWalletNotConnectedState>(defaultNodeWalletState());

  return (
    <NodeWalletStateContext.Provider value={state}>
      <NodeWalletInnerProvider options={options || {}} setState={setState}>
        {children}
      </NodeWalletInnerProvider>
    </NodeWalletStateContext.Provider>
  );
};
