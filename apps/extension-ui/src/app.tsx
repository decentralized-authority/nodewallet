import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AccountDetail } from './components/account-detail';
import { Navbar } from './components/shared/navbar';
import { Container } from './components/shared/container';
import { RootState } from './store';
import { AppView, MAX_BODY_WIDTH, POPUP_HEIGHT, POPUP_WIDTH } from './constants';
import { ManageWallets } from './components/manage-wallets';
import { NewHdWallet } from './components/new-hd-wallet';
import { SelectImportType } from './components/select-import-type';
import $ from 'jquery';
import { isTab } from './util';
import { setActiveView, setUserAccount, setWindowHeight, setWindowWidth } from './reducers/app-reducer';
import { TOS } from './components/tos';
import { UserAccount } from '@nodewallet/constants';

export const App = () => {

  const dispatch = useDispatch();

  const {
    activeView,
    userAccount,
    windowWidth,
  } = useSelector(({ appState }: RootState) => appState);

  useEffect(() => {

    if(isTab()) {
      $('body').css({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        position: 'absolute',
      });
    } else {
      $('body').css({
        width: POPUP_WIDTH,
        height: POPUP_HEIGHT,
        position: 'relative',
      });
    }

    window.addEventListener('resize', () => {
      dispatch(setWindowHeight({windowHeight: window.innerHeight}));
      dispatch(setWindowWidth({windowWidth: window.innerWidth}));
    });

    // ToDo get user account from background worker
    const userAccount: UserAccount = {
      tosAccepted: '',
    };
    dispatch(setUserAccount({
      userAccount,
    }));
    if (!userAccount.tosAccepted) {
      dispatch(setActiveView({activeView: AppView.TOS}));
    }

  }, [dispatch]);

  const styles = {
    outerFlexContainer: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    innerFlexContainer: {
      width: windowWidth > MAX_BODY_WIDTH ? MAX_BODY_WIDTH : windowWidth,
      minWidth: POPUP_WIDTH,
    },
  };

  return (
    <div
      className={'position-absolute d-flex flex-column justify-content-center align-items-center'}
      style={styles.outerFlexContainer as React.CSSProperties}
    >
      <div
        className={'position-relative flex-grow-1'}
        style={styles.innerFlexContainer as React.CSSProperties}
      >
        <Container>
          {[AppView.TOS].includes(activeView) ? null : <Navbar />}
          <div className={'flex-grow-1 position-relative'}>
            {
              !userAccount ?
                <div />
                :
                activeView === AppView.ACCOUNT_DETAIL ?
                  <AccountDetail />
                  :
                  activeView === AppView.MANAGE_WALLETS ?
                    <ManageWallets />
                    :
                    activeView === AppView.NEW_HD_WALLET ?
                      <NewHdWallet />
                      :
                      activeView === AppView.SELECT_IMPORT_TYPE ?
                        <SelectImportType />
                        :
                        activeView === AppView.TOS ?
                          <TOS />
                          :
                          <div />
              }
          </div>
        </Container>
      </div>
    </div>
  );
};

