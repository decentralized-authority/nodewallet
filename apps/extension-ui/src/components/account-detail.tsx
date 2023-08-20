import React from 'react';
import { Container } from './shared/container';
import { BalanceCard } from './shared/balance-card';
import { TransactionList } from './shared/transaction-list';

export const AccountDetail = () => {
  return (
    <Container>
      <BalanceCard />
      <TransactionList />
    </Container>
  );
};
