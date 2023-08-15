import should from 'should';
import { argon2, generateRandom, generateSalt, pbkdf2 } from './index';
import { defaultKeyLength, defaultSaltBits } from 'pbw-constants';

const isHex = (str: string) => /^[0-9a-fA-F]+$/.test(str);

describe('argon2()', function() {
  it('should hash a password using argon2', async function() {
    const res = await argon2('somepassword', 'somesalt');
    should(res).be.a.String();
    res.length.should.equal(defaultKeyLength * 2);
    isHex(res).should.be.True();
  });
});

describe('pbkdf2()', function() {
  it('should hash a password using pbkdf2', async function() {
    const res = await pbkdf2('somepassword', 'somesalt');
    should(res).be.a.String();
    res.length.should.equal(defaultKeyLength * 2);
    isHex(res).should.be.True();
  });
});

describe('generateRandom()', function() {
  it('should generate hex-encoded random bytes', async function() {
    const res = await generateRandom(256);
    should(res).be.a.String();
    res.length.should.equal(64);
    isHex(res).should.be.True();
  });
});

describe('generateSalt()', function() {
  it('should generate hex-encoded salt', async function() {
    const res = await generateSalt();
    should(res).be.a.String();
    res.length.should.equal(defaultSaltBits / 4);
    isHex(res).should.be.True();
  });
});
