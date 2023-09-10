import React from 'react';
import { Container } from './shared/container';
import { useNavigate } from 'react-router-dom';
import { RouteBuilder } from '@nodewallet/util-browser';

export const SelectImportType = () => {

  const navigate = useNavigate();

  const onBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(RouteBuilder.wallets.fullPath());
  };

  return (
    <Container>
      {/*<h3 className={'ps-2 pe-2'}><a href={'#'} onClick={onBackClick} title={'Go back to wallets'}><i className={'mdi mdi-arrow-left-top-bold'} /></a> Select Import Type</h3>*/}
      <div className={'ps-4 pe-4 flex-grow-1 d-flex flex-column justify-content-center'}>

        <div>
          <button onClick={onBackClick} className={'d-block w-100 btn btn-primary btn-lg text-uppercase'}>Import Passphrase</button>
          <div className={'pt-1 ps-2 pe-2'}>Import the passphrase for an existing Pocket Network HD wallet</div>
        </div>

        <div className={'mt-4 mb-4'}>
          <button onClick={onBackClick} className={'d-block w-100 btn btn-primary btn-lg text-uppercase'}>Import Keyfile</button>
          <div className={'pt-1 ps-2 pe-2'}>Import the keyfile and passphrase for an existing Pocket Network account.</div>
        </div>

        <div>
          <button onClick={onBackClick} className={'d-block w-100 btn btn-primary btn-lg text-uppercase'}>Import Raw Private Key</button>
          <div className={'pt-1 ps-2 pe-2'}>Import by entering the raw private key for an existing Pocket Network account.</div>
        </div>

      </div>
    </Container>
  );
}
