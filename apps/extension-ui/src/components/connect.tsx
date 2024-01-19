import React, { useContext, useState } from 'react';
import { Container } from './shared/container';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { calledFromContentScript } from '../util';
// @ts-ignore
import logo from '../images/logo.svg';
import { getHostFromOrigin } from '@decentralizedauthority/nodewallet-util-browser';

export const Connect = () => {

  const location = useLocation();
  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);
  const queryParams = new URLSearchParams(location.search);

  const title = queryParams.get('title') || '';
  const favicon = queryParams.get('favicon') || '';
  const origin = queryParams.get('origin') || '';

  const [ disableConnectBtn, setDisableConnectBtn ] = useState(false);

  const onConnectClick = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      setDisableConnectBtn(true);
      await api.connectSite({origin});
      window.close();
    } catch(err: any) {
      errorHandler.handle(err);
      setDisableConnectBtn(false);
    }
  };
  const onCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.close();
  };

  const styles = {
    buttonContainer: {
      flexBasis: '1px',
    },
    image: {
      width: 100,
      height: 100,
    },
    hostText: {
      wordBreak: 'break-all',
      width: 120,
      maxWidth: 120,
      minWidth: 120,
    },
    iconContainer: {
      height: 100,
    },
  };

  return (
    <Container className={'flex-column justify-content-start align-items-center p-2'}>

      <h1 className={'mt-3 mb-3'}>Connect Wallet</h1>

      <div className={'d-flex flex-row justify-content-evenly w-100'}>
        <div className={'d-flex flex-column justify-content-start align-items-center'}>
          <img style={styles.image} src={favicon} alt={`${title} icon`} />
          <div className={'pt-1 text-center'} style={styles.hostText as React.CSSProperties}>{getHostFromOrigin(origin)}</div>
        </div>
        <div className={'d-flex flex-column justify-content-center'} style={styles.iconContainer}>
          <i className={'mdi mdi-arrow-right-bold text-success fs-1'} />
        </div>
        <div className={'d-flex flex-column justify-content-start align-items-center'}>
          <img style={styles.image} src={logo} alt={'NodeWallet logo'} />
          <div className={'pt-1 text-center'} style={styles.hostText as React.CSSProperties}>{'NodeWallet'}</div>
        </div>
      </div>

      <div className={'flex-grow-1 pt-4 ps-3 pe-3'}>
        <div>
          <strong>{title || origin}</strong> <span>{'is requesting access to your wallet. This will allow the site to:'}</span>
        </div>
        <div className={'pt-3'}>
          <ul>
            <li>{'View selected account address.'}</li>
            <li>{'View selected account balance.'}</li>
            <li>{'Create but not sign transactions.'}</li>
          </ul>
        </div>
      </div>

      <div className={'ps-2 pe-2 pt-2 pb-2 w-100 d-flex flex-row justify-content-start'}>
        <div className={'flex-grow-1 pe-1'} style={styles.buttonContainer}>
          <button className={'btn btn-secondary text-uppercase w-100'} onClick={onCancelClick}>Cancel</button>
        </div>
        <div className={'flex-grow-1 ps-1'} style={styles.buttonContainer}>
          <button className={'btn btn-success text-uppercase w-100'} onClick={onConnectClick} disabled={disableConnectBtn}>Connect</button>
        </div>
      </div>

    </Container>
  );
};
