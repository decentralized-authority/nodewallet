import React from 'react';
import { generateFakeAddress, getRandomInt, truncateAddress } from '../../util';

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
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                  // [getRandomInt(1, 1000).toString(), generateFakeAddress()],
                ]
                  .map(([amount, address], i) => {
                    const isSent = !!getRandomInt(0, 1);
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
