import React from 'react';
import { Container } from './shared/container';
import { TosContainer } from './shared/tos-container';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setActiveView, setUserAccount } from '../reducers/app-reducer';
import { AppView } from '../constants';

export const TOS = () => {

  const dispatch = useDispatch();
  const {
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);

  const onAcceptClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    dispatch(setActiveView({activeView: AppView.REGISTER_ACCOUNT}));
    dispatch(setUserAccount({
      userAccount: {
        tosAccepted: new Date().toISOString(),
        settings: {
          showTestnets: false,
        },
        wallets: [],
      },
    }));
  };
  return (
    <Container className={'flex-column justify-content-start align-items-center p-2'}>
      <h1 className={'mt-3'}>Welcome to NodeWallet!</h1>
      <p className={'text-center'}>Before getting started, you need to read through and accept the Decentralized Authority Terms of Service.</p>
      <TosContainer className={'mt-2 flex-grow-1'} />
      <button
        className={'btn btn-primary btn-lg mt-4 mb-4'}
        onClick={onAcceptClick}
      >I accept the terms of service</button>
    </Container>
  );
};
