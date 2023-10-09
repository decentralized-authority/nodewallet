import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ErrorHandlerContext } from '../../hooks/error-handler-context';
import { ApiContext } from '../../hooks/api-context';
import * as bootstrap from 'bootstrap';
import { ChainType, LocalStorageKey } from '@nodewallet/constants';
import { setActiveChain, setUserAccount } from '../../reducers/app-reducer';
import { useLocation, useNavigate } from 'react-router-dom';
import { RouteBuilder } from '@nodewallet/util-browser';
import { calledFromContentScript } from '../../util';
import swal from 'sweetalert';

export const Navbar = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const {
    activeChain,
    activeTabOrigin,
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);
  const fromContentScript = calledFromContentScript(location);

  const sendPattern = RouteBuilder.send.generatePathPattern();
  const accountDetailPatt = RouteBuilder.accountDetail.generatePathPattern();
  const walletsPatt = RouteBuilder.wallets.generatePathPattern();

  const [ originAllowed, setOriginAllowed ] = React.useState(false);

  useEffect(() => {
    const { allowedOrigins = [] } = userAccount ? userAccount : {};
    setOriginAllowed(allowedOrigins.some(o => o.origin === activeTabOrigin));
  }, [userAccount, activeTabOrigin]);

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
  const onSettingsClick = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    try {
      e.preventDefault();
      navigate(RouteBuilder.wallets.fullPath());
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };
  const onOriginAllowedClick = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      const confirmed = await swal({
        icon: 'warning',
        title: 'Revoke Wallet Access?',
        text: `Would you like to revoke wallet access for ${activeTabOrigin}?`,
        buttons: {
          cancel: {
            text: 'Cancel',
            visible: true,
          },
          confirm: {
            text: 'Revoke Access',
            visible: true,
            closeModal: false,
          },
        },
      });
      if(!confirmed) {
        return;
      }
      const res = await api.disconnectSite({origin: activeTabOrigin});
      if('error' in res) {
        errorHandler.handle(res.error);
      } else if(res) {
        const userAccountRes = await api.getUserAccount();
        if('error' in userAccountRes) {
          errorHandler.handle(userAccountRes.error);
        } else {
          if(!userAccountRes.result) {
            throw new Error('User account not found.');
          }
          dispatch(setUserAccount({userAccount: userAccountRes.result}));
          await swal({
            icon: 'success',
            title: 'Wallet Access Revoked',
            text: `Wallet access for ${activeTabOrigin} has been revoked.`,
          });
        }
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  const showChainDropdown = sendPattern.test(location.pathname)
    || accountDetailPatt.test(location.pathname)
    || walletsPatt.test(location.pathname);

  const showMenuDropdown = !fromContentScript;

  const styles = {
    nav: {
      minHeight: 36,
    },
  };

  return (
    <nav className="navbar bg-transparent pt-0 pb-0 ps-2 pe-2 d-flex flex-row justify-content-start align-items-center" style={styles.nav}>
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
      {originAllowed ?
        <a href={'#'} title={'Tab allowed access to wallet'} onClick={onOriginAllowedClick}><i className={`mdi mdi-link fs-2 text-success ${fromContentScript ? 'd-none' : ''}`} /></a>
        :
        <a title={'Tab not allowed access to wallet'}><i className={`mdi mdi-link-off fs-2 ${fromContentScript ? 'd-none' : ''}`} /></a>
      }
      {showMenuDropdown ?
        <div className={'ms-2 position-relative'}>
          <a
            href={'#'}
            title={'Menu'}
            data-bs-toggle="dropdown"
            ref={(node) => {
              if(node) {
                new bootstrap.Dropdown(node);
              }
            }}
          ><i className={'mdi mdi-menu fs-2'} /></a>
          <ul className={'dropdown-menu dropdown-menu-end'}>
            <li><a className="dropdown-item" href="#" onClick={onSettingsClick}><i className={'mdi mdi-cog'} /> {'Settings'}</a></li>
            <li><a className="dropdown-item" href="#" onClick={onLockClick}><i className={'mdi mdi-lock-outline'} /> {'Lock Wallet'}</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li><a className="dropdown-item disabled">NodeWallet v<span className={'font-monospace fs-6'}>{'0.1.0'}</span></a></li>
          </ul>
        </div>
        :
        null
      }
    </nav>
  );
};
