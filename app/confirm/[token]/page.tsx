// app/confirm/[token]/page.tsx

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import Form from "@/components/Form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  params,
}: {
  params: { token: string } | Promise<{ token: string }>;
}) {
  // Ensure request-time execution (important on Vercel)
  headers();

  // Resolve params safely (Next.js 16 compatibility)
  const resolvedParams =
    params instanceof Promise ? await params : params;

  const token = resolvedParams?.token?.trim();

  // 1️⃣ Basic token presence check
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        Invalid or missing confirmation link.
      </div>
    );
  }

  // 2️⃣ Environment variable safety check
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase environment variables");
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        Server configuration error. Please contact support.
      </div>
    );
  }

  // 3️⃣ Create Supabase client (SERVER ONLY)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 4️⃣ Validate token against database
  const { data, error } = await supabase
    .from("university_participation")
    .select("invite_token, confirmed_at")
    .eq("invite_token", token)
    .single();

  // Token not found
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        Invalid or expired confirmation link.
      </div>
    );
  }

  // Token already used
  if (data.confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-600 text-lg">
        This confirmation link has already been used.
      </div>
    );
  }

  // 5️⃣ Token is valid → render the form
  return (
    <div className="min-h-screen bg-gray-50">
      <Form token={token} />
    </div>
  );
}
