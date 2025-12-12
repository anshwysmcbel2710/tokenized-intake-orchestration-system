<h1>🏷️ Project Title</h1> <p><strong>Secure Intake Automation Platform — tokenized-data-capture-system</strong></p>

<h2>🧾 Executive Summary</h2>
<p>
  This report documents the repository build of a production-oriented custom URL confirmation form built with Next.js + TypeScript.
  The front-end UI collects structured university confirmation data and files, uploads files to Supabase Storage (when provided), and submits a JSON payload to an n8n webhook for downstream processing (persisting to Supabase Postgres and starting automation workflows).
  The implementation enforces tokenized invite links, multi-select pill UI for event/time/level selections, and a consistent visual hierarchy (global CSS updates).
</p>

<h2>🧩 Project Overview</h2>
<p class="small">
  Source files provided: Next.js app folder with a confirm/[token] route, UI components (Form.tsx, FileUpload.tsx), global styling (globals.css),
  Supabase client wrapper (lib/supabaseClient.ts), and a server action for uploads (app/actions/uploadFile.ts). The form uses a token passed in the URL and posts a structured JSON payload to an n8n webhook endpoint (env: NEXT_PUBLIC_N8N_WEBHOOK_URL).
</p>

<h2>🎯 Objectives & Goals</h2>
<ul>
  <li>Provide a secure, tokenized custom URL form for universities to confirm participation in events.</li>
  <li>Capture structured data including multi-select fields (levels, events, time slots), contact information, optional uploads, and deposit link.</li>
  <li>Upload files directly to Supabase Storage when provided; otherwise accept pasted external links.</li>
  <li>Send a complete JSON payload to an n8n webhook for reliable downstream processing and database persistence.</li>
  <li>Maintain clear UI visual hierarchy and accessible, reusable components.</li>
</ul>

<h2>✅ Acceptance Criteria</h2>
<ul>
  <li>Form accessible on route confirm/{'{token}'} and uses token value in payload.</li>
  <li>Multi-select pill UI retains visible options; clicking toggles state and displays a check + color highlight.</li>
  <li>File upload card allows drag & drop and clicking to browse; files uploaded to Supabase Storage (public URL returned) when selected.</li>
  <li>If user pastes a link instead of uploading, no upload occurs; the provided link is included in payload.</li>
  <li>Payload includes token, token_status, confirmed_from, confirmed_at (timestamptz), client metadata, and all form fields described in project notes.</li>
  <li>Form submits to the n8n webhook endpoint (env var present).</li>
  <li>Global CSS enforces proper typography hierarchy between section headings, field labels, and option labels.</li>
</ul>

<h2>💻 Prerequisites</h2>
<ul>
  <li>Node.js (v18+ recommended)</li>
  <li>Yarn or npm</li>
  <li>Vercel account (for deployment)</li>
  <li>Supabase project with a storage bucket configured (NEXT_PUBLIC_SUPABASE_BUCKET)</li>
  <li>n8n webhook endpoint URL (NEXT_PUBLIC_N8N_WEBHOOK_URL)</li>
  <li>Environment variables configured locally or in Vercel</li>
</ul>

<h2>⚙️ Installation & Setup</h2>
<ol>
  <li>Clone repository to local machine.</li>
  <li>Install dependencies: run npm install or yarn install at project root.</li>
  <li>Create .env.local (do not commit) with required environment variables:
    <ul>
      <li>NEXT_PUBLIC_SUPABASE_URL</li>
      <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
      <li>NEXT_PUBLIC_SUPABASE_BUCKET</li>
      <li>NEXT_PUBLIC_N8N_WEBHOOK_URL</li>
    </ul>
  </li>
  <li>Start dev server: npm run dev (Next.js default).</li>
  <li>Open the URL: http://localhost:3000/confirm/{token} — token must be provided in path for form to pick it up.</li>
</ol>

<h2>🔗 API Documentation</h2>
<p class="small">Single outbound integration from the form to the n8n webhook. The application uploads files to Supabase Storage and returns a public file URL which is included in the webhook payload.</p>

