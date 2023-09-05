import React, { useContext, useRef } from 'react';
import { Container } from './shared/container';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setActiveView, setUserAccount } from '../reducers/app-reducer';
import { AppView } from '../constants';
import swal from 'sweetalert';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { ApiContext } from '../hooks/api-context';

export const SelectNewWalletType = () => {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const dispatch = useDispatch();
  const {
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);

  const onNewClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    console.log('onNewClick!');
  };
  const onImportPassphraseClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      e.preventDefault();
      const val = await swal({
        buttons: {
          cancel: {
            text: 'Cancel',
            visible: true,
          },
          confirm: {
            text: 'Import',
            closeModal: false,
            visible: true,
          }
        },
        title: 'Enter or paste your mnemonic passphrase',
        content: {
          element: 'input',
          attributes: {
            type: 'password',
            placeholder: 'Enter mnemonic passphrase',
            style: 'color:#333',
          },
        },
      });
      const validateRes = await api.validateMnemonic({mnemonic: val});
      if('error' in validateRes || !validateRes.result) {
        await swal({
          icon: 'error',
          title: 'Invalid mnemonic passphrase',
        });
        return;
      }
      // @ts-ignore
      swal.close();
      const insertRes = await api.insertHdWallet({mnemonic: val});
      if('error' in insertRes) {
        await swal({
          icon: 'error',
          title: insertRes.error.message,
        });
        return;
      }
      const newWallet = insertRes.result;
      console.log('newWallet', newWallet);
      const updatedUserAccount = await api.getUserAccount();
      if('error' in updatedUserAccount) {
        errorHandler.handle(updatedUserAccount.error);
        return;
      } else if(updatedUserAccount.result) {
        await swal({
          icon: 'success',
          title: 'New HD Wallet created successfully!',
        });
        dispatch(setUserAccount({userAccount: updatedUserAccount.result}));
        dispatch(setActiveView({activeView: AppView.MANAGE_WALLETS}));
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };
  const onImportKeyfileClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      e.preventDefault();
      console.log('onImportKeyfileClick!');
      if(fileInputRef.current) {
        fileInputRef.current.click();
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };
  const onImportRawClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      e.preventDefault();
      // @ts-ignore
      const val = await swal({buttons: ['Cancel', 'Import'],
        title: 'Enter or paste your raw private key',
        content: {
          element: 'input',
          attributes: {
            type: 'password',
            placeholder: 'Enter raw private key',
            style: 'color:#333',
          },
        },
      });
      console.log('val', val);
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };
  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if(file) {
        const text = await file.text();
        console.log('text', text);
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

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
          onClick={onNewClick}
        >Create new wallet</button>
        <div className={'pt-1 ps-2 pe-2 mb-3'}>Generate a mnemonic passphrase and create a new wallet.</div>

        <button
          className={'btn btn-primary btn-lg w-100'}
          onClick={onImportPassphraseClick}
        >Import passphrase</button>
        <div className={'pt-1 ps-2 pe-2 mb-3'}>Import the passphrase for an existing wallet.</div>

        <button
          className={'btn btn-primary btn-lg w-100'}
          onClick={onImportKeyfileClick}
        >Import keyfile</button>
        <div className={'pt-1 ps-2 pe-2 mb-3'}>Import using the keyfile and passphrase for an existing Pocket Network account.</div>

        <button
          className={'btn btn-primary btn-lg w-100'}
          onClick={onImportRawClick}
        >Import raw private key</button>
        <div className={'pt-1 ps-2 pe-2 mb-3'}>Import by entering the raw private key for an existing Pocket Network account.</div>

        <input
          ref={fileInputRef}
          type={'file'}
          className={'d-none'}
          onChange={onFileInputChange}
        />

      </div>
    </Container>
  );
};