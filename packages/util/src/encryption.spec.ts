import should from 'should';
import { argon2, decrypt, encryptAES256GCM, EncryptionResult, generateRandom, generateSalt, pbkdf2 } from './index';
import { defaultAES256GCMConfig, EncryptionAlgorithm } from 'pbw-constants';
import crypto from 'crypto';

const isHex = (str: string) => /^[0-9a-fA-F]+$/.test(str);
const { keyLength } = defaultAES256GCMConfig;

describe('argon2()', function() {
  it('should hash a password using argon2', async function() {
    const res = await argon2('somepassword', 'somesalt', keyLength);
    should(res).be.a.String();
    res.length.should.equal(keyLength * 2);
    isHex(res).should.be.True();
  });
});

describe('pbkdf2()', function() {
  it('should hash a password using pbkdf2', async function() {
    const res = await pbkdf2('somepassword', 'somesalt', keyLength);
    should(res).be.a.String();
    res.length.should.equal(keyLength * 2);
    isHex(res).should.be.True();
  });
});

describe('generateRandom()', function() {
  it('should generate hex-encoded random bytes', async function() {
    const res = await generateRandom(32);
    should(res).be.a.String();
    res.length.should.equal(64);
    isHex(res).should.be.True();
  });
});

describe('generateSalt()', function() {
  it('should generate hex-encoded salt', async function() {
    const res = await generateSalt(keyLength);
    should(res).be.a.String();
    res.length.should.equal(keyLength * 2);
    isHex(res).should.be.True();
  });
});

const key = crypto.randomBytes(defaultAES256GCMConfig.keyLength).toString('hex');
const dataToEncrypt = 'here is some data to encrypt';
let encrypted: EncryptionResult

describe('encryptAES256GCM()', function() {
  it('should encrypt data using aes-256-gcm', async function() {
    encrypted = await encryptAES256GCM(
      dataToEncrypt,
      key,
    );
    should(encrypted).be.an.Object();
    encrypted.algorithm.should.be.a.String();
    encrypted.algorithm.should.equal(EncryptionAlgorithm.AES_256_GCM);
    encrypted.ciphertext.should.be.a.String();
    encrypted.ciphertext.length.should.be.greaterThan(0);
    isHex(encrypted.ciphertext).should.be.True();
    encrypted.iv.should.be.a.String();
    encrypted.iv.length.should.be.greaterThan(0);
    isHex(encrypted.iv).should.be.True();
    encrypted.tag.should.be.a.String();
    encrypted.tag.length.should.be.greaterThan(0);
    isHex(encrypted.tag).should.be.True();
  });
});

describe('decrypt()', function() {
  it('should decrypt data', async function() {
    const res = await decrypt(encrypted, key);
    res.should.equal(dataToEncrypt);
  });
});
