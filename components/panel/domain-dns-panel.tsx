"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  DEFAULT_DNS_TTL,
  EDITABLE_DNS_TYPES,
} from "@/lib/domains/providers/namesilo-dns";
import { cn } from "@/lib/utils";

type DnsRecord = {
  recordId: string;
  type: string;
  host: string;
  value: string;
  ttl: number;
  distance: number;
};

type FormState = {
  recordId: string | null;
  type: string;
  host: string;
  value: string;
  ttl: string;
  priority: string;
};

const EMPTY_FORM: FormState = {
  recordId: null,
  type: "A",
  host: "",
  value: "",
  ttl: String(DEFAULT_DNS_TTL),
  priority: "10",
};

export function DomainDnsPanel({
  registrationId,
  domainName,
}: {
  registrationId: string;
  domainName: string;
}) {
  const [records, setRecords] = useState<DnsRecord[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const res = await fetch(`/api/domains/${registrationId}/dns`, {
        cache: "no-store",
      });
      const json = (await res.json()) as {
        records?: DnsRecord[];
        error?: string;
      };
      if (!res.ok) {
        setLoadError(json.error ?? "DNS records could not be loaded.");
        setRecords([]);
        return;
      }
      setRecords(json.records ?? []);
    } catch {
      setLoadError("Network error while loading DNS records.");
      setRecords([]);
    }
  }, [registrationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetFeedback = () => {
    setMessage("");
    setError("");
  };

  function openCreate() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    resetFeedback();
  }

  function openEdit(record: DnsRecord) {
    setForm({
      recordId: record.recordId,
      type: record.type,
      host: record.host,
      value: record.value,
      ttl: String(record.ttl),
      priority: String(record.distance || 10),
    });
    setShowForm(true);
    resetFeedback();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    resetFeedback();
    const payload = {
      type: form.type,
      host: form.host,
      value: form.value,
      ttl: form.ttl,
      priority: form.priority,
    };
    try {
      const res = await fetch(
        form.recordId
          ? `/api/domains/${registrationId}/dns/${encodeURIComponent(form.recordId)}`
          : `/api/domains/${registrationId}/dns`,
        {
          method: form.recordId ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "The record could not be saved.");
        return;
      }
      setMessage(form.recordId ? "Record updated." : "Record added.");
      setShowForm(false);
      setForm(EMPTY_FORM);
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(record: DnsRecord) {
    if (
      !window.confirm(
        `Delete the ${record.type} record for ${record.host === "@" ? domainName : record.host}?`,
      )
    ) {
      return;
    }
    setBusy(true);
    resetFeedback();
    try {
      const res = await fetch(
        `/api/domains/${registrationId}/dns/${encodeURIComponent(record.recordId)}`,
        { method: "DELETE" },
      );
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "The record could not be deleted.");
        return;
      }
      setMessage("Record deleted.");
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="hb-h2">DNS records</h3>
          <p className="hb-muted mt-0.5 max-w-xl text-xs">
            Records live at the registrar. Changes apply to domains using
            HostingBeyond nameservers and can take up to 24 hours to propagate.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="hb-btn hb-btn-primary"
        >
          <Plus className="size-4" />
          Add record
        </button>
      </div>

      {message ? (
        <p className="hb-pill hb-pill-ok inline-flex">
          <CheckCircle2 className="size-3.5" /> {message}
        </p>
      ) : null}
      {error ? (
        <p className="hb-pill hb-pill-danger inline-flex">
          <AlertTriangle className="size-3.5" /> {error}
        </p>
      ) : null}
      {loadError ? (
        <p className="hb-pill hb-pill-warn inline-flex">
          <AlertTriangle className="size-3.5" /> {loadError}
        </p>
      ) : null}

      {showForm ? (
        <form onSubmit={submit} className="hb-soft space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="hb-text text-sm font-bold">
              {form.recordId ? "Edit record" : "New record"}
            </p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="hb-icon-btn !size-7"
              aria-label="Close form"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="hb-label">Type</span>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value }))
                }
                className="hb-select"
              >
                {EDITABLE_DNS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="hb-label">Host</span>
              <input
                value={form.host}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, host: e.target.value }))
                }
                placeholder="@ or www"
                className="hb-input"
                required
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="hb-label">
                Value
                {form.type === "A"
                  ? " (IPv4 address)"
                  : form.type === "CNAME" || form.type === "MX"
                    ? " (hostname)"
                    : ""}
              </span>
              <input
                value={form.value}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, value: e.target.value }))
                }
                placeholder={
                  form.type === "A"
                    ? "203.0.113.10"
                    : form.type === "MX"
                      ? "mail.example.com"
                      : "target value"
                }
                className="hb-input"
                required
              />
            </label>
            <label className="block">
              <span className="hb-label">TTL (seconds)</span>
              <input
                type="number"
                min={300}
                max={86400}
                value={form.ttl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ttl: e.target.value }))
                }
                className="hb-input"
              />
            </label>
            {form.type === "MX" ? (
              <label className="block">
                <span className="hb-label">Priority</span>
                <input
                  type="number"
                  min={0}
                  max={65535}
                  value={form.priority}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, priority: e.target.value }))
                  }
                  className="hb-input"
                />
              </label>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="hb-btn hb-btn-primary"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {form.recordId ? "Save changes" : "Add record"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="hb-btn hb-btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {records === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="hb-soft h-12 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <p className="hb-muted rounded-xl border border-dashed border-[var(--hb-p-border-strong)] px-4 py-8 text-center text-sm">
          {loadError
            ? "No records could be read right now."
            : "No DNS records yet. Add an A record to point this domain at hosting."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="hb-muted text-[11px] font-bold tracking-wide uppercase">
              <tr className="border-b border-[var(--hb-p-border)]">
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Host</th>
                <th className="py-2 pr-3">Value</th>
                <th className="py-2 pr-3">TTL</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  key={record.recordId}
                  className="border-b border-[var(--hb-p-border)] last:border-0"
                >
                  <td className="py-2 pr-3">
                    <span className="hb-pill hb-pill-info">{record.type}</span>
                  </td>
                  <td className="hb-text py-2 pr-3 font-mono text-xs">
                    {record.host}
                  </td>
                  <td className="max-w-[22rem] py-2 pr-3">
                    <span className="hb-text-soft block truncate font-mono text-xs">
                      {record.value}
                    </span>
                    {record.type === "MX" ? (
                      <span className="hb-faint text-[11px]">
                        priority {record.distance}
                      </span>
                    ) : null}
                  </td>
                  <td className="hb-muted py-2 pr-3 text-xs tabular-nums">
                    {record.ttl}
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(record)}
                        disabled={busy}
                        className="hb-icon-btn !size-8"
                        aria-label={`Edit ${record.type} record`}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(record)}
                        disabled={busy}
                        className={cn(
                          "hb-icon-btn !size-8 text-[var(--hb-p-danger)]",
                        )}
                        aria-label={`Delete ${record.type} record`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
