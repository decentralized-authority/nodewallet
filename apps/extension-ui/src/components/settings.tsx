import React, { useContext, useEffect, useState } from 'react';
import { Container } from './shared/container';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import isNumber from 'lodash/isNumber';
import { ChainType, CoinType, defaultLockTimeout, LocalStorageKey } from '@decentralizedauthority/nodewallet-constants';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { ApiContext } from '../hooks/api-context';
import { setActiveChain, setUserAccount } from '../reducers/app-reducer';
import { ScrollContainer } from './shared/scroll-container';
import { validateUrl } from '../util';

export const Settings = () => {

  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);

  const [ poktMainnetEndpoint, setPoktMainnetEndpoint ] = useState<string>('');
  const [ poktMainnetEndpointError, setPoktMainnetEndpointError ] = useState<string>('');
  const [ poktTestnetEndpoint, setPoktTestnetEndpoint ] = useState<string>('');
  const [ poktTestnetEndpointError, setPoktTestnetEndpointError ] = useState<string>('');

  useEffect(() => {
    api.getRpcEndpoint({network: CoinType.POKT, chain: ChainType.MAINNET})
      .then((endpoint) => {
        if ('error' in endpoint) {
          errorHandler.handle(endpoint.error);
        } else {
          setPoktMainnetEndpoint(endpoint.result);
        }
      })
      .catch((err: any) => {
        errorHandler.handle(err);
      });
    api.getRpcEndpoint({network: CoinType.POKT, chain: ChainType.TESTNET})
      .then((endpoint) => {
        if ('error' in endpoint) {
          errorHandler.handle(endpoint.error);
        } else {
          setPoktTestnetEndpoint(endpoint.result);
        }
      })
      .catch((err: any) => {
        errorHandler.handle(err);
      });
  }, []);

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
  const onPoktMainnetEndpointChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPoktMainnetEndpoint(e.target.value.trim());
  };
  const onPoktMainneEndpointBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    const validUrl = validateUrl(poktMainnetEndpoint);
    if (poktMainnetEndpoint.trim() && !validUrl) {
      setPoktMainnetEndpointError('Invalid URL');
    } else {
      setPoktMainnetEndpointError('');
      setPoktMainnetEndpoint(validUrl);
      await api.updateRpcEndpoint({
        network: CoinType.POKT,
        chain: ChainType.MAINNET,
        endpoint: validUrl,
      });
    }
  };
  const onPoktTestnetEndpointChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPoktTestnetEndpoint(e.target.value.trim());
  };
  const onPoktTestnetEndpointBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    const validUrl = validateUrl(poktTestnetEndpoint);
    if (poktTestnetEndpoint.trim() && !validUrl) {
      setPoktTestnetEndpointError('Invalid URL');
    } else {
      setPoktTestnetEndpointError('');
      setPoktTestnetEndpoint(validUrl);
      await api.updateRpcEndpoint({
        network: CoinType.POKT,
        chain: ChainType.TESTNET,
        endpoint: validUrl,
      });
    }
  };

  return (
    <Container className={'nw-bg-gradient-vertical'}>

      <h3 className={'ps-2 pe-2'}><a href={'#'} title={'Go back'} onClick={onBackClick}><i className={'mdi mdi-arrow-left-top-bold'} /></a> Settings</h3>

      <div className={'flex-grow-1 position-relative'}>

        <ScrollContainer className={'pt-1 ps-2 pe-2 '}>

          <div className={'mb-2'}>
            <label htmlFor={'language'} className={'form-label'}>Language</label>
            <select id={'language'} className={'form-select'}>
              <option value={'en'}>English</option>
            </select>
          </div>

          <div className={'mb-2'}>
            <label htmlFor={'lockTimeout'} className={'form-label'}>Auto Lock</label>
            <select id={'lockTimeout'} className={'form-select'} value={lockTimeout.toString()}
                    onChange={onLockTimeoutChange}>
              <option value={'1'}>1 Minute</option>
              <option value={'5'}>5 Minutes</option>
              <option value={'10'}>10 Minutes</option>
              <option value={'30'}>30 Minutes</option>
              <option value={'60'}>60 Minutes</option>
            </select>
          </div>

          <div className={'mb-2'}>
            <label htmlFor={'testnets'} className={'form-label'}>Testnets</label>
            <select id={'testnets'} className={'form-select'} value={hideTestnets ? 'disabled' : 'enabled'}
                    onChange={onTestnetsChange}>
              <option value={'enabled'}>Enabled</option>
              <option value={'disabled'}>Disabled</option>
            </select>
          </div>

          <div className={'mb-2'}>
            <label htmlFor={'mainnet-endpoint-input'} className={'form-label'}>Custom POKT Mainnet Endpoint:</label>
            <input id={'mainnet-endpoint-input'}
                   className={'form-control form-control-sm'}
                   type={'text'}
                   placeholder={'Enter mainnet RPC endpoint'}
                   value={poktMainnetEndpoint}
                   onChange={onPoktMainnetEndpointChange}
                   onBlur={onPoktMainneEndpointBlur} />
            {poktMainnetEndpointError ? <div className={'text-danger'}>{poktMainnetEndpointError}</div> : null}
          </div>

          {hideTestnets ?
            null
            :
            <div className={'mb-2'}>
              <label htmlFor={'testnet-endpoint-input'} className={'form-label'}>Custom POKT Testnet Endpoint:</label>
              <input id={'testnet-endpoint-input'}
                     className={'form-control form-control-sm'}
                     type={'text'}
                     placeholder={'Enter testnet RPC endpoint'}
                     value={poktTestnetEndpoint}
                     onChange={onPoktTestnetEndpointChange}
                     onBlur={onPoktTestnetEndpointBlur} />
              {poktTestnetEndpointError ? <div className={'text-danger'}>{poktTestnetEndpointError}</div> : null}
            </div>
          }

          <div className={'mb-2'}>
            <label htmlFor={'keyHashingAlgorithm'} className={'form-label'}>Key Hashing Algorithm</label>
            <select id={'keyHashingAlgorithm'} className={'form-select'}>
              <option value={'argon2'}>Argon2id</option>
            </select>
          </div>

          <div className={'mb-2'}>
            <label htmlFor={'encryptionAlgorithm'} className={'form-label'}>User Data Encryption Algorithm</label>
            <select id={'encryptionAlgorithm'} className={'form-select'}>
              <option value={'aes-256-gcm'}>AES 256 GCM</option>
            </select>
          </div>

        </ScrollContainer>

      </div>

    </Container>
  );
};
