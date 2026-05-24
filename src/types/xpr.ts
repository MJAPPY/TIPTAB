"use client";

import { LinkSession } from '@proton/web-sdk';
import { Creator } from '@/data/creators';

export interface PromoCode {
  id: string;
  code: string;
  type: 'free' | 'percent';
  value: number; 
  maxUses: number;
  uses: number;
}

export interface AdminUser {
  id: string;
  handle: string;
  role: 'super' | 'moderator' | 'treasurer';
  isPermanent?: boolean; 
}

export interface Balances {
  xpr: string;
  tab: string;
  xmd: string;
  xusdc: string;
  metal: string;
  loan: string;
  tipsSent: number;
}

export interface Activity {
  id: number;
  icon: string;
  text: string;
  color: string;
}