// app/confirm/[token]/page.tsx

import { headers } from "next/headers";

export const runtime = "nodejs";

export default function Page({
  params,
}: {
  params: { token: string };
}) {
  // 🔥 THIS LINE FORCES REQUEST-TIME EXECUTION
  headers();

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>RAW ROUTE DEBUG</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
}
