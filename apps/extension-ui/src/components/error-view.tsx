import React from 'react';
import { useRouteError } from 'react-router-dom';
import { Container } from './shared/container';

export const ErrorView = () => {

  const error: any = useRouteError();
  console.error(error);

  return (
    <Container className={'ps-2 pe-2'}>
      <h1>Oops!</h1>
      <p>An unexpected error has occurred.</p>
      <p className={'text-danger'}><i>{error.statusText || error.message}</i></p>
    </Container>
  );
};