<h3>Webhook</h3>
<ul>
  <li>Method: POST</li>
  <li>Endpoint: env var NEXT_PUBLIC_N8N_WEBHOOK_URL</li>
  <li>Content-Type: application/json</li>
  <li>Payload: structured JSON object (see Payload Fields below)</li>
</ul>

<h3>Payload Fields (complete list)</h3>
<ul>
  <li>invite_token — string (token from path)</li>
  <li>token_status — string ("pending" | "confirmed") (expected to be updated in n8n/DB)</li>
  <li>confirmed_from — string ("email" | "whatsapp") — optional origin metadata</li>
  <li>confirmed_at — timestamptz (ISO string)</li>
  <li>name — string|null</li>
  <li>logo_url — string|null (Supabase URL or external link)</li>
  <li>city, state, country — string|null</li>
  <li>representative_name, representative_designation, representative_email, representative_phone_number — string|null</li>
  <li>representative_headshot_url — string|null (Supabase URL or external link)</li>
  <li>submitter_name, submitter_contact — string|null</li>
  <li>multi_event_selection — JSONB (array of strings)</li>
  <li>preferred_time_slots — JSONB (array of strings)</li>
  <li>highlights_or_focus — string|null</li>
  <li>deposit_link — string|null</li>
  <li>remarks — string|null</li>
  <li>attachment_file_url — string|null (Supabase URL or external link)</li>
  <li>additional_documents_list — JSONB (array of URLs) or null</li>
  <li>contact_consent — boolean</li>
  <li>client_metadata — object { user_agent, platform, submitted_at (ISO), ip (nullable) }</li>
  <li>system_metadata — optional object (form_version, source_campaign_id, raw_form_data)</li>
</ul>

<h2>🖥️ UI / Frontend</h2>
<h3>Pages</h3>
<ul>
  <li>/confirm/{'{token}'} — page rendering the confirmation form (Next.js app/router route in confirm/[token]/page.tsx).</li>
</ul>

<h3>Components</h3>
<ul>
  <li>Form.tsx — primary form component; accepts token as prop; manages local state for file objects and multi-select arrays; builds payload and posts to webhook.</li>
  <li>FileUpload.tsx — reusable upload input with drag & drop, preview for images, file validation (size/type), callback onSelect(file) to parent.</li>
</ul>

<h3>Component Props & State Flow</h3>
<ol>
  <li>FileUpload props: label, accept, onSelect(file | null), multiple?, maxSizeMB? — calls onSelect when user picks or removes file.</li>
  <li>Form state pieces:
    <ul>
      <li>logo: File | null — for university_logo (uploaded on submit or uploaded earlier depending on implementation)</li>
      <li>headshot: File | null — representative headshot</li>
      <li>attachment: File | null — brochure/guidelines</li>
      <li>extraDocs: File[] — additional docs</li>
      <li>levelsSelected, eventsSelected, slotsSelected — arrays of strings</li>
      <li>loading, error — form UI state</li>
    </ul>
  </li>
  <li>Network flow:
    <ol>
      <li>Files chosen via FileUpload call onSelect in Form; Form stores File object(s) in state.</li>
      <li>On submit, Form uploads files to Supabase Storage (uploadToSupabase) and collects returned public URLs.</li>
      <li>Form constructs payload (including arrays as JSON), adds metadata, and POSTs to NEXT_PUBLIC_N8N_WEBHOOK_URL.</li>
    </ol>
  </li>
</ol>

<h3>Where to change styles</h3>
<ul>
  <li>globals.css — single source for tokens and component styles (form-input, form-textarea, checkbox-pill, options-grid, refined-upload-card, etc.).</li>
  <li>Form-level classNames (Form.tsx) reference the utility classes/semantic classes defined in globals.css; update font sizes, weight and spacing there for global effects.</li>
</ul>

