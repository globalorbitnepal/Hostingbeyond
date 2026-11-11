"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

export function ProfileField({
  label,
  value,
  display = value || "—",
  onSave,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  display?: string;
  onSave: (next: string) => Promise<void>;
  type?: "text" | "email" | "tel" | "select";
  options?: { value: string; label: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="hb-profile-row">
      <p className="hb-profile-row__label">{label}</p>
      <div className="hb-profile-row__value">
        {editing ? (
          <div className="flex flex-wrap items-center gap-2">
            {type === "select" && options ? (
              <select
                className="hb-input max-w-xs"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="hb-input max-w-md"
                type={type}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            )}
            <button
              type="button"
              className="hb-icon-btn"
              disabled={busy}
              aria-label="Save"
              onClick={() => void save()}
            >
              <Check className="size-4" />
            </button>
            <button
              type="button"
              className="hb-icon-btn"
              aria-label="Cancel"
              onClick={() => {
                setDraft(value);
                setEditing(false);
                setError(null);
              }}
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <p className="hb-text text-sm font-semibold">{display}</p>
        )}
        {error ? (
          <p className="mt-1 text-xs text-[var(--hb-p-danger)]">{error}</p>
        ) : null}
      </div>
      {!editing ? (
        <button
          type="button"
          className="hb-profile-row__edit"
          aria-label={`Edit ${label}`}
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
        >
          <Pencil className="size-3.5" />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
