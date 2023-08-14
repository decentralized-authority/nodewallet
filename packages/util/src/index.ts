import { pbkdf2 as _pbkdf2 } from '@ethersproject/pbkdf2';
import { toUtf8Bytes } from '@ethersproject/strings';
import crypto from 'crypto';

export const defaultHashIterations = 100000;
export const defaultHashLength = 64;
export const defaultHashAlgorithm = 'sha512';
export const defaultSaltBits = 512;

export const pbkdf2 = async (password: string, salt: string): Promise<string> => {
  return _pbkdf2(toUtf8Bytes(password), toUtf8Bytes(salt), 100000, 64, 'sha512');
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
