// app/confirm/[token]/page.tsx

export const runtime = "nodejs"; // REQUIRED for service role access

import Form from "@/components/Form";
import { createClient } from "@supabase/supabase-js";

interface PageProps {
  params: {
    token: string;
  };
}

export default async function Page({ params }: PageProps) {
  const token = params?.token?.trim();

  // 1️⃣ Basic validation (URL-level)
  if (!token) {
    return (
      <div className="text-center text-red-600 text-xl py-10">
        Invalid or missing invite token.
      </div>
    );
  }

  // 2️⃣ SERVER-ONLY Supabase client (SERVICE ROLE — bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ MUST BE SERVICE ROLE
  );

  // 3️⃣ Validate token against DB
  const { data, error } = await supabase
    .from("university_participation")
    .select("invite_token")
    .eq("invite_token", token)
    .maybeSingle();

  // 4️⃣ Invalid / expired token
  if (error || !data) {
    console.error("Token validation failed:", error);
    return (
      <div className="text-center text-red-600 text-xl py-10">
        Invalid or expired invite token. Please use the official confirmation link again.
      </div>
    );
  }

  // 5️⃣ Token is valid → render form
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Form token={token} />
    </div>
  );
}
