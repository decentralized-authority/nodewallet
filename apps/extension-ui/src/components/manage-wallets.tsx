import React, { useContext, useEffect } from 'react';
import { Container } from './shared/container';
import { WalletCard } from './shared/wallet-card';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';

export const ManageWallets = () => {

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

  const onImportWalletClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // dispatch(setActiveView({activeView: AppView.SELECT_IMPORT_TYPE}));
  };
  const onNewWalletClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // dispatch(setActiveView({activeView: AppView.NEW_HD_WALLET}));
  };

  return (
    <Container>
      <h3 className={'ps-2 pe-2'}>Manage wallets</h3>
      <div className={'flex-grow-1 position-relative'}>
        <div className={'position-absolute top-0 start-0 end-0 bottom-0 overflow-x-hidden overflow-y-auto'}>
          {userAccount?.wallets
            .map((wallet) => {
              return (
                <WalletCard wallet={wallet} />
              );
            })
          }
        </div>
      </div>
      <div className={'d-flex flex-row justify-content-start p-2'}>
        <button className={'btn btn-primary flex-grow-1 me-2'} onClick={onImportWalletClick}><i className={'mdi mdi-upload'} /> Import wallet</button>
        <button className={'btn btn-primary flex-grow-1'} onClick={onNewWalletClick}><i className={'mdi mdi-plus-thick'} /> New HD wallet</button>
      </div>
    </Container>
  );
};
