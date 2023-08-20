import _argon2 from 'argon2-browser';
import { pbkdf2 as _pbkdf2 } from '@ethersproject/pbkdf2';
import { toUtf8Bytes } from '@ethersproject/strings';
import crypto from 'crypto';
import {
  AES256GCMConfig,
  Argon2Config, defaultAES256GCMConfig,
  defaultArgon2Config,
  defaultPBKDF2Config,
  EncryptionAlgorithm,
  PBKDF2Config
} from '@nodewallet/constants';

export const argon2 = async (password: string, salt: string, hashLength: number, config: Argon2Config = defaultArgon2Config): Promise<string> => {
  const { hashHex } = await _argon2.hash({
    pass: password,
    salt,
    hashLen: hashLength,  // hash length in bytes
    time: config.time,    // iterations
    mem: config.mem,      // memory in KiB
    parallelism: config.parallelism,
    type: config.type,    // Argon2d, Argon2i, Argon2id
  });
  return hashHex;
};

export const pbkdf2 = async (password: string, salt: string, hashLength: number, config: PBKDF2Config = defaultPBKDF2Config): Promise<string> => {
  return _pbkdf2(
    toUtf8Bytes(password),
    toUtf8Bytes(salt),
    config.iterations,
    hashLength,
    config.hashAlgorithm,
  ).slice(2);
};

/**
 * Generate a random hex string of the given size
 * @param size The size of the string in bytes
 */
export const generateRandom = async (size: number): Promise<string> => {
  return crypto.randomBytes(size).toString('hex');
};

/**
 * Generate a random hex-encoded salt
 * @param size The size of the salt in bytes
 */
export const generateSalt = async (size: number): Promise<string> => {
  return generateRandom(size);
};

export interface EncryptionResult {
  algorithm: EncryptionAlgorithm.AES_256_GCM
  ciphertext: string
  iv: string
  tag: string
}

export const encryptAES256GCM = async (data: any, key: string, config: AES256GCMConfig = defaultAES256GCMConfig): Promise<EncryptionResult> => {
  const { algorithm } = config;
  const plaintext = JSON.stringify(data);
  const iv = await generateRandom(config.ivLength);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex'),
  );
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return {
    algorithm,
    ciphertext: encrypted,
    iv,
    tag,
  };
};

export const decrypt = async (data: EncryptionResult, key: string): Promise<string> => {
  const { ciphertext, iv , tag} = data;
  const decipher = crypto.createDecipheriv(
    data.algorithm,
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};
