import React, { useContext } from 'react';
import { Container } from './shared/container';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import isNumber from 'lodash/isNumber';
import { ChainType, defaultLockTimeout, LocalStorageKey } from '@nodewallet/constants';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { ApiContext } from '../hooks/api-context';
import { setActiveChain, setUserAccount } from '../reducers/app-reducer';

export const Settings = () => {

  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);

  if(!userAccount) {
    return null;
  } else {
    console.log('userAccount', userAccount);
  }

  const onBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(-1);
  };

  const lockTimeout = isNumber(userAccount.settings.lockTimeout) ? userAccount.settings.lockTimeout : defaultLockTimeout;
  const hideTestnets = userAccount.settings.hideTestnets || false;

  const onLockTimeoutChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      e.preventDefault();
      const lockTimeout = parseInt(e.target.value, 10);
      const res = await api.updateUserSettings({
        lockTimeout,
      });
      if('error' in res) {
        errorHandler.handle(res.error);
      } else {
        dispatch(setUserAccount({
          userAccount: {
            ...userAccount,
            settings: res.result,
          },
        }));
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };
  const onTestnetsChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      e.preventDefault();
      const hideTestnets = e.target.value === 'disabled';
      const res = await api.updateUserSettings({
        hideTestnets,
      });
      if('error' in res) {
        errorHandler.handle(res.error);
      } else {
        dispatch(setUserAccount({
          userAccount: {
            ...userAccount,
            settings: res.result,
          },
        }));
        if(hideTestnets) {
          const newActiveChain = ChainType.MAINNET;
          await chrome.storage.local.set({[LocalStorageKey.SELECTED_CHAIN]: newActiveChain});
          dispatch(setActiveChain({activeChain: newActiveChain}));
        }
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  return (
    <Container className={'nw-bg-gradient-vertical'}>

      <h3 className={'ps-2 pe-2'}><a href={'#'} title={'Go back'} onClick={onBackClick}><i className={'mdi mdi-arrow-left-top-bold'} /></a> Settings</h3>

      <div className={'flex-grow-1 pt-4 ps-3 pe-3'}>

        <div className={'mb-3'}>
          <label htmlFor={'language'} className={'form-label'}>Language</label>
          <select id={'language'} className={'form-select'}>
            <option value={'en'}>English</option>
          </select>
        </div>

        <div className={'mb-3'}>
          <label htmlFor={'lockTimeout'} className={'form-label'}>Auto Lock</label>
          <select id={'lockTimeout'} className={'form-select'} value={lockTimeout.toString()} onChange={onLockTimeoutChange}>
            <option value={'1'}>1 Minute</option>
            <option value={'5'}>5 Minutes</option>
            <option value={'10'}>10 Minutes</option>
            <option value={'30'}>30 Minutes</option>
            <option value={'60'}>60 Minutes</option>
          </select>
        </div>

        <div className={'mb-3'}>
          <label htmlFor={'testnets'} className={'form-label'}>Testnets</label>
          <select id={'testnets'} className={'form-select'} value={hideTestnets ? 'disabled' : 'enabled'} onChange={onTestnetsChange}>
            <option value={'enabled'}>Enabled</option>
            <option value={'disabled'}>Disabled</option>
          </select>
        </div>

        <div className={'mb-3'}>
          <label htmlFor={'keyHashingAlgorithm'} className={'form-label'}>Key Hashing Algorithm</label>
          <select id={'keyHashingAlgorithm'} className={'form-select'}>
            <option value={'argon2'}>Argon2id</option>
          </select>
        </div>

        <div className={'mb-3'}>
          <label htmlFor={'encryptionAlgorithm'} className={'form-label'}>User Data Encryption Algorithm</label>
          <select id={'encryptionAlgorithm'} className={'form-select'}>
            <option value={'aes-256-gcm'}>AES 256 GCM</option>
          </select>
        </div>

      </div>

    </Container>
  );
};
