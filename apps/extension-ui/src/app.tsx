import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AccountDetail } from './components/account-detail';
import { Navbar } from './components/shared/navbar';
import { Container } from './components/shared/container';
import { RootState } from './store';
import { appView, MAX_BODY_WIDTH, POPUP_HEIGHT, POPUP_WIDTH } from './constants';
import { ManageWallets } from './components/manage-wallets';
import { NewHdWallet } from './components/new-hd-wallet';
import { SelectImportType } from './components/select-import-type';
import $ from 'jquery';
import { isTab } from './util';
import { setWindowHeight, setWindowWidth } from './reducers/app-reducer';

export const App = () => {

  const dispatch = useDispatch();

  const {
    activeView,
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
      </div>
    </div>
  );
};

