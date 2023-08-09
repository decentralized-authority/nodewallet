import React from 'react';

export const Navbar = () => {
  return (
    <nav className="navbar bg-body-tertiary pt-0 pb-0 ps-2 pe-2 d-flex flex-row justify-content-start align-items-center">
      <a href={'#'} title={'Pocket Network'}>
        <img src={'/images/coins/pokt.png'} alt="Pocket" height={30} />
      </a>
      <div className={'flex-grow-1'} />
      <h4 className={'ms-1 mt-0 mb-0'}>
        <a href={'#'} title={'Mainnet'}><i className={'mdi mdi-chevron-down'} />MAINNET</a>
      </h4>
      <div className={'flex-grow-1'} />
      <a href={'#'} title={'Menu'}><i className={'mdi mdi-menu fs-2'} /></a>
    </nav>
  );
};
