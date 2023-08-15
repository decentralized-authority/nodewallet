import _argon2 from 'argon2-browser';
import { pbkdf2 as _pbkdf2 } from '@ethersproject/pbkdf2';
import { toUtf8Bytes } from '@ethersproject/strings';
import crypto from 'crypto';
import { defaultKeyLength, defaultSaltBits } from 'pbw-constants';

export const argon2 = async (password: string, salt: string): Promise<string> => {
  const { hashHex } = await _argon2.hash({
    pass: password,
    salt,
    hashLen: defaultKeyLength,
    time: 3, // iterations
    mem: 64 * 1024, // memory in KiB
    parallelism: 4,
    type: _argon2.ArgonType.Argon2id, // Argon2d, Argon2i, Argon2id
  });
  return hashHex;
};

export const pbkdf2 = async (password: string, salt: string): Promise<string> => {
  return _pbkdf2(toUtf8Bytes(password), toUtf8Bytes(salt), 100000, defaultKeyLength, 'sha512').slice(2);
};

/**
 * Generate a random hex string of the given size
 * @param size The size of the string in bits
 */
export const generateRandom = async (size: number): Promise<string> => {
  return crypto.randomBytes(size / 8).toString('hex');
};

/**
 * Generate a random hex-encoded salt
 * @param size The size of the salt in bits
 */
export const generateSalt = async (size = defaultSaltBits): Promise<string> => {
  return generateRandom(size);
};
