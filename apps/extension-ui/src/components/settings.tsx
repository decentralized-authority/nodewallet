import React from 'react';
import { Container } from './shared/container';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {

  const navigate = useNavigate();

  const onBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <Container className={'nw-bg-gradient-vertical'}>

      <h3 className={'ps-2 pe-2'}><a href={'#'} title={'Go back'} onClick={onBackClick}><i className={'mdi mdi-arrow-left-top-bold'} /></a> Settings</h3>

      <div className={'flex-grow-1 pt-4 ps-3 pe-3'}></div>

    </Container>
  );
};
