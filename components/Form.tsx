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
  if (!token) {
    console.error("ERROR: Missing token in Form component");
    return (
      <div className="max-w-3xl mx-auto py-10 text-center text-red-600 font-semibold">
        Invalid or missing invite token. Please use the official confirmation link again.
      </div>
    );
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FILE OBJECTS
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [extraDocsFiles, setExtraDocsFiles] = useState<File[]>([]);

  // URLs (if pasted or provided by FileUpload)
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [headshotUrl, setHeadshotUrl] = useState<string | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [extraDocUrls, setExtraDocUrls] = useState<string[]>([]);

  // Multi-select states
  const [levelsSelected, setLevelsSelected] = useState<string[]>([]);
  const [eventsSelected, setEventsSelected] = useState<string[]>([]);
  const [slotsSelected, setSlotsSelected] = useState<string[]>([]);

  const LEVELS = ["Diploma", "Certificate", "Bachelors", "Masters"];
  const EVENTS = ["Webinar", "In-person Fair", "Online Fair"];
  const SLOTS = ["10 AM - 11 AM", "11 AM - 12 PM", "2 PM - 3 PM"];

  // Toggle helper
  function toggleItem(setter: any, value: string) {
    setter((prev: string[]) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  }

  /* ----------------------------------------------------------
     File selection handlers
  ---------------------------------------------------------- */
  function processFileInput(
    payload: File | File[] | string | null,
    setFile: any,
    setUrl: any
  ) {
    if (!payload) return setFile(null), setUrl(null);

    if (typeof payload === "string") {
      setUrl(payload);
      setFile(null);
      return;
    }

    if (Array.isArray(payload)) {
      setFile(payload[0] ?? null);
      setUrl(null);
      return;
    }

    setFile(payload);
    setUrl(null);
  }

  const handleLogoSelect = (p: any) => processFileInput(p, setLogoFile, setLogoUrl);
  const handleHeadshotSelect = (p: any) => processFileInput(p, setHeadshotFile, setHeadshotUrl);
  const handleAttachmentSelect = (p: any) => processFileInput(p, setAttachmentFile, setAttachmentUrl);

  function handleExtraDocSelect(payload: any) {
    if (!payload) return;

    if (typeof payload === "string") {
      return setExtraDocUrls((prev) => [...prev, payload]);
    }

    if (Array.isArray(payload)) {
      return setExtraDocsFiles((prev) => [...prev, ...payload]);
    }

    setExtraDocsFiles((prev) => [...prev, payload]);
  }

  /* ----------------------------------------------------------
     Upload helper
  ---------------------------------------------------------- */
  async function uploadToSupabase(file: File | null, path: string) {
    if (!file) return null;

    if (!path || path.includes("undefined")) {
      console.error("Invalid upload folder:", path);
      throw new Error("Upload folder path invalid.");
    }

    const safeName = file.name.replace(/[^\w\-.]/g, "_");
    const filePath = `${path}/${Date.now()}-${safeName}`;

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET!;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    return `${baseUrl}/storage/v1/object/public/${bucket}/${data.path}`;
  }

  /* ----------------------------------------------------------
     Submit handler
  ---------------------------------------------------------- */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (levelsSelected.length === 0) {
      return setError("Please choose at least one level.");
    }
    if (eventsSelected.length === 0) {
      return setError("Please choose at least one event.");
    }

    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const folder = `invites/${token}`;

    try {
      // Upload files
      const logoPublic =
        logoUrl || (logoFile ? await uploadToSupabase(logoFile, folder) : null);

      const headshotPublic =
        headshotUrl ||
        (headshotFile ? await uploadToSupabase(headshotFile, folder) : null);

      const attachmentPublic =
        attachmentUrl ||
        (attachmentFile ? await uploadToSupabase(attachmentFile, folder) : null);

      const extraDocPublics = [...extraDocUrls];
      for (const file of extraDocsFiles) {
        const uploaded = await uploadToSupabase(file, folder);
        if (uploaded) extraDocPublics.push(uploaded);
      }

      /* ------------------------------------------------------
         Build Payload (Final)
      ------------------------------------------------------ */
      const payload = {
        invite_token: token,
        token_status: "confirmed",
        confirmed_at: new Date().toISOString(),

        university_name: fd.get("university_name"),
        university_logo: logoPublic,

        city: fd.get("city"),
        state: fd.get("state"),
        country: fd.get("country"),

        representative_name: fd.get("rep_name"),
        representative_designation: fd.get("rep_designation"),
        representative_email: fd.get("rep_email"),
        representative_phone_number: fd.get("rep_phone"),
        representative_headshot_file: headshotPublic,

        submitter_name: fd.get("submitter_name"),
        submitter_contact: fd.get("submitter_contact"),

        levels_recruiting_for: levelsSelected,
        multi_event_selection: eventsSelected,
        preferred_time_slots: slotsSelected,

        highlights_or_focus: fd.get("highlights"),
        deposit_link: fd.get("deposit_link"),
        remarks: fd.get("remarks"),

        attachment_file: attachmentPublic,
        additional_documents_list: extraDocPublics.length
          ? extraDocPublics
          : null,

        contact_consent: fd.get("consent") === "on",

        client_metadata: {
          submitted_at: new Date().toISOString(),
          user_agent: navigator?.userAgent || null,
          platform: navigator?.platform || null,
        },

        system_metadata: {
          form_version: "v1",
          raw_form_data: null,
        },
      };

      const webhook = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!;
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Webhook returned an error.");

      alert("Confirmation submitted successfully.");
      form.reset();

      setLogoFile(null);
      setLogoUrl(null);
      setHeadshotFile(null);
      setHeadshotUrl(null);
      setAttachmentFile(null);
      setAttachmentUrl(null);
      setExtraDocsFiles([]);
      setExtraDocUrls([]);
      setLevelsSelected([]);
      setEventsSelected([]);
      setSlotsSelected([]);

    } catch (err) {
      console.error("FORM SUBMIT ERROR:", err);
      setError("Failed to submit form. Try again or contact admin.");
    } finally {
      setLoading(false);
    }
  }

  /* ----------------------------------------------------------
     Pill UI Component
  ---------------------------------------------------------- */
  function Pill({ label, active, onClick, name, value }: any) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`checkbox-pill ${active ? "checked" : ""}`}
        onMouseDown={(e) => e.preventDefault()}
      >
        <span className="pill-label">{label}</span>
        {active && name && value ? (
          <input type="hidden" name={`${name}[]`} value={value} />
        ) : null}
      </button>
    );
  }

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="form-container bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg">
        <h1 className="text-4xl font-extrabold text-center mb-8">
          University Confirmation Form
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* University Section */}
          <section className="space-y-4">
            <h2 className="section-title">University Information</h2>

            <input
              name="university_name"
              placeholder="University Name"
              required
              className="form-input"
            />

            <FileUpload
              label="University Logo (optional)"
              accept="image/*"
              onSelect={handleLogoSelect}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input name="city" placeholder="City" required className="form-input" />
              <input name="state" placeholder="State" required className="form-input" />
              <input name="country" placeholder="Country" required className="form-input" />
            </div>
          </section>

          {/* Representative */}
          <section className="space-y-4">
            <h2 className="section-title">Representative Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="rep_name" placeholder="Representative Name" required className="form-input" />
              <input name="rep_designation" placeholder="Designation" required className="form-input" />
              <input name="rep_email" type="email" placeholder="Email" required className="form-input" />
              <input name="rep_phone" placeholder="Phone Number" required className="form-input" />
            </div>

            <FileUpload
              label="Representative Headshot (optional)"
              accept="image/*"
              onSelect={handleHeadshotSelect}
            />
          </section>

          {/* Submitter */}
          <section className="space-y-4">
            <h2 className="section-title">Submitter Details (optional)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 
