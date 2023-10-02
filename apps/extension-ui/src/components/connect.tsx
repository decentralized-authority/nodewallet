import React, { useContext } from 'react';
import { Container } from './shared/container';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { calledFromContentScript } from '../util';

export const Connect = () => {

  const location = useLocation();
  const dispatch = useDispatch();
  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);
  const navigate = useNavigate();
  const fromContentScript = calledFromContentScript(location);

  return (
    <Container className={'flex-column justify-content-start align-items-center p-2'}>
      <h1 className={'mt-3 mb-3'}>Connect Wallet</h1>
    </Container>
  );
};
