"use client";

export const PROTON_ENDPOINTS = [
  'https://api.protonnz.com',
  'https://proton.eosusa.io',
  'https://proton.cryptolions.io',
  'https://api.protonchain.com'
];

export const APP_IDENTIFIER = 'tiptab';
export const APP_NAME = 'TIPTAB';

export const ROOT_ADMINS = ['tiptab'];

export const TOKENS = [
  { symbol: 'XPR', code: 'eosio.token', precision: 4 },
  { symbol: 'TAB', code: 'tokencreate', precision: 0 },
  { symbol: 'XMD', code: 'xmd.token', precision: 6 },
  { symbol: 'XUSDC', code: 'xtokens', precision: 6 },
  { symbol: 'METAL', code: 'token.metal', precision: 8 },
  { symbol: 'LOAN', code: 'loan.token', precision: 4 },
  { symbol: 'XMT', code: 'xtokens', precision: 8 },
];

export const DEFAULT_ACTIVITIES = [];