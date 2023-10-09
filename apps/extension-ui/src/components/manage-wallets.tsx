import React, { useContext, useEffect } from 'react';
import { Container } from './shared/container';
import { WalletCard } from './shared/wallet-card';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';

export interface ManageWalletsProps {
  selectAccount?: boolean
}
export const ManageWallets = ({ selectAccount = false }: ManageWalletsProps) => {

  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const dispatch = useDispatch();
  const {
    activeChain,
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);

  useEffect(() => {
    api.saveActiveAccount({
      accountId: '',
    }).catch((err) => {
      errorHandler.handle(err);
    })
  }, [api, errorHandler]);

  const onImportWalletClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await api.startNewWallet();
    window.close();
  };

  return (
    <Container>
      <h3 className={'ps-2 pe-2'}>{selectAccount ? 'Select Account' : 'Manage wallets'}</h3>
      {selectAccount ?
        <p className={'ps-2 pe-2'}>You currently do not have a wallet account selected. Please select an account to continue.</p>
        :
        null
      }
      <div className={'flex-grow-1 position-relative'}>
        <div className={'position-absolute top-0 start-0 end-0 bottom-0 overflow-x-hidden overflow-y-auto'}>
          {userAccount?.wallets
            .filter((wallet) => !wallet.legacy || wallet.accounts.some((account) => account.chain === activeChain))
            .map((wallet) => {
              return (
                <WalletCard wallet={wallet} selectAccount={selectAccount} />
              );
            })
          }
        </div>
      </div>
      {selectAccount ?
        null
        :
        <div className={'d-flex flex-row justify-content-start p-2'}>
          <button className={'btn btn-outline-primary me-2'} onClick={onImportWalletClick}><i className={'mdi mdi-upload'} /> Add/Import wallet</button>
        </div>
      }
    </Container>
  );
};
