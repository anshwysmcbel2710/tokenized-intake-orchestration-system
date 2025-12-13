import React from 'react';

// 1. Define the props structure to ensure TypeScript knows 'params' contains 'token'
interface ConfirmPageProps {
  // The key 'token' must match the folder name: [token]
  params: {
    token: string;
  };
  // We can also include 'searchParams' for full debug context, 
  // though they are currently empty based on your URL.
  searchParams: { [key: string]: string | string[] | undefined };
}

// 2. The component receives 'params' and 'searchParams' as props
export default function ConfirmPage({ params, searchParams }: ConfirmPageProps) {
  // 3. The 'token' is available directly from the 'params' object
  const { token } = params;

  // IMPORTANT: For debugging the RAW ROUTE DEBUG output you saw in the browser,
  // we will display the contents of 'params' and 'searchParams'.

  return (
    <main style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Route Parameter Debugging Output</h2>
      
      {/* --- This section directly reproduces the debug output you were seeing --- */}
      <div style={{ border: '1px solid #000', padding: '15px', backgroundColor: '#f4f4f4' }}>
        <p>RAW ROUTE DEBUG</p>
        
        <p>Params</p>
        {/* We stringify the 'params' object which now contains the token */}
        <pre>
          {JSON.stringify(params, null, 2)}
        </pre>
        
        <p>Search Params</p>
        {/* We stringify the 'searchParams' (the query string, like ?key=value) */}
        <pre>
          {JSON.stringify(searchParams, null, 2)}
        </pre>
      </div>
      
      {/* --- Confirmation that the parameter is captured --- */}
      <p style={{ marginTop: '20px' }}>
        **Successfully Captured Token:** <strong>{token}</strong>
      </p>
    </main>
  );
}