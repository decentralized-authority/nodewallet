import React, { useContext, useRef } from 'react';
import { Container } from './shared/container';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setUserAccount } from '../reducers/app-reducer';
import swal from 'sweetalert';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { ApiContext } from '../hooks/api-context';
import { useNavigate } from 'react-router-dom';
import { RouteBuilder } from '@nodewallet/util-browser';
import { ChainType, CoinType } from '@nodewallet/constants';

export const SelectNewWalletType = () => {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const dispatch = useDispatch();
  const {
    activeChain,
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);

  const onNewClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    navigate(RouteBuilder.newHdWallet.fullPath());
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
      if(!val) {
        // @ts-ignore
        swal.close();
        return;
      }
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
      // const newWallet = insertRes.result;
      const updatedUserAccount = await api.getUserAccount();
      if('error' in updatedUserAccount) {
        errorHandler.handle(updatedUserAccount.error);
        return;
      } else if(updatedUserAccount.result) {
        await swal({
          icon: 'success',
          title: 'New HD Wallet imported successfully!',
        });
        navigate(RouteBuilder.openPopupInfo.fullPath());
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };
  const onImportKeyfileClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      e.preventDefault();
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
      const val = await swal({
        title: 'Enter or paste your raw private key',
        content: {
          element: 'input',
          attributes: {
            type: 'password',
            placeholder: 'Enter raw private key',
            style: 'color:#333',
          },
        },
        buttons: {
          cancel: {
            text: 'Cancel',
            visible: true,
          },
          confirm: {
            text: 'Import',
            visible: true,
            closeModal: false,
          }
        },
      });
      if(val) {
        const prepped = val.trim();
        const insertRes = await api.insertLegacyWallet({
          network: CoinType.POKT,
          chain: activeChain || ChainType.MAINNET,
          privateKey: prepped,
        });
        if('error' in insertRes) {
          errorHandler.handle(insertRes.error);
        } else if(insertRes.result) {
          await swal({
            icon: 'success',
            title: 'Legacy account imported successfully!',
          });
          navigate(RouteBuilder.openPopupInfo.fullPath());
        }
      } else {
        // @ts-ignore
        swal.close();
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };
  const resetFileInput = () => {
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if(file) {
        const text = await file.text();
        try {
          JSON.parse(text);
        } catch(err) {
          resetFileInput();
          throw new Error('Invalid keyfile');
        }
        const password = await swal({
          title: 'Enter keyfile decryption password',
          content: {
            element: 'input',
            attributes: {
              type: 'password',
              placeholder: 'Enter password',
              style: 'color:#333',
            },
          },
          buttons: {
            cancel: {
              text: 'Cancel',
              visible: true,
            },
            confirm: {
              text: 'Import',
              visible: true,
              closeModal: false,
            }
          },
        });
        if(password) {
          const prepped = password.trim();
          const insertRes = await api.insertLegacyWallet({
            network: CoinType.POKT,
            chain: activeChain || ChainType.MAINNET,
            privateKeyEncrypted: text,
            privateKeyPassword: prepped,
          });
          if('error' in insertRes) {
            errorHandler.handle(insertRes.error);
          } else if(insertRes.result) {
            await swal({
              icon: 'success',
              title: 'Legacy account imported successfully!',
            });
            navigate(RouteBuilder.openPopupInfo.fullPath());
          }
        } else {
          // @ts-ignore
          swal.close();
        }
        resetFileInput();
      }
    } catch(err: any) {
      resetFileInput();
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
      <p className={'text-center mb-4'}>Create a new HD wallet or import an existing wallet or account.</p>
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
        <div className={'pt-1 ps-2 pe-2 mb-3'}>Import existing passphrase. <em>(Compatible with MetaMask, SendWallet, & others)</em></div>

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
