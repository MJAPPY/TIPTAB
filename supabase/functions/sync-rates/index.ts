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

    // Market data for TAB calculation
    const alcorResponse = await fetch("https://proton.alcor.exchange/api/v2/tickers");
    const alcorData = await alcorResponse.json();
    const xprPerTab = alcorData.find((m: any) => m.ticker_id === "TAB_XPR")?.last_price || 0.36;

    // Get master settings
    const { data: settings, error: fetchError } = await supabase.from('platform_settings').select('*').eq('id', 'global').single();
    if (fetchError || !settings) throw new Error("Failed to fetch settings");

    const targetUsd = Number(settings.membership_fee_xusdc);
    
    // Precise recalibration based on user example:
    // 1 XUSDC = 366 XPR / 3.3 XMT / 2143 LOAN / 5.9 METAL
    const membershipFeeXpr = Math.round(targetUsd * 366);
    const membershipFeeXmd = targetUsd.toFixed(2);
    const membershipFeeMetal = (targetUsd * 5.9).toFixed(4);
    const membershipFeeLoan = (targetUsd * 2143).toFixed(0);
    const membershipFeeXmt = (targetUsd * 3.3).toFixed(4);
    
    const boostTargetUsd = Number(settings.boost_price_xusdc);
    const boostPriceXpr = Math.round(boostTargetUsd * 366);
    const boostPriceTab = Math.round(boostPriceXpr / xprPerTab);

    // Update database
    await supabase.from('platform_settings').update({
      membership_fee_xpr: membershipFeeXpr,
      membership_fee_xmd: membershipFeeXmd,
      membership_fee_metal: parseFloat(membershipFeeMetal),
      membership_fee_loan: parseFloat(membershipFeeLoan),
      membership_fee_xmt: parseFloat(membershipFeeXmt),
      boost_price_xpr: boostPriceXpr,
      boost_price_tab: boostPriceTab,
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', 'global');

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