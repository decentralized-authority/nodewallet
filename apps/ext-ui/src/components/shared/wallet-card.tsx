import React from 'react';
import { generateFakeAddress, getRandomInt, truncateAddress } from '../../util';
import { useDispatch } from 'react-redux';
import { setActiveView } from '../../reducers/app-reducer';
import { appView } from '../../constants';

interface WalletCardProps {
  title: string
  addresses: string[]
  hideAddButton?: boolean
}
export const WalletCard = ({title, addresses, hideAddButton = false}: WalletCardProps) => {

  const dispatch = useDispatch();

  const onAddressClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    dispatch(setActiveView({activeView: appView.ACCOUNT_DETAIL}))
  };

  return (
    <div className={'card ms-1 me-1'}>
      <div className={'card-header pt-2 pb-1 ps-2 pe-2'}>
        <div className={'d-flex flex-row justify-content-between align-items-center'}>
          <h4 className={'mt-0 mb-0'}>{title} <a href={'#'} title={'Edit wallet name'}><i className={' mdi mdi-pencil'} /></a></h4>
          {!hideAddButton ? <h4 className={'mt-0 mb-0'}><a href={'#'} title={'New address'}><i className={' mdi mdi-plus-thick'} /> address</a></h4> : null}
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
            addresses
              .map((address) => {
                return (
                  <tr key={address}>
                    <td className={'font-monospace'}><a href={'#'} title={'View account details'} onClick={onAddressClick}>{truncateAddress(address)}</a></td>
                    <td><span className={'font-monospace'}>{getRandomInt(1, 300)}</span> <span className={'opacity-75'}>POKT</span></td>
                  </tr>
                )
              })
          }
          </tbody>
        </table>
      </div>
    </div>
  );
};