<h2>🔢 Status Codes</h2>
<ul>
  <li>200 OK — webhook received and returned success (n8n handling success).</li>
  <li>400 Bad Request — missing required fields (client-side validation prevents this for required groups).</li>
  <li>500 Server Error — server action or webhook unreachable; check console & server logs.</li>
</ul>

<h2>🚀 Features</h2>
<ul>
  <li>Tokenized invitation link routing: confirm/[token]</li>
  <li>Multi-select pill UI with accessible button semantics and persistent selection state</li>
  <li>Drag & drop + browse file upload cards with preview for images</li>
  <li>Client-side upload to Supabase Storage (public URL) with fallback to pasted links</li>
  <li>Structured JSON payload to n8n for workflow orchestration and Postgres persistence</li>
  <li>Client metadata capture (user_agent, platform, timestamp)</li>
  <li>Visual hierarchy adjustments via globals.css</li>
</ul>

<h2>🧱 Tech Stack & Architecture</h2>
<ul>
  <li>Front-end: Next.js (app router), TypeScript, React</li>
  <li>Styling: Tailwind utilities + custom CSS in app/globals.css</li>
  <li>Storage: Supabase Storage for file hosting</li>
  <li>Database & orchestration: Supabase Postgres (updated by n8n workflow)</li>
  <li>Automation: n8n webhook endpoint to drive post-confirm workflows</li>
  <li>Deployment: Vercel</li>
</ul>

<h3>ASCII Component Diagram</h3>
<pre class="mono">
  [Browser / University] 
             |
             v
       Next.js (confirm/[token] page)
             |
    +--------+---------+
    | Form.tsx         |
    | FileUpload.tsx   |
    +--------+---------+
             |
 /upload files? -> Supabase Storage (public URL)
             |
             v
      Construct JSON payload
             |
             v
        POST -> n8n Webhook
             |
      n8n workflow -> Update Postgres (Supabase)
</pre>

<h2>🛠️ Workflow & Implementation (Numbered Steps)</h2>
<ol>
  <li>Send invite link (external process): include token parameter per-university pointing to /confirm/{token}.</li>
  <li>User opens /confirm/{token}; Next.js page renders Form and passes token prop to Form component.</li>
  <li>User fills fields and optionally uploads files:
    <ol>
      <li>FileUpload captures file(s) and validates size/type.</li>
      <li>Form stores File objects in state.</li>
    </ol>
  </li>
  <li>On submit:
    <ol>
      <li>Client-side validation ensures required multi-selects are present.</li>
      <li>uploadToSupabase is called for each file (logo, headshot, attachment, additional docs). Each returns public URL.</li>
      <li>Construct payload with token, token_status (expected pending → confirmed on webhook/process), confirmed_at = now (ISO), client metadata, arrays as JSON, and file URLs or pasted external links.</li>
      <li>POST payload to NEXT_PUBLIC_N8N_WEBHOOK_URL.</li>
      <li>Show user success UI and reset form locally.</li>
    </ol>
  </li>
  <li>n8n receives payload and runs conditional logic: if token already confirmed, abort; otherwise persist to Supabase Postgres, set token_status to confirmed, trigger workflow actions (notifications, artwork, reminders).</li>
</ol>

