import _argon2 from 'argon2-browser';

export enum BackgroundListener {
  GET_LOGS = 'GET_LOGS',
}

export const defaultSeedBits = 256;

export enum HashFunction {
  ARGON2 = 'argon2',
  PBKDF2 = 'pbkdf2',
}

export interface Argon2Config {
  algorithm: HashFunction.ARGON2;
  time: number;
  mem: number;
  parallelism: number;
  type: _argon2.ArgonType;
}
export const defaultArgon2Config: Argon2Config = {
  algorithm: HashFunction.ARGON2,
  time: 3,             // iterations
  mem: 64 * 1024,      // memory in KiB
  parallelism: 4,
  type: _argon2.ArgonType.Argon2id, // Argon2d, Argon2i, Argon2id
};

export interface PBKDF2Config {
  algorithm: HashFunction;
  iterations: number;
  hashAlgorithm: string;
}
export const defaultPBKDF2Config: PBKDF2Config = {
  algorithm: HashFunction.PBKDF2,
  iterations: 1000000,
  hashAlgorithm: 'sha512',
};

export enum EncryptionAlgorithm {
  AES_256_GCM = 'aes-256-gcm',
}
export interface AES256GCMConfig {
  algorithm: EncryptionAlgorithm.AES_256_GCM;
  keyLength: number; // bytes
  ivLength: number;  // bytes
}
export const defaultAES256GCMConfig: AES256GCMConfig = {
  algorithm: EncryptionAlgorithm.AES_256_GCM,
  keyLength: 32, // bytes
  ivLength: 12,  // bytes
}

export const storageKeys = {
  LOGS: 'LOGS',
};
