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

    console.log("[sync-rates] Starting precise rate synchronization...");

    // 1. Fetch market data with correct CoinGecko IDs
    // METAL ID on CG is 'metal-pay'
    const cgResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=proton,metal-pay,loan&vs_currencies=usd");
    const cgData = await cgResponse.json();
    
    const alcorResponse = await fetch("https://proton.alcor.exchange/api/v2/tickers");
    const alcorData = await alcorResponse.json();
    
    const getAlcorRate = (id: string) => {
      const ticker = alcorData.find((m: any) => m.ticker_id === id);
      return ticker ? parseFloat(ticker.last_price) : null;
    };

    const xprUsd = cgData.proton?.usd;
    const metalUsd = cgData['metal-pay']?.usd;
    const loanUsd = cgData.loan?.usd;

    if (!xprUsd) {
      throw new Error("Failed to fetch XPR/USD price anchor");
    }

    // Precise Parity calculations via Alcor DEX (XPR relative)
    const xprPerTab = getAlcorRate("TAB_XPR") || 0.36;
    const xprPerXmt = getAlcorRate("XMT_XPR") || 3.17;
    const xprPerLoan = getAlcorRate("LOAN_XPR") || (loanUsd ? loanUsd / xprUsd : 0.25);
    const xprPerMetal = getAlcorRate("METAL_XPR") || (metalUsd ? metalUsd / xprUsd : 1900);

    // 2. Get current master settings
    const { data: settings, error: fetchError } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 'global')
      .single();

    if (fetchError || !settings) {
      throw new Error("Failed to fetch platform settings");
    }

    // 3. Calculate new rates based on XUSDC Master Fee
    const targetUsd = Number(settings.membership_fee_xusdc);
    
    const membershipFeeXpr = Math.round(targetUsd / xprUsd);
    const membershipFeeXmd = targetUsd.toFixed(2);
    
    // Formula: Total Target USD / (Value of 1 token in USD)
    // Value of 1 token in USD = (Amount of XPR per 1 token) * (Value of 1 XPR in USD)
    const membershipFeeMetal = (targetUsd / (xprPerMetal * xprUsd)).toFixed(4);
    const membershipFeeLoan = (targetUsd / (xprPerLoan * xprUsd)).toFixed(0);
    const membershipFeeXmt = (targetUsd / (xprPerXmt * xprUsd)).toFixed(4);
    
    const boostTargetUsd = Number(settings.boost_price_xusdc);
    const boostPriceXpr = Math.round(boostTargetUsd / xprUsd);
    const boostPriceTab = Math.round(boostPriceXpr / xprPerTab);

    // 4. Update table
    const { error: updateError } = await supabase
      .from('platform_settings')
      .update({
        membership_fee_xpr: membershipFeeXpr,
        membership_fee_xmd: membershipFeeXmd,
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

    console.log("[sync-rates] Successfully synced all precise DEX rates.");

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