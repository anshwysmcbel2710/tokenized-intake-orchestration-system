// app/components/Form.tsx
"use client";

import React, { useState } from "react";
import FileUpload from "@/components/FileUpload";
import { createClient } from "@supabase/supabase-js";

interface FormProps {
  token: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Form({ token }: FormProps) {
  const [loading, setLoading] = useState(false);

  // FILE OBJECTS (if you need raw files)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [extraDocsFiles, setExtraDocsFiles] = useState<File[]>([]);

  // UPLOADED URLS (returned from immediate upload or pasted links)
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [headshotUrl, setHeadshotUrl] = useState<string | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [extraDocUrls, setExtraDocUrls] = useState<string[]>([]);

  // Multi-select states
  const [levelsSelected, setLevelsSelected] = useState<string[]>([]);
  const [eventsSelected, setEventsSelected] = useState<string[]>([]);
  const [slotsSelected, setSlotsSelected] = useState<string[]>([]);

  // Validation / feedback
  const [error, setError] = useState<string | null>(null);

  const LEVELS = ["Diploma", "Certificate", "Bachelors", "Masters"];
  const EVENTS = ["Webinar", "In-person Fair", "Online Fair"];
  const SLOTS = ["10 AM - 11 AM", "11 AM - 12 PM", "2 PM - 3 PM"];

  // Toggle helper (immutable)
  function toggleItem(
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) {
    setList((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  /* ------------------------------------------------------
     FileUpload wrapper handlers
     Accept the union emitted by FileUpload: File | File[] | string | null
     and update both file state and uploaded-URL state accordingly.
  ------------------------------------------------------ */
  function handleLogoSelect(payload: File | File[] | string | null) {
    if (!payload) {
      setLogoFile(null);
      setLogoUrl(null);
      return;
    }
    if (typeof payload === "string") {
      setLogoUrl(payload);
      setLogoFile(null);
    } else if (Array.isArray(payload)) {
      // take first for single-file fields
      setLogoFile(payload[0] ?? null);
      setLogoUrl(null);
    } else {
      setLogoFile(payload);
      setLogoUrl(null);
    }
  }

  function handleHeadshotSelect(payload: File | File[] | string | null) {
    if (!payload) {
      setHeadshotFile(null);
      setHeadshotUrl(null);
      return;
    }
    if (typeof payload === "string") {
      setHeadshotUrl(payload);
      setHeadshotFile(null);
    } else if (Array.isArray(payload)) {
      setHeadshotFile(payload[0] ?? null);
      setHeadshotUrl(null);
    } else {
      setHeadshotFile(payload);
      setHeadshotUrl(null);
    }
  }

  function handleAttachmentSelect(payload: File | File[] | string | null) {
    if (!payload) {
      setAttachmentFile(null);
      setAttachmentUrl(null);
      return;
    }
    if (typeof payload === "string") {
      setAttachmentUrl(payload);
      setAttachmentFile(null);
    } else if (Array.isArray(payload)) {
      setAttachmentFile(payload[0] ?? null);
      setAttachmentUrl(null);
    } else {
      setAttachmentFile(payload);
      setAttachmentUrl(null);
    }
  }

  function handleExtraDocSelect(payload: File | File[] | string | null) {
    if (!payload) return;
    if (typeof payload === "string") {
      setExtraDocUrls((prev) => [...prev, payload]);
    } else if (Array.isArray(payload)) {
      // convert to files and/or extract multiple
      setExtraDocsFiles((prev) => [...prev, ...payload]);
    } else {
      setExtraDocsFiles((prev) => [...prev, payload]);
    }
  }

  /* ------------------------------------------------------
     Optionally: helper to upload files from Form (if you prefer Form to upload).
     (You already have uploadToSupabase below used during submit.)
     Keep it if you want programmatic upload from Form.
  ------------------------------------------------------ */
  async function uploadToSupabase(file: File | null, path: string) {
    if (!file) return null;

    const filePath = `${path}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
      .upload(filePath, file);

    if (error) throw error;

    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${process.env.NEXT_PUBLIC_SUPABASE_BUCKET}/${data.path}`;
  }

  /* ------------------------------------------------------
     Submit Handler
  ------------------------------------------------------ */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (levelsSelected.length === 0) {
      setError("Please choose at least one level you are recruiting for.");
      return;
    }
    if (eventsSelected.length === 0) {
      setError("Please choose at least one event you will attend.");
      return;
    }

    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const folder = `invites/${token}`;

    try {
      // If you allowed immediate upload in FileUpload and got URLs, prefer those.
      // For any file objects present but not uploaded via FileUpload, upload them now.
      const logoPublic = logoUrl ?? (logoFile ? await uploadToSupabase(logoFile, folder) : null);
      const headshotPublic = headshotUrl ?? (headshotFile ? await uploadToSupabase(headshotFile, folder) : null);
      const attachmentPublic = attachmentUrl ?? (attachmentFile ? await uploadToSupabase(attachmentFile, folder) : null);

      // Upload any extraDoc file objects that haven't been uploaded yet
      const extraDocPublics: string[] = [...extraDocUrls]; // start with any URLs already present
      for (const f of extraDocsFiles) {
        const url = await uploadToSupabase(f, folder);
        if (url) extraDocPublics.push(url);
      }

      const payload = {
        invite_token: token,
        token_status: "confirmed", // when a university submits
        confirmed_from: (fd.get("confirmed_from") as string) || "unknown", // optionally set via query or form
        confirmed_at: new Date().toISOString(),

        university_name: fd.get("university_name") ?? null,
        university_logo: logoPublic,

        city: fd.get("city") ?? null,
        state: fd.get("state") ?? null,
        country: fd.get("country") ?? null,

        representative_name: fd.get("rep_name") ?? null,
        representative_designation: fd.get("rep_designation") ?? null,
        representative_email: fd.get("rep_email") ?? null,
        representative_phone_number: fd.get("rep_phone") ?? null,
        representative_headshot_file: headshotPublic ?? null,

        submitter_name: fd.get("submitter_name") ?? null,
        submitter_contact: fd.get("submitter_contact") ?? null,

        // JSONB arrays — use the arrays from state (strings)
        levels_recruiting_for: levelsSelected,
        multi_event_selection: eventsSelected,
        preferred_time_slots: slotsSelected,

        highlights_or_focus: (fd.get("highlights") as string) ?? null,
        deposit_link: (fd.get("deposit_link") as string) ?? null,
        remarks: (fd.get("remarks") as string) ?? null,

        attachment_file: attachmentPublic ?? null,
        additional_documents_list: extraDocPublics.length ? extraDocPublics : null,

        contact_consent: fd.get("consent") === "on" || fd.get("consent") === "true",

        // required meta
        client_metadata: {
          submitted_at: new Date().toISOString(),
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          platform: typeof navigator !== "undefined" ? navigator.platform : null,
          ip: null, // n8n can attempt to populate IP from incoming request (preferred)
        },

        system_metadata: {
          form_version: "v1",
          source_campaign_id: fd.get("source_campaign_id") ?? null,
          raw_form_data: null,
        },
      };

      await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert("Confirmation submitted successfully.");
      form.reset();

      // clear local state
      setLevelsSelected([]);
      setEventsSelected([]);
      setSlotsSelected([]);
      setLogoFile(null);
      setLogoUrl(null);
      setHeadshotFile(null);
      setHeadshotUrl(null);
      setAttachmentFile(null);
      setAttachmentUrl(null);
      setExtraDocsFiles([]);
      setExtraDocUrls([]);
    } catch (err) {
      console.error(err);
      setError("Failed to submit the form. Try again or contact admin.");
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------
     Pill component (reusable)
  ------------------------------------------------------ */
  function Pill({
    label,
    active,
    onClick,
    name,
    value,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
    name?: string;
    value?: string;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`checkbox-pill ${active ? "checked" : ""}`}
        onMouseDown={(e) => e.preventDefault()}
      >
        <span aria-hidden>
          <svg
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check-icon"
            style={{ width: 14, height: 10 }}
            aria-hidden
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>

        <span className="pill-label">{label}</span>

        {active && name && value ? <input type="hidden" name={`${name}[]`} value={value} /> : null}
      </button>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="form-container bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8">
          University Confirmation Form
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          {/* UNIVERSITY */}
          <section className="space-y-4">
            <h2 className="section-title">University Information</h2>

            <input name="university_name" placeholder="University Name" required className="form-input" />

            <FileUpload label="University Logo (optional)" accept="image/*" onSelect={handleLogoSelect} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input name="city" placeholder="City" required className="form-input" />
              <input name="state" placeholder="State" required className="form-input" />
              <input name="country" placeholder="Country" required className="form-input" />
            </div>
          </section>

          {/* REPRESENTATIVE */}
          <section className="space-y-4">
            <h2 className="section-title">Representative Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="rep_name" placeholder="Representative Name" required className="form-input" />
              <input name="rep_designation" placeholder="Designation" required className="form-input" />
              <input name="rep_email" placeholder="Email" type="email" required className="form-input" />
              <input name="rep_phone" placeholder="Phone Number" required className="form-input" />
            </div>

            <FileUpload label="Representative Headshot (optional)" accept="image/*" onSelect={handleHeadshotSelect} />
          </section>

          {/* SUBMITTER */}
          <section className="space-y-4">
            <h2 className="section-title">Submitter Details (optional)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="submitter_name" placeholder="Submitter Name" className="form-input" />
              <input name="submitter_contact" placeholder="Submitter Contact" className="form-input" />
            </div>
          </section>

          {/* RECRUITMENT */}
          <section className="space-y-6">
            <h2 className="section-title">Recruitment Information</h2>

            {/* Levels */}
            <div>
              <p className="option-group-label font-semibold text-[0.96rem]">Levels Recruiting For *</p>
              <div className="options-grid mt-3">
                {LEVELS.map((lvl) => (
                  <Pill
                    key={lvl}
                    label={lvl}
                    active={levelsSelected.includes(lvl)}
                    onClick={() => toggleItem(setLevelsSelected, lvl)}
                    name="levels_recruiting_for"
                    value={lvl}
                  />
                ))}
              </div>
            </div>

            {/* Events */}
            <div>
              <p className="option-group-label font-semibold text-[0.96rem]">Events You Will Attend *</p>
              <div className="options-grid mt-3">
                {EVENTS.map((ev) => (
                  <Pill
                    key={ev}
                    label={ev}
                    active={eventsSelected.includes(ev)}
                    onClick={() => toggleItem(setEventsSelected, ev)}
                    name="multi_event_selection"
                    value={ev}
                  />
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <p className="option-group-label font-semibold text-[0.96rem]">Preferred Time Slots (optional)</p>
              <div className="options-grid mt-3">
                {SLOTS.map((slot) => (
                  <Pill
                    key={slot}
                    label={slot}
                    active={slotsSelected.includes(slot)}
                    onClick={() => toggleItem(setSlotsSelected, slot)}
                    name="preferred_time_slots"
                    value={slot}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* NOTES */}
          <section className="space-y-4">
            <label className="block font-semibold text-gray-800">Highlights</label>
            <textarea
              name="highlights"
              placeholder="Paste your focus areas"
              className="form-textarea"
            />

            <label className="block font-semibold text-gray-800">Deposit Link</label>
            <input
              name="deposit_link"
              placeholder="Paste your official application or deposit payment link"
              className="form-input"
            />
          </section>

          {/* DOCUMENTS */}
          <section className="space-y-4">
            <h2 className="section-title">Documents</h2>

            <FileUpload
              label="Upload Brochure / Guidelines"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
              onSelect={handleAttachmentSelect}
            />

            <FileUpload
              label="Upload Additional Documents (you can upload multiple one-by-one)"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,image/*"
              multiple
              onSelect={handleExtraDocSelect}
            />
          </section>

          <label className="block font-semibold text-gray-800">Remarks</label>
          <textarea
            name="remarks"
            placeholder="Paste your additional remarks"
            className="form-textarea"
          />

          {/* consent */}
          <label className="flex items-start gap-3 text-gray-700">
            <input type="checkbox" name="consent" className="h-4 w-4 accent-brand-primary mt-1" required />
            <span className="text-sm">I consent to communication related to this event.</span>
          </label>

          {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

          <button type="submit" disabled={loading} className="modern-btn-primary w-full py-4 text-lg">
            {loading ? "Submitting..." : "Submit Confirmation"}
          </button>
        </form>
      </div>
    </div>
  );
}
