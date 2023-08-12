import should from 'should';
import { generateMnemonic } from './util';

describe('account-utils/util.js', function() {

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

});
