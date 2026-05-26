// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log("[sync-rates] Starting precise Alcor-native rate synchronization...");

    // 1. Fetch live Alcor Tickers for all network pairs
    const alcorResponse = await fetch("https://proton.alcor.exchange/api/v2/tickers");
    const alcorData = await alcorResponse.json();
    
    const getAlcorRate = (id: string) => {
      const ticker = alcorData.find((m: any) => m.ticker_id === id);
      return ticker ? parseFloat(ticker.last_price) : null;
    };

    // ALCOR MASTER PARITY:
    // XUSDC_XPR ticker last_price = Amount of XPR per 1 USD (currently ~1111)
    const xprPerUsd = getAlcorRate("XUSDC_XPR") || 1111;
    
    // Other tickers = Amount of XPR per 1 unit of token
    const tabPriceInXpr = getAlcorRate("TAB_XPR") || 0.36;
    const xmtPriceInXpr = getAlcorRate("XMT_XPR") || 3.17;
    const loanPriceInXpr = getAlcorRate("LOAN_XPR") || 0.00025;
    const metalPriceInXpr = getAlcorRate("METAL_XPR") || 1611;

    // 2. Get current master settings
    const { data: settings, error: fetchError } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 'global')
      .single();

    if (fetchError || !settings) {
      throw new Error("Failed to fetch platform settings");
    }

    // 3. Calculate new rates based on XUSDC Master Target
    const targetUsd = Number(settings.membership_fee_xusdc);
    const totalXprRequired = targetUsd * xprPerUsd;
    
    // Calculation: (Total XPR needed for $1 target) / (Price of token in XPR)
    const membershipFeeXpr = Math.round(totalXprRequired);
    const membershipFeeXmd = targetUsd.toFixed(2);
    const membershipFeeMetal = (totalXprRequired / metalPriceInXpr).toFixed(4);
    const membershipFeeLoan = (totalXprRequired / loanPriceInXpr).toFixed(0);
    const membershipFeeXmt = (totalXprRequired / xmtPriceInXpr).toFixed(4);
    
    const boostTargetUsd = Number(settings.boost_price_xusdc);
    const boostPriceXpr = Math.round(boostTargetUsd * xprPerUsd);
    const boostPriceTab = Math.round(boostPriceXpr / tabPriceInXpr);

    // 4. Update table
    const { error: updateError } = await supabase
      .from('platform_settings')
      .update({
        membership_fee_xpr: membershipFeeXpr,
        membership_fee_xmd: parseFloat(membershipFeeXmd),
        membership_fee_metal: parseFloat(membershipFeeMetal),
        membership_fee_loan: parseFloat(membershipFeeLoan),
        membership_fee_xmt: parseFloat(membershipFeeXmt),
        boost_price_xpr: boostPriceXpr,
        boost_price_tab: boostPriceTab,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', 'global');

    if (updateError) {
      throw updateError;
    }

    console.log("[sync-rates] Successfully synced all Alcor-native DEX rates.");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("[sync-rates] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})