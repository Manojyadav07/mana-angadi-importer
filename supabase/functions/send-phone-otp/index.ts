import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateOtp(): string {
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => (b % 10).toString()).join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string" || !/^\+\d{10,15}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number. Use E.164 format (e.g. +91xxxxxxxxxx)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

    if (!accountSid || !authToken || !messagingServiceSid) {
      return new Response(
        JSON.stringify({ error: "SMS provider not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Clean up expired OTPs for this phone
    await supabaseAdmin
      .from("phone_otps")
      .delete()
      .eq("phone", phone)
      .lt("expires_at", new Date().toISOString());

    // Rate limit: max 1 OTP per 45 seconds
    const { data: recentOtp } = await supabaseAdmin
      .from("phone_otps")
      .select("created_at")
      .eq("phone", phone)
      .eq("verified", false)
      .gte("created_at", new Date(Date.now() - 45000).toISOString())
      .limit(1)
      .maybeSingle();

    if (recentOtp) {
      return new Response(
        JSON.stringify({ error: "Please wait before requesting another code" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store OTP
    const { error: insertError } = await supabaseAdmin
      .from("phone_otps")
      .insert({ phone, code, expires_at: expiresAt });

    if (insertError) {
      console.error("OTP insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams({
      To: phone,
      MessagingServiceSid: messagingServiceSid,
      Body: `Your verification code is: ${code}. It expires in 10 minutes.`,
    });

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error("Twilio error:", twilioData);
      // Clean up the OTP we just stored
      await supabaseAdmin.from("phone_otps").delete().eq("phone", phone).eq("code", code);
      return new Response(
        JSON.stringify({ error: "Failed to send SMS" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
