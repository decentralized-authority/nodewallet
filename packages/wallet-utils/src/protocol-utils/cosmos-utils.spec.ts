import 'should';
import { CosmosUtils } from './cosmos-utils';
import should from 'should';
import * as math from 'mathjs';

describe('CosmosUtils', function() {

  // @ts-ignore
  this.timeout(10000);

  const endpoint = 'https://rest.evmos-testnet.lava.build';
  const chainId = '9000';
  const address = 'evmos12emnq5d6cxxmxvxm8sag9hktxqsgayh4zf6v2l';
  const denom = 'atevmos';
  const txid = '612D8C00CB08A1FECB839DB8B89AB2B7FD05B2DF080504410A4AF0C65D666660';
  const txHeight = '21471661';

  describe('static getBlockHeight()', function() {
    it('should get the current block height', async function() {
      const blockCount = await CosmosUtils.getBlockHeight(endpoint, chainId);
      should(math.typeOf(blockCount)).equal('BigNumber');
      should(blockCount.toNumber()).be.greaterThan(0);
    });
  });

  describe('static getBalance()', function() {
    it('should get the balance of an address and denom', async function() {
      const balance = await CosmosUtils.getBalance(endpoint, chainId, address, denom);
      should(math.typeOf(balance)).equal('BigNumber');
      should(balance.toNumber()).be.greaterThan(0);
    });
  });

  describe('static getTransaction()', function() {
    it('should get a transaction from the txid', async function() {
      const tx = await CosmosUtils.getTransaction(endpoint, chainId, txid);
      should(tx).be.an.Object();
      should(tx.txhash).equal(txid);
      should(tx.tx).be.an.Object();
    });
  });

  describe('static getBlock()', function() {
    it('should get a block from the height', async function() {
      const block = await CosmosUtils.getBlock(endpoint, chainId, txHeight);
      should(block).be.an.Object();
      should(block.header?.height).be.a.String()
    });
  });

  describe('static getAccount()', function() {
    it('should get an account from the address', async function() {
      const account = await CosmosUtils.getAccount(endpoint, chainId, address);
      should(account).be.an.Object();
      // @ts-ignore
      should(account.base_account.address).equal(address);
    });
  });

});
