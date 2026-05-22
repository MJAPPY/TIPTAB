
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log("[sync-rates] Starting rate synchronization...");

    // 1. Fetch market data
    const cgResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=proton&vs_currencies=usd");
    const cgData = await cgResponse.json();
    
    const alcorResponse = await fetch("https://proton.alcor.exchange/api/v2/tickers");
    const alcorData = await alcorResponse.json();
    const tabMarket = alcorData.find((m: any) => m.ticker_id === "TAB_XPR");
    
    const xprUsd = cgData.proton?.usd;
    let xprPerTab = 0.36; 
    if (tabMarket && tabMarket.last_price) {
      xprPerTab = parseFloat(tabMarket.last_price);
    }

    if (!xprUsd) {
      throw new Error("Failed to fetch XPR/USD price");
    }

    // 2. Get current master settings
    const { data: settings, error: fetchError } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 'global')
      .single();

    if (fetchError || !settings) {
      throw new Error("Failed to fetch platform settings");
    }

    // 3. Calculate new rates
    const membershipFeeXpr = Math.round(Number(settings.membership_fee_xusdc) / xprUsd);
    const membershipFeeXmd = Number(settings.membership_fee_xusdc).toFixed(2);
    
    const boostPriceXpr = Math.round(Number(settings.boost_price_xusdc) / xprUsd);
    const boostPriceTab = Math.round(boostPriceXpr / xprPerTab);

    // 4. Update table
    const { error: updateError } = await supabase
      .from('platform_settings')
      .update({
        membership_fee_xpr: membershipFeeXpr,
        membership_fee_xmd: membershipFeeXmd,
        boost_price_xpr: boostPriceXpr,
        boost_price_tab: boostPriceTab,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', 'global');

    if (updateError) {
      throw updateError;
    }

    console.log("[sync-rates] Successfully synced rates:", {
      xprUsd,
      xprPerTab,
      membershipFeeXpr,
      boostPriceTab
    });

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