gap-4">
              <input name="submitter_name" placeholder="Submitter Name" className="form-input" />
              <input name="submitter_contact" placeholder="Submitter Contact" className="form-input" />
            </div>
          </section>

          {/* Recruitment */}
          <section className="space-y-6">
            <h2 className="section-title">Recruitment Information</h2>

            <div>
              <p className="font-semibold text-sm">Levels Recruiting For *</p>
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

            <div>
              <p className="font-semibold text-sm">Events You Will Attend *</p>
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

            <div>
              <p className="font-semibold text-sm">Preferred Time Slots (optional)</p>
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

          {/* Notes */}
          <section className="space-y-4">
            <textarea
              name="highlights"
              placeholder="Paste highlights or focus areas"
              className="form-textarea"
            />

            <input
              name="deposit_link"
              placeholder="Deposit Link (if any)"
              className="form-input"
            />
          </section>

          {/* Documents */}
          <section className="space-y-4">
            <h2 className="section-title">Documents</h2>

            <FileUpload
              label="Upload Brochure / Guidelines"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
              onSelect={handleAttachmentSelect}
            />

            <FileUpload
              label="Upload Additional Documents"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,image/*"
              multiple
              onSelect={handleExtraDocSelect}
            />
          </section>

          <label className="font-semibold text-gray-800">Remarks</label>
          <textarea name="remarks" className="form-textarea" />

          {/* Consent */}
          <label className="flex items-start gap-3 text-gray-700">
            <input type="checkbox" name="consent" required className="h-4 w-4 accent-brand-primary mt-1" />
            <span className="text-sm">I consent to communication related to this event.</span>
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="modern-btn-primary w-full py-4 text-lg"
          >
            {loading ? "Submitting..." : "Submit Confirmation"}
          </button>
        </form>
      </div>
    </div>
  );
}
