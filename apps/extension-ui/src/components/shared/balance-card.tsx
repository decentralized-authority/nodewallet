import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { CryptoAccount } from '@nodewallet/types';
import { calledFromContentScript, truncateAddress } from '../../util';
import { ErrorHandlerContext } from '../../hooks/error-handler-context';
import { RootState } from '../../store';
import { Link, useLocation } from 'react-router-dom';
import { RouteBuilder } from '@nodewallet/util-browser';
import { ChainType } from '@nodewallet/constants';

export interface BalanceCardProps {
  walletId: string
  account: CryptoAccount,
  hideButtons?: boolean,
  backRoute: string,
}
export const BalanceCard = ({ walletId, account, hideButtons, backRoute }: BalanceCardProps) => {

  const location = useLocation();
  const errorHandler = useContext(ErrorHandlerContext);
  const {
    accountBalances,
  } = useSelector(({ appState }: RootState) => appState);
  const fromContentScript = calledFromContentScript(location);

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

  const sendPath = RouteBuilder.send.generateFullPath({
    walletId,
    networkId: account.network,
    chainId: account.chain,
    address: account.address,
  });

  return (
    <div className={'card mb-0 bg-transparent'}>
      <div className={`card-body pt-2 ${hideButtons ? 'pb-0' : 'pb-2'} ps-2 pe-2`}>
        <h5 className={'d-flex flex-row justify-content-between align-items-center mt-0 mb-0'}>
          <div><Link to={backRoute} title={'View wallets'} onClick={e => fromContentScript ? e.preventDefault() : null}><i className={`mdi mdi-menu-left ${fromContentScript ? 'd-none' : ''}`} />{account.name}</Link></div>
          <div className={'font-monospace'}>{truncateAddress(account.address)} <a href={'#'} title={'Copy address'} onClick={onCopyAddressClick}><i className={'mdi mdi-content-copy'} /></a> <a href={`https://poktscan.com${account.chain === ChainType.TESTNET ? '/testnet' : ''}/account/${account.address}`} target={'_blank'} title={'Open in POKTscan'}><i className={'mdi mdi-open-in-new'} /></a></div>
        </h5>
        <div className={'d-flex flex-row justify-content-center pt-3 pb-3'}>
          <div>
            <h1 className={'mt-0 mb-0'}><span className={'font-monospace'}>{accountBalances[account.id] || '0'}</span> <span className={'fs-4 opacity-75'}>POKT</span></h1>
            <div className={'d-flex flex-row justify-content-end fs-4 font-monospace'}>$0</div>
          </div>
        </div>
        {!hideButtons ?
          <div className={'d-flex flex-row justify-content-evenly'}>
            <button style={styles.button} className={'btn btn-outline-success text-uppercase fw-bold'} disabled={true}>Stake</button>
            <Link to={sendPath} style={styles.button} className={'btn btn-outline-success text-uppercase fw-bold'}>Send</Link>
          </div>
          :
          null
        }
      </div>
    </div>
  );
}
