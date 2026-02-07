import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();

    if (!phone || !code || typeof code !== "string" || code.length !== 6) {
      return new Response(
        JSON.stringify({ error: "Phone and 6-digit code are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find valid OTP
    const { data: otpRow, error: fetchError } = await supabaseAdmin
      .from("phone_otps")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !otpRow) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired code" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark OTP as verified
    await supabaseAdmin
      .from("phone_otps")
      .update({ verified: true })
      .eq("id", otpRow.id);

    // Clean up all OTPs for this phone
    await supabaseAdmin
      .from("phone_otps")
      .delete()
      .eq("phone", phone);

    // Find or create user by phone
    const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers();
    let userId: string;
    let isNew = false;

    const existingUser = existingUsers?.find((u: any) => u.phone === phone);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user with phone
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone,
        phone_confirm: true,
        user_metadata: { display_name: phone },
      });

      if (createError || !newUser.user) {
        console.error("Create user error:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create account" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      userId = newUser.user.id;
      isNew = true;

      // Create customer role for new user
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: "customer" },
        { onConflict: "user_id" }
      );
    }

    // Generate a session token via admin
    // We use generateLink with magiclink type to get a session
    // But since we need a direct session, let's use a custom approach
    // Sign the user in by generating an invite link that auto-confirms
    
    // Actually the cleanest way: use admin to get a session directly
    // Supabase doesn't have a direct "create session" admin API, 
    // so we generate a magic link and extract the token
    
    // For phone users, the best approach is to use Supabase's built-in phone sign-in
    // since we've already verified the OTP ourselves
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: `phone_${phone.replace(/\+/g, "")}@auth.local`,
    });

    // Return the verification_token so the client can exchange it
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        is_new: isNew,
        // The client will need to use verifyOtp with the token_hash
        token_hash: signInData?.properties?.hashed_token,
        redirect_url: signInData?.properties?.action_link,
      }),
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
