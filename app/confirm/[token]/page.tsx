// app/confirm/[token]/page.tsx

import Form from "@/components/Form";
import { createClient } from "@supabase/supabase-js";

interface PageProps {
  params: {
    token: string;
  };
}

export default async function Page({ params }: PageProps) {
  const token = params?.token?.trim();

  // 1️⃣ Basic route-level validation
  if (!token) {
    return (
      <div className="text-center text-red-600 text-xl py-10">
        Invalid or missing invite token.
      </div>
    );
  }

  // 2️⃣ Create Supabase server client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 3️⃣ Validate token against DB
  const { data, error } = await supabase
    .from("university_participation")
    .select("invite_token")
    .eq("invite_token", token)
    .limit(1)
    .maybeSingle();

  // 4️⃣ Handle invalid / expired token
  if (error || !data) {
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
