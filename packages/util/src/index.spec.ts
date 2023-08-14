import should from 'should';
import { generateRandom, generateSalt, pbkdf2 } from './index';
import { defaultSaltBits } from 'pbw-constants';

describe('pbkdf2()', function() {
  it('should hash a password using pbkdf2', async function() {
    const res = await pbkdf2('somepassword', 'somesalt');
    should(res).be.a.String();
  });
});

describe('generateRandom()', function() {
  it('should generate hex-encoded random bytes', async function() {
    const res = await generateRandom(256);
    should(res).be.a.String();
    res.length.should.equal(64);
  });
});

describe('generateSalt()', function() {
  it('should generate hex-encoded salt', async function() {
    const res = await generateSalt();
    should(res).be.a.String();
    res.length.should.equal(defaultSaltBits / 4);
  });
});
