import should from 'should';
import {
  entropyToMnemonic,
  generateMnemonic,
  getWordlist,
  isValidMnemonic,
  mnemonicToEntropy,
  mnemonicToSeed
} from './mnemonic';
import { hdNodeToAccount } from './index';
import { HDNodeWallet } from 'ethers';

describe('wallet-utils/util.js', function() {

  const mnemonicPhrases: [number, string, string, string][] = [
    [
      256,
      'visit latin worry december lecture awake gas cement have thought version fever online vacant pond grunt this feel diary broom giggle shoe dance bracket',
      'd6eb484058d3aa31bf917a989a0981fb34d3a2c7a901895340b4c38d6637d06dcd54076b251b89116aa35633366ffe7eee8e718dbe97455275082b856f7b6842',
      'f4cfaff71c57f02058012969bc1fcb2ab9afe0e9f339e0ca98f50e661f8ccdd0',
    ],
    [
      128,
      'hunt manual danger fox doctor web dawn seek glance quarter later unusual',
      '7c0b4ee2dee28518f80da1b29d22988a18b979cca16d9464557f3f93404d8151beb39d190087926d1c02fb240059de68500813771e93f204787495e6491aea7a',
      '6f70ecddae2405f18dfe1862b5edf577',
    ],
  ];

  describe('getWordlist', function() {
    it('should get a wordlist by language', function() {
      const languages = [
        'en',
        'EN',
        'some invalid language',
      ];
      for(const lang of languages) {
        const wordlist = getWordlist(lang);
        should(wordlist).be.an.Array();
        wordlist.length.should.be.greaterThan(0);
        for(const word of wordlist) {
          should(word).be.a.String();
        }
      }
    });
  });

  describe('generateMnemonic', function() {
    it('should generate a mnemonic', async function() {
      const seedStrengths = [
        [128, 12],
        [256, 24],
      ];
      for(const [strength, length] of seedStrengths) {
        const mnemonic = await generateMnemonic(strength);
        should(mnemonic).be.a.String();
        mnemonic.split(/\s/).length.should.equal(length);
      }
    });
  });

  describe('mnemonicToSeed', function() {
    it('should generate a seed from a mnemonic', async function() {
      for(const [strength, mnemonic, expectedSeed] of mnemonicPhrases) {
        const seed = await mnemonicToSeed(mnemonic);
        should(seed).be.a.String();
        seed.should.equal(expectedSeed);
      }
    });
  });

  describe('mnemonicToEntropy', function() {
    it('should convert a mnemonic to entropy', async function() {
      for(const [strength, mnemonic, seed, expectedEntropy] of mnemonicPhrases) {
        const res = await mnemonicToEntropy(mnemonic);
        should(res).be.a.String();
        res.should.equal(expectedEntropy);
      }
    });
  });

  describe('entropyToMnemonic', function() {
    it('should convert entropy to a mnemonic', async function() {
      for(const [strength, origMnemonic, seed, entropy] of mnemonicPhrases) {
        const mnemonic = await entropyToMnemonic(entropy);
        should(mnemonic).be.a.String();
        mnemonic.should.equal(origMnemonic);
      }
    });
  });

  describe('isValidMnemonic', function() {
    it('should validate a mnemonic', function() {
      for(const [strength, mnemonic] of mnemonicPhrases) {
        const res = isValidMnemonic(mnemonic);
        should(res).be.true();
      }
      const invalidMnemonic = 'here is a mnemonic phrase which is not valid despite twelve words';
      const res = isValidMnemonic(invalidMnemonic);
      should(res).be.false();
    });
  });

  describe('hdNodeToAccount', function() {
    it('should convert an HDNodeWallet to an Account', function() {
      const node = HDNodeWallet.createRandom();
      const account = hdNodeToAccount(node);
      should(account).be.an.Object();
      should(account.address).be.a.String();
      should(account.privateKey).be.a.String();
      should(account.publicKey).be.a.String();
      should(account.index).be.a.Number();
    });
  });

});
