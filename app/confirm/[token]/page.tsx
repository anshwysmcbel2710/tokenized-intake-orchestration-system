// app/confirm/[token]/page.tsx
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SERVER-ONLY client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function Page({
  params,
}: {
  params: { token: string };
}) {
  const token = params?.token?.trim();

  // 1️⃣ URL check
  if (!token) {
    return (
      <div style={{ padding: 40, color: "red" }}>
        ❌ Missing token in URL
      </div>
    );
  }

  // 2️⃣ Query your EXACT table
  const { data, error } = await supabase
    .from("university_participation") // ✅ your real table
    .select("invite_token, confirmed_at")
    .eq("invite_token", token)
    .single();

  // 3️⃣ Render raw debug output
  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>CONFIRM TOKEN – DEBUG MODE</h1>

      <h3>URL TOKEN</h3>
      <pre>{token}</pre>

      <h3>Supabase Error</h3>
      <pre>{JSON.stringify(error, null, 2)}</pre>

      <h3>Database Row</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <h3>Derived Status</h3>
      <pre>
        {!data
          ? "❌ TOKEN NOT FOUND"
          : data.confirmed_at
          ? "⚠️ TOKEN ALREADY CONFIRMED"
          : "✅ TOKEN VALID & PENDING"}
      </pre>
    </div>
  );
}
