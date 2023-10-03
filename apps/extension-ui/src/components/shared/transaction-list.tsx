import React, { useContext } from 'react';
import { truncateAddress } from '../../util';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { CryptoAccount } from '@nodewallet/types';
import { ErrorHandlerContext } from '../../hooks/error-handler-context';
import { ChainType } from '@nodewallet/constants';

export interface TransactionListProps {
  account: CryptoAccount,
}
export const TransactionList = ({ account }: TransactionListProps) => {

  const errorHandler = useContext(ErrorHandlerContext);
  const {
    accountTransactions,
  } = useSelector(({ appState }: RootState) => appState);

  const transactions = accountTransactions[account.id] || [];

  const onCopyTxidClick = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, txid: string) => {
    try {
      e.preventDefault();
      await navigator.clipboard.writeText(txid);
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  return (
    <div className={'flex-grow-1 position-relative'}>
      <div className={'position-absolute top-0 start-0 end-0 bottom-0 d-flex flex-column justify-content-start'}>
        <h4 className={'text-uppercase pt-2 pb-2 ps-2 pe-2'}>Recent Transactions</h4>
        <div className={'flex-grow-1 position-relative'}>
          <div className={'position-absolute top-0 start-0 end-0 bottom-0 overflow-x-hidden overflow-y-auto'}>
            <table className={'table mb-0'}>
              <tbody>
                {transactions
                  .map((tx, i) => {
                    const  { received } = tx;
                    const amount = tx.amount;
                    const isProof = /proof/.test(tx.type);
                    const isClaim = /claim/.test(tx.type);
                    const isStake = /stake/i.test(tx.type);
                    return (
                      <tr key={tx.hash}>
                        <td className={'font-monospace'}>{amount || ''}</td>
                        <td><strong className={(isProof || isClaim || isStake) ? '' : received ? 'text-success' : 'text-danger'}>{isProof ? 'Proof' : isClaim ? 'Claim' : isStake ? 'Stake' : received ? 'Received' : 'Sent'}</strong></td>
                        <td className={'font-monospace text-nowrap'}>
                          <a href={`https://poktscan.com${account.chain === ChainType.TESTNET ? '/testnet' : ''}/tx/${tx.hash}`} title={'Open in Poktscan'} target={'_blank'}>{truncateAddress(tx.hash)}</a> <a href={'#'} title={'Copy txid'} onClick={e => onCopyTxidClick(e, tx.hash)}><i className={'mdi mdi-content-copy'} /></a>
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
