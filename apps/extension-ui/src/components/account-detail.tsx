import React from 'react';
import { Container } from './shared/container';
import { BalanceCard } from './shared/balance-card';
import { TransactionList } from './shared/transaction-list';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { CryptoAccount } from '@nodewallet/types';
import { setActiveView } from '../reducers/app-reducer';
import { AppView } from '../constants';

export const AccountDetail = () => {

  const dispatch = useDispatch();
  const {
    userAccount,
    activeAccount,
  } = useSelector(({ appState }: RootState) => appState);

  if(!userAccount || !activeAccount) {
    return null;
  }

  let cryptoAccount: CryptoAccount|null = null;
  for(const wallet of userAccount.wallets) {
    for(const walletAccount of wallet.accounts) {
      for(const ca of walletAccount.accounts) {
        if(ca.id === activeAccount) {
          cryptoAccount = ca;
          break;
        }
      }
    }
  }

  if(!cryptoAccount) {
    return null;
  }

  return (
    <Container>
      <BalanceCard
        account={cryptoAccount}
        onBack={() => dispatch(setActiveView({activeView: AppView.MANAGE_WALLETS}))}
      />
      <TransactionList />
    </Container>
  );
};
