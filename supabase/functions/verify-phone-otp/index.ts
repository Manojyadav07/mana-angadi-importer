import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function phoneToEmail(phone: string): string {
  return `phone_${phone.replace(/\+/g, "")}@auth.local`;
}

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

    const fakeEmail = phoneToEmail(phone);
    let userId: string;
    let isNew = false;

    // Find existing user by the fake email (primary identifier)
    const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = allUsers?.find(
      (u: any) => u.email === fakeEmail || u.phone === phone
    );

    if (existingUser) {
      userId = existingUser.id;

      // Ensure the user has the fake email set (for magic link to work)
      if (!existingUser.email || existingUser.email !== fakeEmail) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          email: fakeEmail,
          email_confirm: true,
        });
      }
    } else {
      // Create new user with fake email as primary + phone
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: fakeEmail,
        email_confirm: true,
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

    // Generate magic link for the fake email – user exists with this email so it works
    const { data: signInData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: fakeEmail,
    });

    if (linkError || !signInData?.properties?.hashed_token) {
      console.error("Generate link error:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        is_new: isNew,
        token_hash: signInData.properties.hashed_token,
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
