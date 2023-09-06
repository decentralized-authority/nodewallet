import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppView } from '../../constants';
import { ErrorHandlerContext } from '../../hooks/error-handler-context';
import { ApiContext } from '../../hooks/api-context';
import * as bootstrap from 'bootstrap';
import { ChainType, LocalStorageKey } from '@nodewallet/constants';
import { setActiveChain, setActiveView } from '../../reducers/app-reducer';

export const Navbar = () => {

  const dispatch = useDispatch();
  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const {
    activeChain,
    activeView,
  } = useSelector(({ appState }: RootState) => appState);

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
      dispatch(setActiveView({activeView: AppView.MANAGE_WALLETS}));
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  return (
    <nav className="navbar bg-body-tertiary pt-0 pb-0 ps-2 pe-2 d-flex flex-row justify-content-start align-items-center">
      <a href={'#'} title={'Pocket Network'}>
        <img src={'/images/coins/pokt.png'} alt="Pocket" height={30} />
      </a>
      <div className={'flex-grow-1'} />
      {[AppView.ACCOUNT_DETAIL, AppView.MANAGE_WALLETS, AppView.SEND].includes(activeView) ?
        <h4 className={'ms-1 mt-0 mb-0 dropdown-center'}>
          <a
            href={'#'}
            title={'Mainnet'}
            className={'dropdown-toggle'}
            data-bs-toggle="dropdown"
            ref={(node) => {
              if(node) {
                new bootstrap.Dropdown(node);
              }
            }}
          >{activeChain}</a>
          <ul className={'dropdown-menu'}>
            {[ChainType.MAINNET, ChainType.TESTNET]
              .map((chainType) => {
                return (
                  <li key={chainType}><a className="dropdown-item" href="#" onClick={e => onChainClick(e, chainType)}>{chainType}</a></li>
                );
              })
            }
          </ul>
        </h4>
        :
        null
      }
      <div className={'flex-grow-1'} />
      {/*<a href={'#'} title={'Menu'} onClick={onMenuClick}><i className={'mdi mdi-menu fs-2'} /></a>*/}
      <a href={'#'} title={'Lock Wallets'} onClick={onLockClick} className={'ms-1'}><i className={'mdi mdi-lock-outline fs-2'} /></a>
    </nav>
  );
};
