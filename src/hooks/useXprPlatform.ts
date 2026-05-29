"use client";

import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PromoCode, AdminUser } from '@/types/xpr';

export const useXprPlatform = (currentAdmin: AdminUser | null) => {
  const [membershipFee, setMembershipFee] = useState("2500");
  const [membershipFeeXmd, setMembershipFeeXmd] = useState("2.50");
  const [membershipFeeXusdc, setMembershipFeeXusdc] = useState("2.50");
  const [membershipFeeMetal, setMembershipFeeMetal] = useState("2.50");
  const [membershipFeeLoan, setMembershipFeeLoan] = useState("10000");
  const [membershipFeeXmt, setMembershipFeeXmt] = useState("2.50");
  
  // Set default TAB price lower relative to XPR to incentivize use
  const [boostPrice, setBoostPrice] = useState("1000");
  const [boostTabPrice, setBoostTabPrice] = useState("1800"); 
  const [boostPriceXusdc, setBoostPriceXusdc] = useState("1.00");

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_promo_codes");
      return saved ? JSON.parse(saved) : [
        { id: "p1", code: "WELCOME100", type: "free", value: 100, maxUses: 50, uses: 0 },
        { id: "p2", code: "HUSTLE50", type: "percent", value: 50, maxUses: 100, uses: 0 }
      ];
    }
    return [];
  });

  const syncPlatformSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('platform_settings').select('*').eq('id', 'global').single();
      if (data && !error) {
        setMembershipFee(data.membership_fee_xpr.toString());
        setMembershipFeeXmd(data.membership_fee_xmd.toString());
        setMembershipFeeXusdc(data.membership_fee_xusdc.toString());
        if (data.membership_fee_metal) setMembershipFeeMetal(data.membership_fee_metal.toString());
        if (data.membership_fee_loan) setMembershipFeeLoan(data.membership_fee_loan.toString());
        if (data.membership_fee_xmt) setMembershipFeeXmt(data.membership_fee_xmt.toString());
        
        setBoostPrice(data.boost_price_xpr.toString());
        setBoostTabPrice(data.boost_price_tab.toString());
        setBoostPriceXusdc(data.boost_price_xusdc.toString());
      }
    } catch (err) { console.error("Settings sync error:", err); }
  }, []);

  const updateMembershipFee = async (fee: string, asset: 'XPR' | 'XMD' | 'XUSDC' | 'METAL' | 'LOAN' | 'XMT' = 'XPR') => {
    if (!currentAdmin || currentAdmin.role !== 'super') return;
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (asset === 'XPR') { setMembershipFee(fee); updateData.membership_fee_xpr = parseFloat(fee); }
    else if (asset === 'XMD') { setMembershipFeeXmd(fee); updateData.membership_fee_xmd = parseFloat(fee); }
    else if (asset === 'XUSDC') { setMembershipFeeXusdc(fee); updateData.membership_fee_xusdc = parseFloat(fee); }
    else if (asset === 'METAL') { setMembershipFeeMetal(fee); updateData.membership_fee_metal = parseFloat(fee); }
    else if (asset === 'LOAN') { setMembershipFeeLoan(fee); updateData.membership_fee_loan = parseFloat(fee); }
    else if (asset === 'XMT') { setMembershipFeeXmt(fee); updateData.membership_fee_xmt = parseFloat(fee); }
    
    await supabase.from('platform_settings').update(updateData).eq('id', 'global');
  };

  const updateBoostPrice = async (price: string) => {
    if (!currentAdmin || currentAdmin.role !== 'super') return;
    setBoostPrice(price);
    await supabase.from('platform_settings').update({ boost_price_xpr: parseFloat(price), updated_at: new Date().toISOString() }).eq('id', 'global');
  };

  const updateBoostTabPrice = async (price: string) => {
    if (!currentAdmin || currentAdmin.role !== 'super') return;
    setBoostTabPrice(price);
    await supabase.from('platform_settings').update({ boost_price_tab: parseFloat(price), updated_at: new Date().toISOString() }).eq('id', 'global');
  };

  const updateBoostPriceXusdc = async (price: string) => {
    if (!currentAdmin || currentAdmin.role !== 'super') return;
    setBoostPriceXusdc(price);
    await supabase.from('platform_settings').update({ boost_price_xusdc: parseFloat(price), updated_at: new Date().toISOString() }).eq('id', 'global');
  };

  const createPromoCode = (code: string, type: 'free' | 'percent', value: number, maxUses: number) => {
    if (!currentAdmin || (currentAdmin.role !== 'super' && currentAdmin.role !== 'treasurer')) return;
    const newCode: PromoCode = { id: "promo_" + Date.now(), code: code.toUpperCase().trim(), type, value: type === 'free' ? 100 : value, maxUses, uses: 0 };
    const updated = [...promoCodes, newCode];
    setPromoCodes(updated);
    localStorage.setItem("tiptab_promo_codes", JSON.stringify(updated));
  };

  const deletePromoCode = (id: string) => {
    if (!currentAdmin || (currentAdmin.role !== 'super' && currentAdmin.role !== 'treasurer')) return;
    const updated = promoCodes.filter(c => c.id !== id);
    setPromoCodes(updated);
    localStorage.setItem("tiptab_promo_codes", JSON.stringify(updated));
  };

  const applyPromoCode = (code: string): PromoCode | null => {
    const cleanCode = code.toUpperCase().trim();
    const found = promoCodes.find(c => c.code === cleanCode);
    return (found && found.uses < found.maxUses) ? found : null;
  };

  const usePromoCode = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    const updated = promoCodes.map(c => c.code === cleanCode ? { ...c, uses: c.uses + 1 } : c);
    setPromoCodes(updated);
    localStorage.setItem("tiptab_promo_codes", JSON.stringify(updated));
  };

  return {
    membershipFee, membershipFeeXmd, membershipFeeXusdc, membershipFeeMetal, membershipFeeLoan, membershipFeeXmt,
    boostPrice, boostTabPrice, boostPriceXusdc,
    promoCodes, syncPlatformSettings, updateMembershipFee, updateBoostPrice, updateBoostTabPrice, updateBoostPriceXusdc,
    createPromoCode, deletePromoCode, applyPromoCode, usePromoCode
  };
};