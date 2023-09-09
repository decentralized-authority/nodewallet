import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { routes } from '../../constants';
import { CryptoAccount } from '@nodewallet/types';
import { truncateAddress } from '../../util';
import { ErrorHandlerContext } from '../../hooks/error-handler-context';
import { RootState } from '../../store';
import { Link } from 'react-router-dom';

export interface BalanceCardProps {
  walletId: string
  account: CryptoAccount,
  hideButtons?: boolean,
  backRoute: string,
}
export const BalanceCard = ({ walletId, account, hideButtons, backRoute }: BalanceCardProps) => {

  const errorHandler = useContext(ErrorHandlerContext);
  const {
    accountBalances,
  } = useSelector(({ appState }: RootState) => appState);

  const styles = {
    button: {
      minWidth: 120,
    },
  };

  const onCopyAddressClick = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    try {
      e.preventDefault();
      await navigator.clipboard.writeText(account.address);
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  return (
    <div className={'card mb-0'}>
      <div className={`card-body pt-2 ${hideButtons ? 'pb-0' : 'pb-2'} ps-2 pe-2`}>
        <h5 className={'d-flex flex-row justify-content-between align-items-center mt-0 mb-0'}>
          <div><Link to={backRoute} title={'View wallets'}><i className={'mdi mdi-menu-left'} />{account.name}</Link></div>
          <div className={'font-monospace'}>{truncateAddress(account.address)} <a href={'#'} title={'Copy address'} onClick={onCopyAddressClick}><i className={'mdi mdi-content-copy'} /></a> <a href={`https://poktscan.com/account/${account.address}`} target={'_blank'} title={'Open in POKTscan'}><i className={'mdi mdi-open-in-new'} /></a></div>
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
            <Link to={'/' + routes.SEND.replace(':walletId', walletId).replace(':networkId', account.network).replace(':chainId', account.chain).replace(':address', account.address)} style={styles.button} className={'btn btn-primary text-uppercase fw-bold'}>Send</Link>
          </div>
          :
          null
        }
      </div>
    </div>
  );
}
