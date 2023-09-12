import React from 'react';
import { Container } from './shared/container';

export const OpenPopupInfo = () => {
  return (
    <Container className={'flex-column justify-content-center align-items-center'}>
      <h4>Open popup to continue.</h4>
      <p>You can do this by clicking the NodeWallet icon in your extensions.</p>
      <p>If you do not see it, then click the <i className={'mdi mdi-puzzle-outline'} /> icon and select it from the list.</p>
      <p>To make the NodeWallet icon always be visible, click the <i className={'mdi mdi-pin-outline'} /> icon to pin it.</p>
    </Container>
  );
};
