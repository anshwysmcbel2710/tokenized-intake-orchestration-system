// app/confirm/[token]/page.tsx

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // ✅ THIS IS THE FIX

export default async function Page({
  params,
}: {
  params: { token: string };
}) {
  return (
    <div style={{ padding: 40 }}>
      <h1>ROUTE DEBUG</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
}
