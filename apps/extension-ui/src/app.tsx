import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar } from './components/shared/navbar';
import { Container } from './components/shared/container';
import { RootState } from './store';
import { MAX_BODY_WIDTH, POPUP_HEIGHT, POPUP_WIDTH } from './constants';
import $ from 'jquery';
import { isTab } from './util';
import {
  setAccountBalances,
  setActiveChain,
  setUserAccount,
  setUserStatus
} from './reducers/app-reducer';
import { GetUserStatusResult } from '@nodewallet/types';
import { ApiContext } from './hooks/api-context';
import { ErrorHandlerContext } from './hooks/error-handler-context';
import { ChainType, LocalStorageKey, UserStatus } from '@nodewallet/constants';
import isNull from 'lodash/isNull';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  findCryptoAccountInUserAccount,
  getAccountDetailParamsFromUserAccount,
  RouteBuilder
} from '@nodewallet/util-browser';

export const App = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);

  const {
    userStatus,
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
              navigate(RouteBuilder.tos.fullPath());
            } else {
              await api.startOnboarding();
              window.close();
            }
          } else if(result === UserStatus.LOCKED) {
            navigate(RouteBuilder.unlock.fullPath());
          } else if(result === UserStatus.UNLOCKED) {
            const getRes = await api.getUserAccount();
            if('error' in getRes) {
              errorHandler.handle(getRes.error);
            } else if(isNull(getRes.result)) {
              dispatch(setUserStatus({userStatus: UserStatus.LOCKED}));
              navigate(RouteBuilder.unlock.fullPath());
            } else {
              const { result: account } = getRes;
              dispatch(setUserAccount({userAccount: account}));
              if(account.wallets.length === 0) {
                if(isTab()) {
                  navigate(RouteBuilder.selectNewWalletType.fullPath());
                } else {
                  await api.startNewWallet();
                  window.close();
                }
              } else {
                const activeAccountRes = await api.getActiveAccount();
                if('error' in activeAccountRes) {
                  errorHandler.handle(activeAccountRes.error);
                } else {
                  if(activeAccountRes.result) {
                    const cryptoAccount = findCryptoAccountInUserAccount(account, activeAccountRes.result);
                    if(cryptoAccount) {
                      const accountDetailParams = getAccountDetailParamsFromUserAccount(account, cryptoAccount.id);
                      if(accountDetailParams) {
                        navigate(RouteBuilder.accountDetail.generateFullPath(accountDetailParams));
                      } else {
                        navigate(RouteBuilder.wallets.fullPath());
                      }
                    } else {
                      navigate(RouteBuilder.wallets.fullPath());
                    }
                  } else {
                    navigate(RouteBuilder.wallets.fullPath());
                  }
                }
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

  const hideNavbarPatterns = [
    RouteBuilder.tos.generatePathPattern(),
    RouteBuilder.registerAccount.generatePathPattern(),
    RouteBuilder.selectNewWalletType.generatePathPattern(),
    RouteBuilder.unlock.generatePathPattern(),
    RouteBuilder.newHdWallet.generatePathPattern(),
    RouteBuilder.openPopupInfo.generatePathPattern(),
  ];

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
          {!userStatus || hideNavbarPatterns.some(p => p.test(location.pathname)) ? null : <Navbar />}
          <div className={'flex-grow-1 position-relative'}>
            <Outlet />
          </div>
        </Container>
      </div>
    </div>
  );
};
