import should from 'should';
import { PoktUtils } from './pokt-utils';
import { BigNumber } from 'mathjs';
import * as math from 'mathjs';

describe('PoktUtils', function() {

  const endpoint = process.env.POKT_ENDPOINT;
  const address = process.env.POKT_ADDRESS;
  const key = process.env.POKT_KEY;
  const recipient = process.env.POKT_RECIPIENT;

  if(!endpoint) {
    throw new Error('POKT_ENDPOINT env var not set');
  } else if(!address) {
    throw new Error('POKT_ADDRESS env var not set');
  } else if(!key) {
    throw new Error('POKT_KEY env var not set');
  } else if(!recipient) {
    throw new Error('POKT_RECIPIENT env var not set');
  }

  describe('static denom', function() {
    it('should be a string', function() {
      should(PoktUtils.denom).be.a.String();
    });
  });

  describe('static basedenom', function() {
    it('should be a string', function() {
      should(PoktUtils.baseDenom).be.a.String();
    });
  });

  describe('static baseMultiplier', function() {
    it('should be a BigNumber', function() {
      should(math.typeOf(PoktUtils.baseMultiplier)).equal('BigNumber');
    });
  });

  describe('static toBaseDenom()', function() {
    it('should convert a value from the standard denomination to the base denomination', function() {
      for(const value of ['1', math.bignumber(1)]) {
        const res = PoktUtils.toBaseDenom(value);
        should(math.typeOf(res)).equal('BigNumber');
        should(res.toString()).equal(PoktUtils.baseMultiplier.toString());
      }
    });
  });

  describe('static fromBaseDenom()', function() {
    it('should convert a value from the base denomination to the standard denomination', function() {
      for(const value of [PoktUtils.baseMultiplier.toString(), PoktUtils.baseMultiplier]) {
        const res = PoktUtils.fromBaseDenom(value);
        should(math.typeOf(res)).equal('BigNumber');
        should(res.toString()).equal('1');
      }
    });
  });

  describe('static getBalance()', function() {
    it('should get the balance at a POKT address', async function() {
      const balance = await PoktUtils.getBalance(endpoint, address);
      should(math.typeOf(balance)).equal('BigNumber');
    });
  });

  describe('static send()', function() {
    it('should send coin from one account to another', async function() {
      const txHash = await PoktUtils.send(endpoint, key, recipient, PoktUtils.chain.TESTNET, '100000', undefined, '10000');
      should(txHash).be.a.String();
      txHash.length.should.be.greaterThan(0);
    });
  });

});
