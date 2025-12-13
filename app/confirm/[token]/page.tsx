// app/confirm/[token]/page.tsx
export const runtime = "nodejs";

export default async function Page(props: any) {
  console.log("DEBUG PROPS:", props);

  return (
    <div style={{ padding: 40 }}>
      <h1>DEBUG MODE</h1>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}
