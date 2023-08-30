import * as uuid from 'uuid';

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const generateFakeAddress = () => {
  return uuid.v4().replace(/-/g, '');
};

export const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

export const isDev = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isTab = (): boolean => {
  return window.location.hash === '#tab';
};
