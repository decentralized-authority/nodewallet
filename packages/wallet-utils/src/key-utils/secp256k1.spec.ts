import should from 'should';
import { SECP256K1Utils } from './secp256k1';
import { Account } from './ed25519';

describe('SECP256K1Utils', function() {

  const path = `m/44'/60'/0'/0/0`;

  const data: [number, string, string, Account[]][] = [
    [
      256,
      'visit latin worry december lecture awake gas cement have thought version fever online vacant pond grunt this feel diary broom giggle shoe dance bracket',
      'd6eb484058d3aa31bf917a989a0981fb34d3a2c7a901895340b4c38d6637d06dcd54076b251b89116aa35633366ffe7eee8e718dbe97455275082b856f7b6842',
      [
        {"address":"0x73438315498CF6cC805b7d2D9Ebf1ae9b2135d6B","privateKey":"0xa1bd2b3b446df6942174333b3d322f3f299cc717c01bdf6f9d6ee205b986f9a0","publicKey":"0x0252c1bb94712942cf8e889561304d8e482d0227ccc0e07ff815a45e0c8cb1b5ed","index":0},
      ],
    ],
    [
      128,
      'hunt manual danger fox doctor web dawn seek glance quarter later unusual',
      '7c0b4ee2dee28518f80da1b29d22988a18b979cca16d9464557f3f93404d8151beb39d190087926d1c02fb240059de68500813771e93f204787495e6491aea7a',
      [
        {"address":"0x0444bA466a94675c42fe8ff2B541B1FD5D102532","privateKey":"0x63abd402e3781212d4aac926c6286c87e88117ba167792306902b966512cb902","publicKey":"0x035b7a997e0febce15b5c11ad7690bf66147db7ba2a56a090761609ab1f93eadc9","index":0},
      ],
    ],
    [ // from Taho
      256,
      'pottery advice empower pride spirit true label cool meadow machine report same tip question govern correct suspect second mean jazz science dune romance timber',
      'fb92e93c3b9a1565252f19f1308efae608e825c4cebed3d28dafc38c2ed73aff1e3ebc53de60589196c64742711a0b036d8999b7ce776ee763f26ef881323ae2',
      [
        {"address":"0x655610AAc83d6Cc37eA79136061619288C7b512F","privateKey":"0xc8601181f8c79ac99702a4b93f35f9004c19d1e7798518a17d2da5cc6453d30c","publicKey":"0x0272c4820bc94147cc77cd1868a546a565cb2a3b6a4f1f7c16b42612277af5cbd2","index":0},
      ]
    ],
    [ // from MetaMask
      128,
      'inform amazing drill boy dizzy drill pistol foam token border purchase rhythm',
      '273a1e617d957c26bf3b0a73840c04c95245648c28856e59370da3205c91362d41ec37349495c8b9a47a501cacfbbab616641718da7df048cee36c8f3b3c718b',
      [
        {"address":"0x2bcF9F08bc38C30efd0cB2147A98B9659258Dbd7","privateKey":"0xd98992b35f953e5ee110620c0df0a4d8e90f37d7e58748474a6712b981b83686","publicKey":"0x024e1da216adbf36a8b92879fd84ee2e10f26e18db5287c5aa3a44cb4f2af9dd29","index":0},
        {"address":"0xCE996F65B46Ee1F9f2B8d86c7e5c2ec52bA122b6","privateKey":"0xeb6547cb92787ce02cb683331970578fc07af569e1add4e7a399c20f3fc6c73a","publicKey":"0x033dd8f6e6d6d8125b4429ea7c026ccf5090281f1cbfc0a260f6ae74727779633f","index":1},
        {"address":"0x7B701F5D53C7e67B11D144BB362bF281A20d5335","privateKey":"0x9eb7de435da6fd8350217f4b388aba79c65ee3e157064e88b1ee242622c80180","publicKey":"0x03c8bf51397dcfb817cbe1ea26dec3273cdad42dcf703393c0a22ed7b39138b111","index":2},
      ]
    ],
    [ // from Rabby
      128,
      'nation despair crucial exchange fish buyer move permit school pony unit canal',
      'ca73f10c516e459642fc0be74d2ac1adf3083c427e04e2434203e6f10e4701457f127f9a5fe4035d0fd9755ee8848bab8967dfdec86312ff9043b861f747cdc1',
      [
        {"address":"0xA2820740BA57a6D00040bc432328Db07a2330306","privateKey":"0x447dc6d3e52112b48582dadf0ee632526ec0138134d4b1018fb767b1080e22df","publicKey":"0x03cf7d0db9d6b9e8ffdc33738898f547a16c5fffb45628b7afc520dc4bd9755b0e","index":0},
        {"address":"0x7Fe8F56eCbdA6aF624b3759A4481A34de6EAFb59","privateKey":"0x94d7d3d421879f4c5e8bedafb1ab1d2533b8e29fff086f389fbdebaa7d60dd72","publicKey":"0x02551e33dc1ff9f8b96e2511632a91b15efe95c06c210f8357895df65efa6c7980","index":1},
        {"address":"0x53a28452AA3Ae3F6e1142F69467E14320e85EC9B","privateKey":"0xe4f4fd0ab7ebe8eaa5068927859db51b741c281d62ac8ad8806c24f3a4cbdfb2","publicKey":"0x02b08d30f5749b472d737027672203b06e44798fb157ccc0d2c8ae23f830a83aa5","index":2},
      ]
    ],
  ];

  describe('.pathAtIdx()', function() {
    it('should generate a BIP32 path at the specified index', function() {
      const basePath = `m/44'/60'/0'/0/0`;
      const secp256k1 = new SECP256K1Utils(basePath);
      const path0 = secp256k1.pathAtIdx(0);
      should(path0).equal(basePath);
      const path1 = secp256k1.pathAtIdx(1);
      should(path1).equal(`m/44'/60'/0'/0/1`);
    });
  });

  describe('.fromPhrase()', function() {
    it('should crean an Account from a phrase', async function() {
      for(const [,phrase,,accounts] of data) {
        const secp256k1 = new SECP256K1Utils(path);
        for(let i = 0; i < accounts.length; i++) {
          const res = await secp256k1.fromPhrase(phrase, i);
          should(res).deepEqual(accounts[i]);
        }
      }
    });
  });

  describe('.fromSeed()', function() {
    it('should crean an HDNodeWallet from a seed', async function() {
      for(const [,,seed,accounts] of data) {
        const secp256k1 = new SECP256K1Utils(path);
        for(let i = 0; i < accounts.length; i++) {
          const res = await secp256k1.fromSeed(seed, i);
          should(res).deepEqual(accounts[i]);
        }
      }
    });
  });

});
