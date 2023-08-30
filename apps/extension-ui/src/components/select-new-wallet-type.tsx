import React from 'react';
import { Container } from './shared/container';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setActiveView, setUserAccount } from '../reducers/app-reducer';
import { AppView } from '../constants';

export const SelectNewWalletType = () => {

  const dispatch = useDispatch();
  const {
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);

  // const onAcceptClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //   e.preventDefault();
  //   dispatch(setActiveView({activeView: AppView.REGISTER_ACCOUNT}));
  //   dispatch(setUserAccount({
  //     userAccount: {
  //       ...userAccount,
  //       tosAccepted: new Date().toISOString(),
  //     },
  //   }));
  // };

  const styles = {
    buttonContainer: {
      minWidth: 380,
    },
  };

  return (
    <Container className={'flex-column justify-content-start align-items-center p-2'}>
      <h1 className={'mt-3'}>New Wallet Select</h1>
      <p className={'text-center mb-4'}>Start by creating a new wallet. You can also import existing wallets or accounts.</p>
      <div className={' d-flex flex-column justify-content-start'} style={styles.buttonContainer}>

        <button
          className={'btn btn-primary btn-lg w-100'}
        >Create new wallet</button>
        <div className={'pt-1 ps-2 pe-2 mb-3'}>Generate a mnemonic passphrase and create a new wallet.</div>

        <button
          className={'btn btn-primary btn-lg w-100'}
        >Import passphrase</button>
        <div className={'pt-1 ps-2 pe-2 mb-3'}>Import the passphrase for an existing wallet.</div>

        <button
          className={'btn btn-primary btn-lg w-100'}
        >Import keyfile</button>
        <div className={'pt-1 ps-2 pe-2 mb-3'}>Import using the keyfile and passphrase for an existing Pocket Network account.</div>

        <button
          className={'btn btn-primary btn-lg w-100'}
        >Import raw private key</button>
        <div className={'pt-1 ps-2 pe-2 mb-3'}>Import by entering the raw private key for an existing Pocket Network account.</div>

      </div>
    </Container>
  );
};
