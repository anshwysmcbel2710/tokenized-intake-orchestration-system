// app/confirm/[token]/page.tsx

import { headers } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DebugConfirmPage({
  params,
  searchParams,
}: {
  params: { token: string } | Promise<{ token: string }>;
  searchParams: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  // Force request-time execution (CRITICAL in Next.js 16)
  headers();

  // Resolve params safely (Next.js 16 may return Promise)
  const resolvedParams =
    params instanceof Promise ? await params : params;

  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams;

  const token = resolvedParams?.token ?? null;

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>🔍 CONFIRM TOKEN — TEMP DEBUG</h1>

      <h2>Expected URL</h2>
      <pre>
        /confirm/123abc
      </pre>

      <h2>Resolved Params</h2>
      <pre>{JSON.stringify(resolvedParams, null, 2)}</pre>

      <h2>Extracted Token</h2>
      <pre>{JSON.stringify({ token }, null, 2)}</pre>

      <h2>Search Params</h2>
      <pre>{JSON.stringify(resolvedSearchParams, null, 2)}</pre>

      <h2>Status</h2>
      {token ? (
        <p style={{ color: "green" }}>✅ Token successfully received</p>
      ) : (
        <p style={{ color: "red" }}>❌ Token NOT received</p>
      )}
    </div>
  );
}
