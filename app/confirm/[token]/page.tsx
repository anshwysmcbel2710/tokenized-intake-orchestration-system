// app/confirm/[token]/page.tsx
import Form from "@/components/Form";
import { createClient } from "@supabase/supabase-js";

export default async function Page({ params }: { params: { token: string } }) {
  const token = params.token;

  if (!token || token.trim() === "") {
    return (
      <div className="text-center text-red-600 text-xl py-10">
        Invalid or missing invite token.
      </div>
    );
  }

  // Initialize Supabase client (server-side)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Validate token against your database
  const { data, error } = await supabase
    .from("university_participation")
    .select("invite_token")
    .eq("invite_token", token)
    .maybeSingle(); // returns null if no row found

  if (!data || error) {
    return (
      <div className="text-center text-red-600 text-xl py-10">
        Invalid or expired invite token. Please use the official confirmation link again.
      </div>
    );
  }

  // Token is valid → show the form
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Form token={token} />
    </div>
  );
}
