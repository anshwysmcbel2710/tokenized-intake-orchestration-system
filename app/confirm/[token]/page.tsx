export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function Page(props: any) {
  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>RAW ROUTE DEBUG</h1>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}
