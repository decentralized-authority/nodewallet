import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveView } from '../../reducers/app-reducer';
import { AppView } from '../../constants';
import { CryptoAccount } from '@nodewallet/types';
import { truncateAddress } from '../../util';
import { ErrorHandlerContext } from '../../hooks/error-handler-context';
import { RootState } from '../../store';

export interface BalanceCardProps {
  account: CryptoAccount,
  hideButtons?: boolean,
  onBack: () => void,
}
export const BalanceCard = ({ account, hideButtons, onBack }: BalanceCardProps) => {

  const errorHandler = useContext(ErrorHandlerContext);
  const dispatch = useDispatch();
  const {
    accountBalances,
  } = useSelector(({ appState }: RootState) => appState);

  const styles = {
    button: {
      minWidth: 120,
    },
  };

  const onBackClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    onBack();
  };
  const onCopyAddressClick = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    try {
      e.preventDefault();
      await navigator.clipboard.writeText(account.address);
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };
  const onOpenPoktscanClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  //   try {
  //     e.preventDefault();
  //   } catch(err: any) {
  //     errorHandler.handle(err);
  //   }
  };
  const onSendClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      e.preventDefault();
      dispatch(setActiveView({activeView: AppView.SEND}));
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  return (
    <div className={'card mb-0'}>
      <div className={`card-body pt-2 ${hideButtons ? 'pb-0' : 'pb-2'} ps-2 pe-2`}>
        <h5 className={'d-flex flex-row justify-content-between align-items-center mt-0 mb-0'}>
          <div><a href={"#"} title={'View wallets'} onClick={onBackClick}><i className={'mdi mdi-menu-left'} />{account.name}</a></div>
          <div className={'font-monospace'}>{truncateAddress(account.address)} <a href={'#'} title={'Copy address'} onClick={onCopyAddressClick}><i className={'mdi mdi-content-copy'} /></a> <a href={`https://poktscan.com/account/${account.address}`} target={'_blank'} title={'Open in POKTscan'} onClick={onOpenPoktscanClick}><i className={'mdi mdi-open-in-new'} /></a></div>
        </h5>
        <div className={'d-flex flex-row justify-content-center pt-3 pb-3'}>
          <div>
            <h1 className={'mt-0 mb-0'}><span className={'font-monospace'}>{accountBalances[account.id] || '0'}</span> <span className={'fs-4 opacity-75'}>POKT</span></h1>
            <div className={'d-flex flex-row justify-content-end fs-4 font-monospace'}>$0</div>
          </div>
        </div>
        {!hideButtons ?
          <div className={'d-flex flex-row justify-content-evenly'}>
            <button style={styles.button} className={'btn btn-primary text-uppercase fw-bold'}>Stake</button>
            <button style={styles.button} className={'btn btn-primary text-uppercase fw-bold'} onClick={onSendClick}>Send</button>
          </div>
          :
          null
        }
      </div>
    </div>
  );
}