<h2>🧪 Testing & Validation</h2>
<table>
  <thead>
    <tr><th>ID</th><th>Area</th><th>Command</th><th>Expected Output</th><th>Explanation</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>TC-01</td>
      <td>Dev Startup</td>
      <td>npm run dev</td>
      <td>Next dev server listening on port 3000</td>
      <td>Server starts and confirm route available</td>
    </tr>
    <tr>
      <td>TC-02</td>
      <td>Open Form</td>
      <td>Navigate to /confirm/test-token</td>
      <td>Form renders, token is present in payload when submitting</td>
      <td>Token must be included as invite_token in webhook payload</td>
    </tr>
    <tr>
      <td>TC-03</td>
      <td>Multi-select</td>
      <td>Click level/event/time pills</td>
      <td>Pills remain visible with checkmark and color; arrays populated in payload</td>
      <td>UI state binds to levelsSelected, eventsSelected, slotsSelected</td>
    </tr>
    <tr>
      <td>TC-04</td>
      <td>File upload -> Supabase</td>
      <td>Choose image file in FileUpload</td>
      <td>File returned as public URL; payload includes file URL</td>
      <td>uploadToSupabase uploads bytes -> returns public URL</td>
    </tr>
    <tr>
      <td>TC-05</td>
      <td>Pasted link</td>
      <td>Enter external URL in deposit_link or file URL text</td>
      <td>No upload performed; payload contains pasted link</td>
      <td>Form will include the provided link in appropriate field</td>
    </tr>
    <tr>
      <td>TC-06</td>
      <td>Webhook delivery</td>
      <td>Submit form</td>
      <td>HTTP 200 from webhook or debug success</td>
      <td>Verify n8n receives payload</td>
    </tr>
  </tbody>
</table>

<h2>🔍 Validation Summary</h2>
<ul>
  <li>UI selection persistency validated in form state (pills use controlled arrays).</li>
  <li>File upload process verified: FileUpload returns file objects; form uploads to Supabase and collects public URLs.</li>
  <li>Payload structure validated against required fields for n8n workflow.</li>
</ul>

<h2>🧰 Verification Testing Tools & Command Examples</h2>
<ul>
  <li>Local dev: npm run dev</li>
  <li>API test tool: curl -X POST -H "Content-Type: application/json" --data '{"invite_token":"abc","test":true}' https://your-n8n-webhook</li>
  <li>Browser debug: open DevTools → Network → submit form → inspect POST payload to webhook</li>
  <li>Supabase storage: verify uploaded object in Storage bucket UI</li>
</ul>

<h2>🧯 Troubleshooting & Debugging</h2>
<ol>
  <li>Missing env: check console for NEXT_PUBLIC_ missing variables. Validate .env.local presence (not committed).</li>
  <li>TypeScript errors for FileUpload / Form: ensure onSelect signatures in FileUpload and Form state setters align (File vs string URLs). Use consistent types.</li>
  <li>Upload failure: validate bucket name (NEXT_PUBLIC_SUPABASE_BUCKET) and ANON key validity; check storage policies and CORS if needed.</li>
  <li>Webhook unreachable: verify NEXT_PUBLIC_N8N_WEBHOOK_URL and network connectivity; use curl to test endpoint.</li>
</ol>

<h2>🔒 Security & Secrets</h2>
<ul>
  <li>Do NOT commit .env.local to Git. Add .env.local to .gitignore.</li>
  <li>Public ANON keys are used for client upload only. Do not expose service role keys in client code or in public repo.</li>
  <li>Sensitive operations on server-side must run under server-only endpoints or n8n workflows using server/service role secrets stored in n8n/Vercel.</li>
  <li>Vercel environment variables should be set in the project settings; never commit them to source control.</li>
</ul>

<h2>☁️ Deployment (Vercel)</h2>
<ol>
  <li>Create a GitHub repository and push the project (ensure .gitignore contains .env.local).</li>
  <li>Connect repo to Vercel via "Import Project".</li>
  <li>In Vercel Project Settings → Environment Variables, set:
    <ul>
      <li>NEXT_PUBLIC_SUPABASE_URL</li>
      <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
      <li>NEXT_PUBLIC_SUPABASE_BUCKET</li>
      <li>NEXT_PUBLIC_N8N_WEBHOOK_URL</li>
    </ul>
  </li>
  <li>Trigger deployment. Monitor build logs and then test the deployed confirm/{'{token}'} route.</li>
</ol>

<h2>⚡ Quick-Start Cheat Sheet</h2>
<ol>
  <li>Install dependencies: npm install</li>
  <li>Run locally: npm run dev</li>
  <li>Open form: http://localhost:3000/confirm/your-token</li>
  <li>Push to GitHub, connect to Vercel, set env variables, deploy</li>
</ol>

