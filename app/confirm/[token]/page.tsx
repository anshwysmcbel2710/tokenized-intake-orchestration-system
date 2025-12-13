// app/confirm/[token]/page.tsx

export default async function ConfirmPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ token: string }> | { token: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  console.log('=== SERVER SIDE DEBUG ===');
  console.log('Raw params:', params);
  console.log('Type of params:', typeof params);
  console.log('Is Promise?', params instanceof Promise);
  
  let token = null;
  let tokenError = null;
  let resolvedParams = null;
  let resolvedSearchParams = null;
  
  // Try to resolve params
  try {
    if (params instanceof Promise) {
      console.log('Params is a Promise, awaiting...');
      resolvedParams = await params;
      token = resolvedParams?.token;
    } else {
      console.log('Params is NOT a Promise, accessing directly...');
      resolvedParams = params;
      token = params?.token;
    }
    console.log('Resolved params:', resolvedParams);
    console.log('Extracted token:', token);
  } catch (error) {
    tokenError = error;
    console.error('Error resolving params:', error);
  }
  
  // Try to resolve searchParams
  try {
    if (searchParams instanceof Promise) {
      resolvedSearchParams = await searchParams;
    } else {
      resolvedSearchParams = searchParams;
    }
  } catch (error) {
    console.error('Error resolving searchParams:', error);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🔍 RAW ROUTE DEBUG
        </h1>
        
        {/* URL Info */}
        <div className="mb-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">📍 Expected URL</h2>
          <code className="block bg-gray-900 p-3 rounded text-green-400">
            https://tokenized-intake-orchestration-syst.vercel.app/confirm/123abc
          </code>
        </div>

        {/* Token Status */}
        <div className="mb-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">🎯 Token Status</h2>
          {token ? (
            <div>
              <p className="text-green-400 text-lg mb-2">✅ Token Found!</p>
              <code className="block bg-gray-900 p-3 rounded text-green-400 text-xl">
                {token}
              </code>
            </div>
          ) : (
            <div>
              <p className="text-red-400 text-lg mb-2">❌ Token NOT Found</p>
              <p className="text-gray-400">This is the problem we're debugging</p>
            </div>
          )}
        </div>

        {/* Params Debug */}
        <div className="mb-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">📦 Params</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400 mb-1">Raw Type:</p>
              <code className="block bg-gray-900 p-2 rounded text-blue-400">
                {typeof params} {params instanceof Promise ? '(Promise)' : '(Object)'}
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Resolved Value:</p>
              <pre className="bg-gray-900 p-3 rounded overflow-auto text-sm">
                {JSON.stringify(resolvedParams, null, 2)}
              </pre>
            </div>
            {tokenError && (
              <div>
                <p className="text-sm text-red-400 mb-1">Error:</p>
                <pre className="bg-red-900 p-3 rounded overflow-auto text-sm">
                  {String(tokenError)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Search Params Debug */}
        <div className="mb-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">🔎 Search Params</h2>
          <pre className="bg-gray-900 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(resolvedSearchParams, null, 2)}
          </pre>
        </div>

        {/* File Structure Check */}
        <div className="mb-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">📂 File Location Check</h2>
          <div className="space-y-2">
            <p className="text-sm">✅ This file should be at:</p>
            <code className="block bg-gray-900 p-2 rounded text-green-400">
              app/confirm/[token]/page.tsx
            </code>
            <p className="text-sm mt-3">❌ NOT at:</p>
            <code className="block bg-gray-900 p-2 rounded text-red-400">
              app/confirm/page.tsx
            </code>
          </div>
        </div>

        {/* Possible Issues */}
        <div className="mb-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">⚠️ Common Issues</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">1️⃣</span>
              <span>File is in wrong location (not in [token] folder)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2️⃣</span>
              <span>Vercel deployment didn't pick up file structure changes</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3️⃣</span>
              <span>Build cache issue - need to redeploy</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4️⃣</span>
              <span>next.config.js has rewrites interfering with routes</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">5️⃣</span>
              <span>TypeScript/build error preventing dynamic route</span>
            </li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🔧 Next Steps</h2>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Check server logs in Vercel dashboard</li>
            <li>Verify file is at: app/confirm/[token]/page.tsx</li>
            <li>Check build logs for errors</li>
            <li>Force redeploy on Vercel</li>
            <li>Test locally with: npm run dev</li>
          </ol>
        </div>

        {/* Environment Info */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg text-xs text-gray-400">
          <p>Environment: {process.env.NODE_ENV}</p>
          <p>Next.js Version: Check package.json</p>
          <p>Deployment: Vercel</p>
        </div>
      </div>
    </div>
  );
}

// Add this to help with debugging
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';