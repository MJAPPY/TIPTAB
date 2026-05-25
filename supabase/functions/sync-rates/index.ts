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

    console.log("[sync-rates] Starting advanced rate synchronization...");

    // 1. Fetch market data with correct CoinGecko IDs
    // METAL ID on CG is 'metal-pay'
    const cgResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=proton,metal-pay,loan&vs_currencies=usd");
    const cgData = await cgResponse.json();
    
    const alcorResponse = await fetch("https://proton.alcor.exchange/api/v2/tickers");
    const alcorData = await alcorResponse.json();
    
    const tabMarket = alcorData.find((m: any) => m.ticker_id === "TAB_XPR");
    const xmtMarket = alcorData.find((m: any) => m.ticker_id === "XMT_XPR");
    
    const xprUsd = cgData.proton?.usd;
    const metalUsd = cgData['metal-pay']?.usd;
    const loanUsd = cgData.loan?.usd;

    if (!xprUsd) {
      throw new Error("Failed to fetch XPR/USD price");
    }

    // Parity calculations via XPR
    let xprPerTab = 0.36; 
    if (tabMarket && tabMarket.last_price) {
      xprPerTab = parseFloat(tabMarket.last_price);
    }

    let xprPerXmt = 0.05; 
    if (xmtMarket && xmtMarket.last_price) {
      xprPerXmt = parseFloat(xmtMarket.last_price);
    }
    const xmtUsd = xprPerXmt * xprUsd;

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
    const membershipFeeMetal = metalUsd ? (targetUsd / metalUsd).toFixed(4) : (targetUsd / 0.012).toFixed(4);
    const membershipFeeLoan = loanUsd ? (targetUsd / loanUsd).toFixed(0) : (targetUsd * 4000).toFixed(0);
    const membershipFeeXmt = xmtUsd ? (targetUsd / xmtUsd).toFixed(4) : targetUsd.toFixed(4);
    
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

    console.log("[sync-rates] Successfully synced all rates for network assets.");

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