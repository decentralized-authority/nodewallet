import React from 'react';
import { AccountDetail } from './components/account-detail';
import { Navbar } from './components/shared/navbar';
import { Container } from './components/shared/container';

export const App = () => {

  return (
    <Container>
      <Navbar />
      <div className={'flex-grow-1 position-relative'}>
        <AccountDetail />
      </div>
    </Container>
  );
};
