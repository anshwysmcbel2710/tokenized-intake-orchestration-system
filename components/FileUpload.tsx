// app/components/FileUpload.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, X, CheckCircle2 } from "lucide-react";

interface FileUploadProps {
  label: string;
  accept?: string;
  /**
   * onSelect receives either:
   *  - a File (single)
   *  - a File[] (when multiple)
   *  - a string (if your implementation uploads and returns a URL)
   *  - null (cleared)
   */
  onSelect: (payload: File | File[] | string | null) => void;
  multiple?: boolean;
  maxSizeMB?: number;
}

export default function FileUpload({
  label,
  accept = "",
  onSelect,
  multiple = false,
  maxSizeMB = 20,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------
     Generate image preview for single file (when appropriate)
  ------------------------------------------------------------ */
  useEffect(() => {
    const f = file;
    if (f && f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  /* ------------------------------------------------------------
     Validation + Set File(s)
  ------------------------------------------------------------ */
  function validateAndSetSingle(f: File | null) {
    setError(null);

    if (!f) {
      setFile(null);
      onSelect(null);
      return;
    }

    const sizeMB = f.size / 1024 / 1024;
    if (sizeMB > maxSizeMB) {
      setError(`File too large — maximum ${maxSizeMB} MB allowed.`);
      setFile(null);
      onSelect(null);
      return;
    }

    if (accept) {
      const allowed = accept.split(",").map((t) => t.trim());
      const valid = allowed.some((a) => {
        if (a.startsWith(".")) return f.name.toLowerCase().endsWith(a.toLowerCase());
        if (a.endsWith("/*")) return f.type.startsWith(a.replace("/*", ""));
        return f.type === a;
      });

      if (!valid) {
        setError("This file type might not be recommended for this field.");
      }
    }

    setFile(f);
    onSelect(f);
  }

  function validateAndSetMultiple(list: FileList | null) {
    setError(null);

    if (!list || list.length === 0) {
      setFiles([]);
      onSelect(null);
      return;
    }

    const arr = Array.from(list);
    const oversized = arr.find((f) => f.size / 1024 / 1024 > maxSizeMB);
    if (oversized) {
      setError(`One or more files exceed ${maxSizeMB} MB.`);
      setFiles([]);
      onSelect(null);
      return;
    }

    if (accept) {
      const allowed = accept.split(",").map((t) => t.trim());
      const invalid = arr.find((f) => {
        const valid = allowed.some((a) => {
          if (a.startsWith(".")) return f.name.toLowerCase().endsWith(a.toLowerCase());
          if (a.endsWith("/*")) return f.type.startsWith(a.replace("/*", ""));
          return f.type === a;
        });
        return !valid;
      });

      if (invalid) {
        setError("One or more files may not be recommended for this field.");
        // but still allow selection if you prefer — we clear selection for safety
        setFiles([]);
        onSelect(null);
        return;
      }
    }

    setFiles(arr);
    onSelect(arr);
  }

  /* ------------------------------------------------------------
     Input triggers
  ------------------------------------------------------------ */
  const triggerInput = () => inputRef.current?.click();

  const removeFile = () => {
    setFile(null);
    setFiles([]);
    setPreviewUrl(null);
    setError(null);
    onSelect(null);

    if (inputRef.current) inputRef.current.value = "";
  };

  /* ------------------------------------------------------------
     Drag & Drop
  ------------------------------------------------------------ */
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave() {
    setDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);

    if (multiple) {
      validateAndSetMultiple(e.dataTransfer.files);
    } else {
      const dropped = e.dataTransfer.files?.[0] ?? null;
      validateAndSetSingle(dropped);
    }
  }

  /* ------------------------------------------------------------
     Keyboard Support
  ------------------------------------------------------------ */
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerInput();
    }
  }

  /* ------------------------------------------------------------
     Render UI
  ------------------------------------------------------------ */
  return (
    <div className="space-y-2 fade-up">
      <label className="text-sm font-medium text-gray-800">{label}</label>

      {/* Hidden input */}
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          if (multiple) {
            validateAndSetMultiple(e.target.files);
          } else {
            validateAndSetSingle(e.target.files?.[0] ?? null);
          }
        }}
        className="hidden"
      />

      {/* Dropzone Card */}
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={triggerInput}
        onKeyDown={onKeyDown}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`file-upload-card refined-upload-card ${isDragging ? "drag-active" : ""}`}
      >
        <div className="flex items-center gap-4 w-full">
          {/* Icon box with success animation */}
          <div className={`upload-icon-box ${file || files.length ? "upload-success" : ""}`}>
            {file || files.length ? (
              <CheckCircle2 size={22} className="text-green-600 animate-pop" />
            ) : (
              <Upload size={22} className="text-gray-500" />
            )}
          </div>

          {/* File info / placeholder */}
          <div className="flex-1 min-w-0">
            {!file && files.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-gray-800">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {accept ? `Accepted: ${accept}` : "Any file type"} · Max {maxSizeMB} MB
                </p>
              </>
            ) : (
              <div className="flex items-center gap-4 fade-up">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file?.name ?? files[0]?.name}
                    className="w-14 h-14 object-cover rounded-[10px] border shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-[10px] bg-gray-100 flex items-center justify-center border shadow-sm">
                    <Upload size={18} className="text-gray-400" />
                  </div>
                )}

                <div className="min-w-0">
                  {files.length > 1 ? (
                    <>
                      <p className="font-semibold text-gray-900 truncate">{files.length} files</p>
                      <p className="text-xs text-gray-500">{files.map((f) => f.name).join(", ")}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500">
  {(((file?.size ?? files[0]?.size) ?? 0) / 1024 / 1024).toFixed(2)} MB · 
  {(file?.type ?? files[0]?.type ?? "Unknown")}
</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          {file || files.length ? (
            <button
              type="button"
              onClick={removeFile}
              aria-label="Remove file"
              className="remove-btn"
            >
              <X size={16} />
            </button>
          ) : (
            <button type="button" onClick={triggerInput} className="browse-btn">
              Browse
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
