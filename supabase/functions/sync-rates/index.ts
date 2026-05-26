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

    // 1. Fetch live market anchor from CoinGecko
    const cgResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=proton&vs_currencies=usd");
    const cgData = await cgResponse.json();
    const xprUsd = cgData.proton?.usd;
    
    if (!xprUsd) {
      throw new Error("Failed to fetch XPR/USD price anchor");
    }

    // 2. Fetch Alcor DEX Tickers for accurate chain parity
    const alcorResponse = await fetch("https://proton.alcor.exchange/api/v2/tickers");
    const alcorData = await alcorResponse.json();
    
    const getAlcorRate = (id: string) => {
      const ticker = alcorData.find((m: any) => m.ticker_id === id);
      return ticker ? parseFloat(ticker.last_price) : null;
    };

    // Tickers return amount of XPR per 1 unit of token
    const xprPerTab = getAlcorRate("TAB_XPR") || 0.36;
    const xprPerXmt = getAlcorRate("XMT_XPR") || 111.0;
    const xprPerLoan = getAlcorRate("LOAN_XPR") || 0.17;
    const xprPerMetal = getAlcorRate("METAL_XPR") || 62.0;

    // 3. Get current master settings
    const { data: settings, error: fetchError } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 'global')
      .single();

    if (fetchError || !settings) {
      throw new Error("Failed to fetch platform settings");
    }

    // 4. Calculate new rates based on XUSDC Master Fee target
    const targetUsd = Number(settings.membership_fee_xusdc);
    
    const membershipFeeXpr = Math.round(targetUsd / xprUsd);
    const membershipFeeXmd = targetUsd.toFixed(2);
    
    // Parity Formula: TargetUSD / (Price_of_token_in_XPR * XPR_USD_Price)
    const membershipFeeMetal = (targetUsd / (xprPerMetal * xprUsd)).toFixed(4);
    const membershipFeeLoan = (targetUsd / (xprPerLoan * xprUsd)).toFixed(0);
    const membershipFeeXmt = (targetUsd / (xprPerXmt * xprUsd)).toFixed(4);
    
    const boostTargetUsd = Number(settings.boost_price_xusdc);
    const boostPriceXpr = Math.round(boostTargetUsd / xprUsd);
    const boostPriceTab = Math.round(boostPriceXpr / xprPerTab);

    // 5. Update database table
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