<h2>🧾 Usage Notes</h2>
<ul>
  <li>Token uniqueness and lifecycle management are outside this repo; token must be generated and stored by the invitation sender workflow and present in the university Postgres record.</li>
  <li>n8n should enforce idempotency by checking token_status before proceeding with actions.</li>
  <li>Form treats multi-select fields as arrays; backend must write them as JSONB in Postgres.</li>
</ul>

<h2>🧠 Performance & Optimization</h2>
<ul>
  <li>Large file uploads: client-side validation limits size (default 20 MB). For larger files, use resumable uploads or server-side streaming.</li>
  <li>Defer non-essential uploads until final submit to minimize repeated uploads; or optionally upload immediately (tradeoff: responsiveness vs extra network calls).</li>
  <li>Add caching headers for public assets on Supabase to reduce bandwidth and render latency.</li>
</ul>

<h2>🌟 Enhancements & Features</h2>
<ul>
  <li>Server-side token verification on page render to show a friendly "already confirmed" UI (future improvement).</li>
  <li>Progressive upload indicators per file and abort capabilities.</li>
  <li>More granular token statuses (expired, revoked) in DB and n8n workflow.</li>
</ul>

<h2>🧩 Maintenance & Future Work</h2>
<ul>
  <li>Keep dependency upgrades routine (Next.js, Supabase SDK).</li>
  <li>Review security for file types and sanitize filenames before storing.</li>
  <li>Formalize test suite and CI checks for TypeScript types and linting before deploy.</li>
</ul>

<h2>🏆 Key Achievements</h2>
<ul>
  <li>Completed production-grade tokenized intake form built with Next.js + TypeScript.</li>
  <li>Secure direct client file uploads to Supabase storage implemented.</li>
  <li>Structured JSON payload designed for webhook-driven automation through n8n and Postgres persistence.</li>
  <li>UI accessibility and visual hierarchy aligned with industry standards via globals.css updates.</li>
</ul>

<h2>🧮 High-Level Architecture</h2>
<p class="small">Next.js form collects data → client optionally uploads files to Supabase Storage → constructs JSON payload including file URLs → posts to n8n webhook → n8n updates Supabase Postgres and triggers post-confirm workflows.</p>

<h2>🗂️ Folder Structure (Tree)</h2>
<pre class="mono">
.
├─ .next
├─ app
│  ├─ actions
│  │  └─ uploadFile.ts
│  ├─ confirm
│  │  └─ [token]
│  │     └─ page.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components
│  ├─ FileUpload.tsx
│  └─ Form.tsx
├─ lib
│  └─ supabaseClient.ts
├─ .env.local  (local only; add to .gitignore)
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
└─ tsconfig.json
</pre>

<h2>🧭 How to Demonstrate Live (Exact Commands)</h2>
<ol>
  <li>Install: npm install</li>
  <li>Dev run: npm run dev</li>
  <li>Open in browser: http://localhost:3000/confirm/YOUR_TEST_TOKEN</li>
  <li>Fill the form, attach files, submit; observe network POST to n8n webhook in DevTools.</li>
  <li>To test webhook endpoint separately: curl -X POST -H "Content-Type: application/json" --data '{"invite_token":"test-token","test":true}' YOUR_N8N_WEBHOOK_URL</li>
</ol>

<h2>💡 Summary, Closure & Compliance</h2>
<p>
  This report reflects an exhaustive, implementation-accurate description of the repository and the tokenized custom URL intake flow. It is aligned strictly with the files, configuration, and notes provided. No features were invented beyond described behavior. For production readiness: ensure environment secrets are managed in Vercel, confirm n8n workflows cover idempotency (token existence checks), and run a staging deployment to verify end-to-end file upload, webhook delivery, and Postgres persistence.
</p>

<div class="note">
  <strong>Final notes:</strong> Before publishing to GitHub, add .env.local to .gitignore, verify all TypeScript types for FileUpload/Form onSelect signatures are aligned, set Vercel environment variables, and test with a staging n8n endpoint to confirm idempotent token handling.
</div>
