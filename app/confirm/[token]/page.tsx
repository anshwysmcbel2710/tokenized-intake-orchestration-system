// app/confirm/[token]/page.tsx

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: Record<string, string>;
}) {
  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>RAW ROUTE DEBUG</h1>

      <h3>Params</h3>
      <pre>{JSON.stringify(params, null, 2)}</pre>

      <h3>Search Params</h3>
      <pre>{JSON.stringify(searchParams, null, 2)}</pre>
    </div>
  );
}
