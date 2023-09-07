import React, { useContext, useEffect } from 'react';
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
import {
  setAccountBalances,
  setActiveChain,
  setActiveView,
  setUserAccount,
  setUserStatus
} from './reducers/app-reducer';
import { TOS } from './components/tos';
import { RegisterAccount } from './components/register-account';
import { SelectNewWalletType } from './components/select-new-wallet-type';
import { GetUserStatusResult } from '@nodewallet/types';
import { ApiContext } from './hooks/api-context';
import { ErrorHandlerContext } from './hooks/error-handler-context';
import { ChainType, LocalStorageKey, UserStatus } from '@nodewallet/constants';
import { UnlockAccount } from './components/unlock-account';
import isNull from 'lodash/isNull';
import { Send } from './components/send';

export const App = () => {

  const dispatch = useDispatch();
  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);

  const {
    activeView,
    userStatus,
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

    chrome.storage.local.get([LocalStorageKey.SELECTED_CHAIN])
      .then((res) => {
        console.log('selectedChain', res);
        dispatch(setActiveChain({
          activeChain: res[LocalStorageKey.SELECTED_CHAIN] || ChainType.MAINNET,
        }));
      })
      .catch((err) => errorHandler.handle(err));

    api.getUserStatus()
      .then(async (res: GetUserStatusResult) => {
        if('error' in res) {
          errorHandler.handle(res.error);
        } else {
          const { result } = res;
          if(result === UserStatus.NOT_REGISTERED) {
            if(isTab()) {
              dispatch(setActiveView({activeView: AppView.TOS}));
            } else {
              await api.startOnboarding();
              window.close();
            }
          } else if(result === UserStatus.LOCKED) {
            dispatch(setActiveView({activeView: AppView.UNLOCK_ACCOUNT}));
          } else if(result === UserStatus.UNLOCKED) {
            const getRes = await api.getUserAccount();
            if('error' in getRes) {
              errorHandler.handle(getRes.error);
            } else if(isNull(getRes.result)) {
              dispatch(setUserStatus({userStatus: UserStatus.LOCKED}));
              dispatch(setActiveView({activeView: AppView.UNLOCK_ACCOUNT}));
            } else {
              const { result: account } = getRes;
              dispatch(setUserAccount({userAccount: account}));
              if(account.wallets.length === 0) {
                if(isTab()) {
                  dispatch(setActiveView({activeView: AppView.SELECT_NEW_WALLET_TYPE}));
                } else {
                  await api.startNewWallet();
                  window.close();
                }
              } else {
                dispatch(setActiveView({activeView: AppView.MANAGE_WALLETS}));
              }
            }
          }
          dispatch(setUserStatus({
            userStatus: result,
          }));
        }
      })
      .catch(err => errorHandler.handle(err));

  }, [dispatch, api, errorHandler]);

  useEffect(() => {

    const getAccountBalances = async () => {
      try {
        const res = await api.getAccountBalances();
        if('error' in res) {
          errorHandler.handle(res.error);
        } else {
          dispatch(setAccountBalances({accountBalances: res.result}));
        }
      } catch(err: any) {
        errorHandler.handle(err);
      }
    };

    let interval: NodeJS.Timer;
    if(userStatus === UserStatus.UNLOCKED) {
      interval = setInterval(getAccountBalances, 10000);
      getAccountBalances()
        .catch(err => errorHandler.handle(err));
    }
    return () => {
      clearInterval(interval);
    };
  }, [dispatch, api, errorHandler, userStatus]);

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
          {[
            AppView.BLANK,
            AppView.TOS,
            AppView.REGISTER_ACCOUNT,
            AppView.SELECT_NEW_WALLET_TYPE,
            AppView.UNLOCK_ACCOUNT,
            AppView.SELECT_IMPORT_TYPE,
            AppView.NEW_HD_WALLET,
          ].includes(activeView) || !userStatus ? null : <Navbar />}
          <div className={'flex-grow-1 position-relative'}>
            {
              (!isTab() && !userStatus) || (activeView === AppView.BLANK) ?
                <div />
                :
                activeView === AppView.REGISTER_ACCOUNT ?
                  <RegisterAccount />
                  :
                  activeView === AppView.SELECT_NEW_WALLET_TYPE ?
                    <SelectNewWalletType />
                    :
                    activeView === AppView.UNLOCK_ACCOUNT ?
                      <UnlockAccount />
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
                                activeView === AppView.SEND ?
                                  <Send />
                                  :
                                  <div />
              }
          </div>
        </Container>
      </div>
    </div>
  );
};

