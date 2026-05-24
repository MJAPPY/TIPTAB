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
];

export const DEFAULT_ACTIVITIES = [
  { id: 1, icon: "Zap", text: "New Tip: 500 TAB sent to @alex_arts", color: "text-orange-500" },
  { id: 2, icon: "Sparkles", text: "@sarahcodes just joined the global map!", color: "text-purple-400" },
  { id: 3, icon: "TrendingUp", text: "Network Milestone: 1.2M TAB tipped globally", color: "text-green-400" },
  { id: 4, icon: "Heart", text: "Top Supporter: 0x71...4F2a sent a 5,000 TAB tip!", color: "text-pink-500" },
  { id: 5, icon: "Zap", text: "New Tip: 250 TAB sent to @priyatech", color: "text-orange-500" },
  { id: 6, icon: "Sparkles", text: "@mwright is now a verified creator", color: "text-purple-400" },
];