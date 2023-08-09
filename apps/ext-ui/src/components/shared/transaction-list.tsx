import React from 'react';
import * as uuid from 'uuid';

const getRandom = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};
const generateFakeAddress = () => {
  return uuid.v4().replace(/-/g, '');
}
const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

export const TransactionList = () => {
  return (
    <div className={'flex-grow-1 position-relative'}>
      <div className={'position-absolute top-0 start-0 end-0 bottom-0 d-flex flex-column justify-content-start'}>
        <h4 className={'text-uppercase pt-2 pb-2 ps-2 pe-2'}>Recent Transactions</h4>
        <div className={'flex-grow-1 position-relative'}>
          <div className={'position-absolute top-0 start-0 end-0 bottom-0 overflow-x-hidden overflow-y-auto'}>
            <table className={'table mb-0'}>
              <tbody>
                {[
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                  [getRandom(1, 1000).toString(), generateFakeAddress()],
                ]
                  .map(([amount, address], i) => {
                    const isSent = !!getRandom(0, 1);
                    return (
                      <tr key={`tx-${i}`}>
                        <td className={'font-monospace'}>{amount}</td>
                        <td className={isSent ? 'text-danger' : 'text-success'}>{isSent ? 'Sent' : 'Received'}</td>
                        <td className={'font-monospace'}>
                          <a href={'#'} title={'Open in Poktscan'}>{truncateAddress(address)}</a> <a href={'#'} title={'Copy tx'}><i className={'mdi mdi-content-copy'} /></a>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
