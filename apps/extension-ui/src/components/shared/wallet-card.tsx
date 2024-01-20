import React, { useContext, useState } from 'react';
import { truncateAddress } from '../../util';
import { useDispatch, useSelector } from 'react-redux';
import { setAccountBalances, setAccountTransactions, setUserAccount } from '../../reducers/app-reducer';
import { UserWallet } from '@decentralizedauthority/nodewallet-types';
import { RootState } from '../../store';
import { ApiContext } from '../../hooks/api-context';
import { ErrorHandlerContext } from '../../hooks/error-handler-context';
import { CoinType } from '@decentralizedauthority/nodewallet-constants';
import { Link } from 'react-router-dom';
import { RouteBuilder, truncateAtDecimalPlace } from '@decentralizedauthority/nodewallet-util-browser';
import swal from 'sweetalert';

interface WalletCardProps {
  wallet: UserWallet,
  selectAccount?: boolean
}
export const WalletCard = ({ wallet, selectAccount = false }: WalletCardProps) => {

  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const dispatch = useDispatch();
  const {
    accountBalances,
    activeChain,
  } = useSelector(({ appState }: RootState) => appState);
  const [ disableNewAddress, setDisableNewAddress ] = useState(false);

  const onNewAddressClick = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    try {
      e.preventDefault();
      if(disableNewAddress) {
        return;
      }
      setDisableNewAddress(true);
      const res = await api.insertCryptoAccount({
        walletId: wallet.id,
        network: CoinType.POKT,
        chain: activeChain,
      });
      if('error' in res) {
        errorHandler.handle(res.error);
      } else {
        const updatedUserAccount = await api.getUserAccount();
        if('error' in updatedUserAccount) {
          errorHandler.handle(updatedUserAccount.error);
        } else if(updatedUserAccount.result) {
          dispatch(setUserAccount({userAccount: updatedUserAccount.result}));
          const [ balancesRes, transactionsRes ] = await Promise.all([
            api.getAccountBalances({forceUpdate: true}),
            api.getAccountTransactions({forceUpdate: true}),
          ]);
          if('error' in balancesRes) {
            errorHandler.handle(balancesRes.error);
          } else {
            dispatch(setAccountBalances({accountBalances: balancesRes.result}));
          }
          if('error' in transactionsRes) {
            errorHandler.handle(transactionsRes.error);
          } else {
            dispatch(setAccountTransactions({accountTransactions: transactionsRes.result}));
          }
        }
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
    setDisableNewAddress(false);
  };

  const onOpenAccountClick = async (e: React.MouseEvent, accountId: string) => {
    try {
      if(selectAccount) {
        e.preventDefault();
      }
      await api.saveActiveAccount({
        accountId,
      });
      if(selectAccount) {
        window.close();
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  const onEditWalletNameClick = async (e: React.MouseEvent) => {
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
        title: 'Update wallet name',
        content: {
          element: 'input',
          attributes: {
            type: 'text',
            placeholder: 'Enter wallet name',
            value: wallet.name,
            style: 'color:#333',
          },
        },
      });
      const name = val ? val.trim() : '';
      if(!name || name === wallet.name) {
        // @ts-ignore
        swal.close();
        return;
      }
      const res = await api.updateWalletName({
        id: wallet.id,
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

  const longestBalance = Object
    .values(accountBalances)
    .map(b => parseInt(b))
    .sort((a, b) => b - a)
    .shift() || 0;
  const numberLength = longestBalance.toString().length;

  return (
    <div className={'card ms-1 me-1 mb-2 nw-bg-gradient-horizontal'}>
      <div className={'card-header pt-2 pb-1 ps-2 pe-2'}>
        <div className={'d-flex flex-row justify-content-between align-items-center'}>
          <h4 className={'mt-0 mb-0'}>{wallet.name} <a href={'#'} title={'Edit wallet name'} onClick={onEditWalletNameClick}><i className={' mdi mdi-pencil'} /></a></h4>
          {!wallet.legacy && !selectAccount ? <h4 className={'mt-0 mb-0'}><a href={'#'} onClick={onNewAddressClick} title={'New address'}><i className={' mdi mdi-plus-thick'} /> address</a></h4> : null}
        </div>
      </div>
      <div className={'card-body pt-0 pb-2 ps-2 pe-2'}>
        <table className={'table table-sm mb-0'}>
          <thead>
          <tr>
            <th>Address</th>
            <th>POKT</th>
          </tr>
          </thead>
          <tbody>
          {
            wallet.accounts
              .filter((a) => a.chain === activeChain)
              .reduce((arr, a) => {
                const cryptoAccounts = [...a.accounts]
                  .sort((a, b) => a.index - b.index)
                  .map((ca) => {

                    const accountDetailPath = RouteBuilder.accountDetail.generateFullPath({
                      walletId: wallet.id,
                      networkId: a.network,
                      chainId: a.chain,
                      address: ca.address,
                    });

                    const balance = truncateAtDecimalPlace(Number(accountBalances[ca.id] || '0'), 2);
                    const currentLength = parseInt(balance).toString().length;
                    const padding = new Array(numberLength - currentLength)
                      .fill('0')
                      .join('');

                    return (
                      <tr key={ca.id}>
                        <td><Link to={accountDetailPath} title={'View account details'} onClick={e => onOpenAccountClick(e, ca.id)}>{ca.name} (<span className={'font-monospace fs-6'}>{truncateAddress(ca.address, 4)}</span>)</Link></td>
                        <td><span className={'font-monospace'}><span className={'visibility-hidden'}>{padding}</span>{balance}</span></td>
                      </tr>
                    );
                  });
                return arr.concat(cryptoAccounts);
              }, [] as any)
          }
          </tbody>
        </table>
      </div>
    </div>
  );
};
