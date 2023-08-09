import React from 'react';

export const BalanceCard = () => {

  const styles = {
    button: {
      minWidth: 120,
    },
  };

  return (
    <div className={'card mb-0'}>
      <div className={'card-body pt-2 pb-2 ps-2 pe-2'}>
        <h5 className={'d-flex flex-row justify-content-between align-items-center mt-0 mb-0'}>
          <div><a href={"#"} title={'View wallets'}><i className={'mdi mdi-menu-left'} />HD Wallet 1</a></div>
          <div className={'font-monospace'}>54cf7...4eb38 <a href={'#'} title={'Copy address'}><i className={'mdi mdi-content-copy'} /></a></div>
        </h5>
        <div className={'d-flex flex-row justify-content-center pt-3 pb-3'}>
          <div>
            <h1 className={'mt-0 mb-0'}><span className={'font-monospace'}>81,209</span> <span className={'fs-4 opacity-75'}>POKT</span></h1>
            <div className={'d-flex flex-row justify-content-end fs-4 font-monospace'}>$2192.64</div>
          </div>
        </div>
        <div className={'d-flex flex-row justify-content-evenly'}>
          <button style={styles.button} className={'btn btn-primary text-uppercase fw-bold'}>Stake</button>
          <button style={styles.button} className={'btn btn-primary text-uppercase fw-bold'}>Send</button>
        </div>
      </div>
    </div>
  );
}
