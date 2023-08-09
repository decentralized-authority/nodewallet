import React from 'react';
import { useSelector } from 'react-redux';
import { AccountDetail } from './components/account-detail';
import { Navbar } from './components/shared/navbar';
import { Container } from './components/shared/container';
import { RootState } from './store';
import { appView } from './constants';
import { ManageWallets } from './components/manage-wallets';
import { NewHdWallet } from './components/new-hd-wallet';
import { SelectImportType } from './components/select-import-type';

export const App = () => {

  const {
    activeView,
  } = useSelector(({ appState }: RootState) => appState);

  return (
    <Container>
      <Navbar />
      <div className={'flex-grow-1 position-relative'}>
        {
          activeView === appView.ACCOUNT_DETAIL ?
            <AccountDetail />
            :
            activeView === appView.MANAGE_WALLETS ?
              <ManageWallets />
              :
              activeView === appView.NEW_HD_WALLET ?
                <NewHdWallet />
                :
                activeView === appView.SELECT_IMPORT_TYPE ?
                  <SelectImportType />
                  :
                  <div />
        }
      </div>
    </Container>
  );
};
