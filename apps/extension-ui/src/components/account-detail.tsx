import React from 'react';
import { Container } from './shared/container';
import { BalanceCard } from './shared/balance-card';
import { TransactionList } from './shared/transaction-list';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useParams } from 'react-router-dom';
import { AccountDetailParams, findCryptoAccountInUserAccountByAddress, RouteBuilder } from '@nodewallet/util-browser';

export const AccountDetail = () => {

  const {
    walletId,
    networkId,
    chainId,
    address,
  } = useParams<Partial<AccountDetailParams>>();

  const {
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);

  if(!userAccount || !walletId || !networkId || !chainId || !address) {
    return null;
  }

  const cryptoAccount = findCryptoAccountInUserAccountByAddress(
    userAccount,
    walletId,
    networkId,
    chainId,
    address,
  );

  if(!cryptoAccount) {
    return null;
  }

  return (
    <Container>
      <BalanceCard
        walletId={walletId}
        account={cryptoAccount}
        backRoute={RouteBuilder.wallets.fullPath()}
      />
      <TransactionList />
    </Container>
  );
};
