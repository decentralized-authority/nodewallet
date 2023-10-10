import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CryptoAccount } from '@nodewallet/types';
import { calledFromContentScript, truncateAddress } from '../../util';
import { ErrorHandlerContext } from '../../hooks/error-handler-context';
import { RootState } from '../../store';
import { Link, useLocation } from 'react-router-dom';
import { RouteBuilder } from '@nodewallet/util-browser';
import { ChainType } from '@nodewallet/constants';
import { Pricing } from '../../modules/pricing';
import swal from 'sweetalert';
import { setUserAccount } from '../../reducers/app-reducer';
import { ApiContext } from '../../hooks/api-context';

export interface BalanceCardProps {
  walletId: string
  account: CryptoAccount,
  hideButtons?: boolean,
  backRoute: string,
}
export const BalanceCard = ({ walletId, account, hideButtons, backRoute }: BalanceCardProps) => {

  const location = useLocation();
  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const {
    accountBalances,
    pricingMultipliers,
  } = useSelector(({ appState }: RootState) => appState);
  const dispatch = useDispatch();
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

  const onEditAccountNameClick = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      const val = await swal({
        buttons: {
          cancel: {
            text: 'Cancel',
            visible: true,
          },
          confirm: {
            text: 'Save Changes',
            closeModal: false,
            visible: true,
          }
        },
        title: 'Update account name',
        content: {
          element: 'input',
          attributes: {
            type: 'text',
            placeholder: 'Enter account name',
            value: account.name,
            style: 'color:#333',
          },
        },
      });
      const name = val ? val.trim() : '';
      if(!name || name === account.name) {
        // @ts-ignore
        swal.close();
        return;
      }
      const res = await api.updateAccountName({
        id: account.id,
        name,
      });
      if('error' in res) {
        errorHandler.handle(res.error);
        return;
      } else {
        const updatedUserAccount = await api.getUserAccount();
        if('error' in updatedUserAccount) {
          errorHandler.handle(updatedUserAccount.error);
        } else if(updatedUserAccount.result) {
          dispatch(setUserAccount({userAccount: updatedUserAccount.result}));
        }
      }
      // @ts-ignore
      swal.close();
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

  const balance = accountBalances[account.id] || '0';

  return (
    <div className={'card mb-0 bg-transparent'}>
      <div className={`card-body pt-2 ${hideButtons ? 'pb-0' : 'pb-2'} ps-2 pe-2`}>
        <h5 className={'d-flex flex-row justify-content-between align-items-center mt-0 mb-0'}>
          <div><Link to={backRoute} className={'ps-1 pe-1'} title={'View wallets'} onClick={e => fromContentScript ? e.preventDefault() : null}><i className={`fs-4 mdi mdi-arrow-left-top-bold ${fromContentScript ? 'd-none' : ''}`} /></Link> {account.name} <a className={fromContentScript ? 'd-none' : ''} href={'#'} title={'Edit account name'} onClick={onEditAccountNameClick}><i className={' mdi mdi-pencil'} /></a></div>
          <div className={'font-monospace'}><span className={'fw-normal fs-6'}>{truncateAddress(account.address)}</span> <a href={'#'} title={'Copy address'} onClick={onCopyAddressClick}><i className={'mdi mdi-content-copy'} /></a> <a href={`https://poktscan.com${account.chain === ChainType.TESTNET ? '/testnet' : ''}/account/${account.address}`} target={'_blank'} title={'Open in POKTscan'}><i className={'mdi mdi-open-in-new'} /></a></div>
        </h5>
        <div className={'d-flex flex-row justify-content-center pt-3 pb-3'}>
          <div>
            <h1 className={'mt-0 mb-0'}><span className={'font-monospace'}>{balance}</span> <span className={'fs-4 opacity-75'}>POKT</span></h1>
            <div className={'d-flex flex-row justify-content-end fs-4 font-monospace'} title={'Value in USD'}>${account.chain !== ChainType.TESTNET ? Pricing.toUSD(account.network, balance, pricingMultipliers) : '0.00'}</div>
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
