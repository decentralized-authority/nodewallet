import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppView } from '../../constants';
import { ErrorHandlerContext } from '../../hooks/error-handler-context';
import { ApiContext } from '../../hooks/api-context';

export const Navbar = () => {

  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const {
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

  return (
    <nav className="navbar bg-body-tertiary pt-0 pb-0 ps-2 pe-2 d-flex flex-row justify-content-start align-items-center">
      <a href={'#'} title={'Pocket Network'}>
        <img src={'/images/coins/pokt.png'} alt="Pocket" height={30} />
      </a>
      <div className={'flex-grow-1'} />
      {activeView === AppView.ACCOUNT_DETAIL ?
        <h4 className={'ms-1 mt-0 mb-0'}>
          <a href={'#'} title={'Mainnet'}><i className={'mdi mdi-chevron-down'} />MAINNET</a>
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
