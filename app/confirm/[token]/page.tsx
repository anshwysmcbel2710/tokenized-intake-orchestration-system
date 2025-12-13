// app/confirm/[token]/page.tsx

export const runtime = "nodejs";

import Form from "@/components/Form";
import { createClient } from "@supabase/supabase-js";

interface PageProps {
  params: {
    token: string;
  };
}

export default async function Page({ params }: PageProps) {
  const token = params?.token?.trim();

  // 1️⃣ URL-level validation
  if (!token) {
    return (
      <div className="text-center text-red-600 text-xl py-10">
        Invalid or missing invite token.
      </div>
    );
  }

  // 2️⃣ Environment safety check
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase environment variables");
    return (
      <div className="text-center text-red-600 text-xl py-10">
        Server configuration error. Please contact support.
      </div>
    );
  }

  // 3️⃣ Server-side Supabase client (SERVICE ROLE)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 4️⃣ Token validation
  const { data, error } = await supabase
    .from("university_participation")
    .select("invite_token")
    .eq("invite_token", token)
    .single(); // 🔴 correct for unique tokens

  if (error || !data) {
    console.error("Token validation failed:", error);
    return (
      <div className="text-center text-red-600 text-xl py-10">
        Invalid or expired invite token. Please use the official confirmation link again.
      </div>
    );
  }

  // 5️⃣ Token valid → render form
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Form token={token} />
    </div>
  );
}
