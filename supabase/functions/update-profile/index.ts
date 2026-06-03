// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { profile, actor, transactionId } = await req.json()

    console.log("[update-profile] Received secure update request:", { actor, transactionId });

    if (!actor || !profile || !transactionId) {
      throw new Error("Missing required parameters: actor, profile, or transactionId");
    }

    // 1. Verify transaction on-chain via XPR Network endpoints
    const endpoints = [
      'https://api.protonnz.com',
      'https://api.protonchain.com',
      'https://proton.eosusa.io'
    ];

    let txData = null;
    let fetchError = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`[update-profile] Attempting chain validation via: ${endpoint}`);
        const response = await fetch(`${endpoint}/v1/history/get_transaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: transactionId })
        });
        
        if (response.ok) {
          txData = await response.json();
          break; // Found it!
        }
      } catch (err) {
        fetchError = err;
      }
    }

    if (!txData) {
      throw new Error(`Transaction verification failed. Node response: ${fetchError?.message || 'Transaction not found on-chain'}`);
    }

    // 2. Extract authorizations & details from the transaction actions
    const action = txData.trx?.trx?.actions?.[0];
    if (!action) {
      throw new Error("No valid actions found in the transaction record");
    }

    const authActor = action.authorization?.[0]?.actor;
    const toRecipient = action.data?.to;
    const memo = action.data?.memo || "";

    console.log("[update-profile] Parsed transaction action metadata:", { authActor, toRecipient, memo });

    // 3. Security Assertions
    if (authActor?.toLowerCase() !== actor.toLowerCase()) {
      throw new Error(`Authorization mismatch: Transaction signed by @${authActor} but updating @${actor}`);
    }

    if (toRecipient?.toLowerCase() !== 'tiptab') {
      throw new Error(`Recipient mismatch: Proof transaction target must be @tiptab`);
    }

    if (!memo.startsWith("Update Profile Proof:")) {
      throw new Error(`Memo mismatch: Invalid proof transaction purpose`);
    }

    // 4. Secure DB Write using Admin Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`[update-profile] Proof signature verified. Performing admin upsert for @${actor}`);

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        handle: actor.toLowerCase().trim(),
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        coordinates: profile.coordinates,
        categories: profile.categories,
        avatar: profile.avatar,
        avatar_image: profile.avatarImage || "",
        cover_image: profile.coverImage || "",
        cover_position: profile.coverPosition ?? 50,
        color: profile.color,
        twitter: profile.twitter || "",
        website: profile.website || "",
        video_url: profile.videoUrl || "",
        instagram: profile.instagram || "",
        spotify: profile.spotify || "",
        snipverse: profile.snipverse || "",
        facebook: profile.facebook || "",
        kick: profile.kick || "",
        rumble: profile.rumble || "",
        twitch: profile.twitch || "",
        tiktok: profile.tiktok || "",
        youtube_live: profile.youtubeLive || "",
        instagram_live: profile.instagramLive || "",
        is_member: profile.isMember ?? true
      }, { onConflict: 'handle' });

    if (upsertError) {
      throw upsertError;
    }

    console.log(`[update-profile] Database write completed successfully for @${actor}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("[update-profile] Critical Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})