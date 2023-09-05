import React, { useContext } from 'react';
import { generateFakeAddress, getRandomInt, truncateAddress } from '../../util';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveAccount, setActiveView, setUserAccount } from '../../reducers/app-reducer';
import { AppView } from '../../constants';
import { UserWallet } from '@nodewallet/types';
import { RootState } from '../../store';
import { ApiContext } from '../../hooks/api-context';
import { ErrorHandlerContext } from '../../hooks/error-handler-context';

interface WalletCardProps {
  wallet: UserWallet,
}
export const WalletCard = ({wallet}: WalletCardProps) => {

  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const dispatch = useDispatch();
  const {
    accountBalances,
  } = useSelector(({ appState }: RootState) => appState);

  const onAddressClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault();
    dispatch(setActiveAccount({activeAccount: id}));
    dispatch(setActiveView({activeView: AppView.ACCOUNT_DETAIL}))
  };
  const onNewAddressClick = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    try {
      e.preventDefault();
      const walletAccount = wallet.accounts[0];
      const res = await api.insertCryptoAccount({
        walletId: wallet.id,
        network: walletAccount.network,
        chain: walletAccount.chain,
      });
      if('error' in res) {
        errorHandler.handle(res.error);
      } else {
        const updatedUserAccount = await api.getUserAccount();
        if('error' in updatedUserAccount) {
          errorHandler.handle(updatedUserAccount.error);
        } else if(updatedUserAccount.result) {
          dispatch(setUserAccount({userAccount: updatedUserAccount.result}));
        }
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  return (
    <div className={'card ms-1 me-1'}>
      <div className={'card-header pt-2 pb-1 ps-2 pe-2'}>
        <div className={'d-flex flex-row justify-content-between align-items-center'}>
          <h4 className={'mt-0 mb-0'}>{wallet.name} <a href={'#'} title={'Edit wallet name'}><i className={' mdi mdi-pencil'} /></a></h4>
          {!wallet.legacy ? <h4 className={'mt-0 mb-0'}><a href={'#'} onClick={onNewAddressClick} title={'New address'}><i className={' mdi mdi-plus-thick'} /> address</a></h4> : null}
        </div>
      </div>
      <div className={'card-body pt-0 pb-2 ps-2 pe-2'}>
        <table className={'table table-sm mb-0'}>
          <thead>
          <tr>
            <th>Address</th>
            <th>Balance</th>
          </tr>
          </thead>
          <tbody>
          {
            wallet.accounts
              .reduce((arr, a) => {
                const cryptoAccounts = [...a.accounts]
                  .sort((a, b) => a.index - b.index)
                  .map((ca) => {
                    return (
                      <tr key={ca.id}>
                        <td className={'font-monospace'}><a href={'#'} title={'View account details'} onClick={e => onAddressClick(e, ca.id)}>{truncateAddress(ca.address)}</a></td>
                        <td><span className={'font-monospace'}>{accountBalances[ca.id] || '0'}</span> <span className={'opacity-75'}>POKT</span></td>
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
