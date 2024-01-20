import * as uuid from 'uuid';
import { PASSWORD_MIN_LENGTH } from './constants';
import { Location } from 'react-router-dom';
import { POPUP_WIDTH } from '@decentralizedauthority/nodewallet-constants';

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const generateFakeAddress = () => {
  return uuid.v4().replace(/-/g, '');
};

export const truncateAddress = (address: string, num = 6) => {
  return `${address.slice(0, num)}\u2026${address.slice(-1 * num)}`;
};

export const isDev = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isTab = (): boolean => {
  // return window.location.hash === '#tab';
  return window.innerWidth > POPUP_WIDTH;
};

export const isValidPassword = (password: string): boolean => {
  return !!password.trim() && password.length >= PASSWORD_MIN_LENGTH;
};

export const generatePoktscanAccountUrl = (address: string) => {
  return `https://poktscan.com/account/${address}`;
}

export const calledFromContentScript = (location: Location): boolean => {
  const queryParams = new URLSearchParams(location.search);
  return queryParams.get('content') === 'true';
}
