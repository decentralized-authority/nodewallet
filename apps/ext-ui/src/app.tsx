import React from 'react';
import { useSelector } from 'react-redux';
import { AccountDetail } from './components/account-detail';
import { Navbar } from './components/shared/navbar';
import { Container } from './components/shared/container';
import { RootState } from './store';
import { appView } from './constants';
import { ManageWallets } from './components/manage-wallets';

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
            activeView === appView.WALLETS ?
              <ManageWallets />
              :
              <div />
        }
      </div>
    </Container>
  );
};
