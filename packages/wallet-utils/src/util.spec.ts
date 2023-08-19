import should from 'should';
import { generateMnemonic, mnemonicToSeed } from './util';

describe('wallet-utils/util.js', function() {

  describe('generateMnemonic', function() {
    it('should generate a mnemonic', function() {
      const mnemonic = generateMnemonic();
      should(mnemonic).be.an.Array();
      for(const w of mnemonic) {
        should(w).be.a.String();
      }
      mnemonic.length.should.equal(24);
    });
  });

  describe('mnemonicToSeed', function() {
    it('should generate a seed', function() {
      const mnemonic256 = 'visit latin worry december lecture awake gas cement have thought version fever online vacant pond grunt this feel diary broom giggle shoe dance bracket';
      const address = mnemonicToSeed(mnemonic256);
      console.log('address', address);
      // const mnemonic128 = 'hunt manual danger fox doctor web dawn seek glance quarter later unusual';
    });
  });

});
