import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ErrorHandlerContext } from '../../hooks/error-handler-context';
import { ApiContext } from '../../hooks/api-context';
import * as bootstrap from 'bootstrap';
import { ChainType, LocalStorageKey } from '@nodewallet/constants';
import { setActiveChain } from '../../reducers/app-reducer';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';
import { RouteBuilder } from '@nodewallet/util-browser';
import { calledFromContentScript } from '../../util';

export const Navbar = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const {
    activeChain,
  } = useSelector(({ appState }: RootState) => appState);
  const fromContentScript = calledFromContentScript(location);

  const sendPattern = RouteBuilder.send.generatePathPattern();
  const accountDetailPatt = RouteBuilder.accountDetail.generatePathPattern();
  const walletsPatt = RouteBuilder.wallets.generatePathPattern();

  const [ originAllowed, setOriginAllowed ] = useState(true);

  // const onMenuClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  //   try {
  //     e.preventDefault();
  //     console.log('onMenuClick');
  //   } catch(err: any) {
  //     errorHandler.handle(err);
  //   }
  // };
  const onLockClick = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    try {
      e.preventDefault();
      const res = await api.lockUserAccount();
      if('error' in res) {
        errorHandler.handle(res.error);
      } else {
        window.close();
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };
  const onChainClick = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, chainType: ChainType) => {
    try {
      e.preventDefault();
      await chrome.storage.local.set({[LocalStorageKey.SELECTED_CHAIN]: chainType});
      dispatch(setActiveChain({activeChain: chainType}));
      navigate(RouteBuilder.wallets.fullPath());
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };
  const onOriginAllowedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOriginAllowed(!originAllowed);
  };

  const showChainDropdown = sendPattern.test(location.pathname)
    || accountDetailPatt.test(location.pathname)
    || walletsPatt.test(location.pathname);

  const styles = {
    nav: {
      minHeight: 36,
    },
  };

  return (
    <nav className="navbar bg-body-tertiary pt-0 pb-0 ps-2 pe-2 d-flex flex-row justify-content-start align-items-center" style={styles.nav}>
      <a href={'#'} title={'Pocket Network'} onClick={e => e.preventDefault()}>
        <img src={'/images/coins/pokt.png'} alt="Pocket" height={30} />
      </a>
      <div className={'flex-grow-1'} />
      {showChainDropdown ?
        <h4 className={'ms-1 mt-0 mb-0 dropdown-center'}>
          <a
            href={'#'}
            title={'Select chain'}
            className={'dropdown-toggle'}
            data-bs-toggle="dropdown"
            ref={(node) => {
              if(node) {
                new bootstrap.Dropdown(node);
              }
            }}
          >{activeChain}</a>
          {fromContentScript ?
            <ul className={'dropdown-menu'} />
            :
            <ul className={'dropdown-menu'}>
              {[ChainType.MAINNET, ChainType.TESTNET]
                .map((chainType) => {
                  return (
                    <li key={chainType}><a className="dropdown-item" href="#" onClick={e => onChainClick(e, chainType)}>{chainType}</a></li>
                  );
                })
              }
            </ul>
          }
        </h4>
        :
        null
      }
      <div className={'flex-grow-1'} />
      {/*<a href={'#'} title={'Menu'} onClick={onMenuClick}><i className={'mdi mdi-menu fs-2'} /></a>*/}
      <a href={'#'} title={originAllowed ? 'Tab allowed access to wallet' : 'Tab not allowed access to wallet'} onClick={onOriginAllowedClick}><i className={`mdi mdi-${originAllowed ? 'link' : 'link-off'} fs-2 ${originAllowed ? 'text-success' : ''} ${fromContentScript ? 'd-none' : ''}`} /></a>
      <a href={'#'} title={'Lock Wallets'} onClick={onLockClick} className={'ms-2'}><i className={`mdi mdi-lock-outline fs-2 ${fromContentScript ? 'd-none' : ''}`} /></a>
    </nav>
  );
};
