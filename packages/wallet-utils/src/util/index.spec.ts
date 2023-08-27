import should from 'should';
import { seedToMasterId } from './index';

describe('util', function() {

  describe('seedToMasterId', function() {
    it('should return a master ID sliced from the public key at path m', async function() {
      const mnemonic = 'despair resource thumb among issue fury north anxiety slogan market glad embark token sheriff supreme clarify sleep later slender place point exchange subway ozone';
      const seed = '03d68533855a5758878ed792a876d41357011f6ff7162bb0fa33fdec5cff2666f33955371e9e9b80a5002794d397555ce10d93a7e27da47cf86b7b96b928f8ea';
      const expectedId = '0226d7692722b736648646db41a7a897';
      const res = seedToMasterId(seed);
      should(res).be.a.String();
      res.length.should.equal(32);
      res.should.equal(expectedId);
    });
  });

});
