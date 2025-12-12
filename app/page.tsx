export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-semibold mb-4">EEC Custom URL Form</h1>

      <p className="text-gray-600 max-w-xl">
        This is the main homepage. Universities will not use this page.
        They will receive a unique confirmation link containing their
        <span className="font-medium"> invite token</span>.
      </p>

      <div className="mt-6 p-4 bg-white rounded-lg shadow w-full max-w-md">
        <p className="text-gray-700 font-medium mb-2">Test a confirmation link:</p>
        <code className="bg-gray-100 px-3 py-2 rounded block">
          /confirm/&lt;your-invite-token&gt;
        </code>
        <p className="text-sm text-gray-500 mt-2">
          Example: <span className="font-mono">/confirm/abc123xyz</span>
        </p>
      </div>
    </div>
  );
}
