import { ED25519Utils } from './ed25519';
import { Account } from './ed25519';
import should from 'should';
import { PoktUtils } from '../coin-utils/pokt-utils';

const path = PoktUtils.bip32Path;

describe('ED25519Utils', function() {

  const data: [number, string, string, Account[]][] = [
    [
      256,
      'spring betray diary company priority labor street version pill oyster glow kit click useless riot they list october mention strategy shell universe great axis',
      '609f578414c2917a2b61d6b982f650aaba0c528bffd39b64cc9c8f5f5e91bfa92ccf9f394dd9d7f19e75a68b92ab75750268944612d9870f9791fab2ea548dbc',
      [
        {"address":"93b8d272821a54205e70fe437a75760063b5cf27","privateKey":"ff184e24578f775c16cc6a19e3e92152a6684376a7ac8e4841c7de8d96de391fc6604cad8180f7c4acd6e179af587f546bafe36b0e4ce8110e779ecd126f8c67","publicKey":"c6604cad8180f7c4acd6e179af587f546bafe36b0e4ce8110e779ecd126f8c67","index":0},
      ],
    ],
    [
      256,
      'mass light museum number grunt sick yellow rigid say canal inmate jacket kidney shoot current gesture myself cool raccoon image truth portion century armed',
      '9d36d541d0ccf5a8e0752f34f4388abb6d55be3c4e95e7f80e4e254fab367f8f0355035a1416e8bef1cefe6952ef26d95bb1d1dc7a2e74f8d1fb29aa30b40bf3',
      [
        {"address":"54cf73831cd3c17580cb519f2acde3c96304eb38","privateKey":"2b8c179c938d13c3672a4bf0e01d3d8edb3d56b5ce36ccdb11c7d690e3d3c984445f14e56a2ec688b4254a7c1b86adf3a4689e02d15526846c8782e1f21de57c","publicKey":"445f14e56a2ec688b4254a7c1b86adf3a4689e02d15526846c8782e1f21de57c","index":0},
      ],
    ],
    [ 128,
      'like fold boat flame clinic vapor flame expand gym useful offer gaze',
      '393b4ecb5fab1d8b0e9ef96647936b999030fb70257c2df6984842fe858150fae738ffe9516671c75906b62d9326e648303175446c569adc83cd394c3f1ff1f6',
      [
        {"address":"46783c31eedc4483ed0c756477c540f2d9bf7a64","privateKey":"6f99908073b426b731647d4ba2771161d987f6aefc0cbef31f315b87bf83f1e21872a622563d933d818179b51e03d6f3043898e20e589cabac438e2605f05cac","publicKey":"1872a622563d933d818179b51e03d6f3043898e20e589cabac438e2605f05cac","index":0},
      ],
    ],
    [ 128,
      'nuclear wet topple trend increase gown spawn belt hub item view rather',
      '93125107a5da33a520c273e86d14187c7889c4ea761c0427a0f7f592fb0e27b7b2c8aed60e42248cc77c4e1eab84b76ba10713b0a75d9ac3dc7a293fc5695340',
      [
        {"address":"8d2c0925eee29784cd52c0a03559bc9a1733d972","privateKey":"aba169ee914a58484345d6c206f80c1b639b24cc3cc0f1be1ddf68e1829b8fc4ffd7eea8c6a3a5488119fba492fa9ade647481e8b2137729388b17f83b07c3e5","publicKey":"ffd7eea8c6a3a5488119fba492fa9ade647481e8b2137729388b17f83b07c3e5","index":0}
      ],
    ],
  ];

  describe('.pathAtIdx()', function() {
    it('should generate a BIP32 path at the specified index', function() {
      const basePath = `m/44'/635'/0'/0`;
      const ed25519Utils = new ED25519Utils(basePath);
      const path0 = ed25519Utils.pathAtIdx(0);
      should(path0).equal(`m/44'/635'/0'/0'/0`);
      const path1 = ed25519Utils.pathAtIdx(1);
      should(path1).equal(`m/44'/635'/0'/0'/1`);
    });
  });

  describe('.fromPhrase()', function() {
    it('should crean an Account from a phrase', async function() {
      for(const [,phrase,,accounts] of data) {
        const ed25519Utils = new ED25519Utils(path);
        for(let i = 0; i < accounts.length; i++) {
          const res = await ed25519Utils.fromPhrase(phrase, i);
          should(res).deepEqual(accounts[i]);
        }
      }
    });
  });

  describe('.fromSeed()', function() {
    it('should crean an HDNodeWallet from a seed', async function() {
      for(const [,,seed,accounts] of data) {
        const ed25519Utils = new ED25519Utils(path);
        for(let i = 0; i < accounts.length; i++) {
          const res = await ed25519Utils.fromSeed(seed, i);
          should(res).deepEqual(accounts[i]);
        }
      }
    });
  });

});
