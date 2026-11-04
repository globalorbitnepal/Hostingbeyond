"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DNS_PROPOSAL_STATUSES = [
  "pending",
  "executing",
  "cancelled",
  "expired",
  "executed",
  "failed",
] as const;
const DNS_RECORD_TYPES = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "SRV",
] as const;
const DNS_VERIFICATION_FILTERS = [
  "verified",
  "unverified",
  "mismatch",
] as const;

type Counts = {
  total: number;
  pending: number;
  executed: number;
  rejected: number;
  expired: number;
  uncertain: number;
  verifiedSuccess: number;
  acceptedUnverified: number;
};

type Proposal = {
  publicId: string;
  domain: string;
  customerRef: string;
  recordType: string;
  host: string;
  action: string;
  status: string;
  providerStatus: string | null;
  verification: string;
  createdAt: string;
  updatedAt: string;
};

type Detail = Proposal & {
  value: string;
  ttl: number;
  priority: number | null;
  recordId: string | null;
  snapshot: {
    type: string;
    host: string;
    value: string;
    ttl: number | null;
    distance: number | null;
  } | null;
  expiresAt: string;
  uncertainExplanation: string | null;
};

type Audit = {
  id: string;
  domain: string | null;
  recordType: string | null;
  recordAction: string | null;
  previous: { value: string } | null;
  next: { value: string } | null;
  providerStatus: string | null;
  verification: string;
  createdAt: string;
};

const CARDS: { key: keyof Counts; label: string }[] = [
  { key: "total", label: "Total proposals" },
  { key: "pending", label: "Pending" },
  { key: "executed", label: "Executed" },
  { key: "rejected", label: "Rejected" },
  { key: "expired", label: "Expired" },
  { key: "uncertain", label: "Uncertain" },
  { key: "verifiedSuccess", label: "Verified success" },
  { key: "acceptedUnverified", label: "Accepted, not verified" },
];

export default function OrbitBeyondMasterDnsPage() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [customer, setCustomer] = useState("");
  const [verification, setVerification] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [migration, setMigration] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (query.trim()) params.set("q", query.trim());
    if (domain.trim()) params.set("domain", domain.trim());
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (customer.trim()) params.set("customer", customer.trim());
    if (verification) params.set("verification", verification);
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/orbit/beyond-master/dns?${params.toString()}`,
        );
        const payload = (await response.json().catch(() => null)) as {
          available?: boolean;
          message?: string;
          error?: string;
          counts?: Counts;
          proposals?: Proposal[];
          total?: number;
          pageSize?: number;
        } | null;
        if (cancelled) return;
        if (payload?.available === false && payload.message) {
          setMigration(payload.message);
          setCounts(null);
          setProposals([]);
          setError("");
          return;
        }
        if (
          !response.ok ||
          !payload ||
          payload.available !== true ||
          !payload.counts ||
          !payload.proposals
        ) {
          setError(payload?.error || "DNS proposals could not be loaded.");
          setCounts(null);
          setMigration("");
          return;
        }
        setCounts(payload.counts);
        setProposals(payload.proposals);
        setTotal(payload.total ?? 0);
        setPageSize(payload.pageSize ?? 20);
        setMigration("");
        setError("");
      } catch {
        if (!cancelled) setError("DNS proposals could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, domain, status, type, customer, verification, from, to, page]);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      setAudit([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      setDetailError("");
      const response = await fetch(
        `/api/orbit/beyond-master/dns/${encodeURIComponent(selected)}`,
      );
      const payload = (await response.json().catch(() => null)) as {
        proposal?: Detail;
        audit?: Audit[];
        error?: string;
      } | null;
      if (cancelled) return;
      if (!response.ok || !payload?.proposal) {
        setDetail(null);
        setDetailError(payload?.error || "That proposal could not be loaded.");
        return;
      }
      setDetail(payload.proposal);
      setAudit(payload.audit ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            DNS management
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Read-only Beyond Master DNS proposals. This screen cannot create,
            change, or delete DNS records, and it does not read the live DNS
            zone. An executing or uncertain proposal is not retried.
          </p>
        </div>
        <Link
          href="/orbit/beyond-master"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          Overview
        </Link>
      </div>
      {loading ? (
        <p className="text-sm text-slate-500">Loading DNS proposals…</p>
      ) : null}
      {migration ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {migration}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      {counts ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CARDS.map((card) => (
            <div
              key={card.key}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {counts[card.key]}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {migration ? null : (
        <form
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <Field
            label="Search domain, reference, or host"
            value={query}
            onChange={(value) => {
              setPage(1);
              setQuery(value);
            }}
          />
          <Field
            label="Domain"
            value={domain}
            onChange={(value) => {
              setPage(1);
              setDomain(value);
            }}
          />
          <Field
            label="Customer id"
            value={customer}
            onChange={(value) => {
              setPage(1);
              setCustomer(value);
            }}
          />
          <Select
            label="Status"
            value={status}
            options={DNS_PROPOSAL_STATUSES}
            onChange={(value) => {
              setPage(1);
              setStatus(value);
            }}
          />
          <Select
            label="Record type"
            value={type}
            options={DNS_RECORD_TYPES}
            onChange={(value) => {
              setPage(1);
              setType(value);
            }}
          />
          <Select
            label="Verification"
            value={verification}
            options={DNS_VERIFICATION_FILTERS}
            onChange={(value) => {
              setPage(1);
              setVerification(value);
            }}
          />
          <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => {
                setPage(1);
                setFrom(event.target.value);
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
            />
          </label>
          <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => {
                setPage(1);
                setTo(event.target.value);
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
            />
          </label>
        </form>
      )}
      {counts && proposals.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          No DNS proposals match these filters.
        </p>
      ) : null}
      {proposals.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-3 py-3">Reference</th>
                  <th className="px-3 py-3">Domain</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Host</th>
                  <th className="px-3 py-3">Action</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Provider</th>
                  <th className="px-3 py-3">Verification</th>
                  <th className="px-3 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((row) => (
                  <tr key={row.publicId} className="border-t border-slate-100">
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        className="font-semibold text-sky-700"
                        onClick={() => setSelected(row.publicId)}
                      >
                        {row.publicId}
                      </button>
                    </td>
                    <td className="px-3 py-3">{row.domain}</td>
                    <td className="px-3 py-3 text-slate-600">
                      {row.customerRef}
                    </td>
                    <td className="px-3 py-3">{row.recordType}</td>
                    <td className="px-3 py-3">{row.host}</td>
                    <td className="px-3 py-3">{row.action}</td>
                    <td className="px-3 py-3">
                      <StatusBadge value={row.status} />
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {row.providerStatus ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <VerificationBadge value={row.verification} />
                    </td>
                    <td className="px-3 py-3 text-slate-500">
                      {formatWhen(row.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {proposals.map((row) => (
              <button
                key={row.publicId}
                type="button"
                onClick={() => setSelected(row.publicId)}
                className="block w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
              >
                <span className="font-semibold text-slate-900">
                  {row.domain}
                </span>
                <span className="mt-1 block text-sm break-all text-sky-700">
                  {row.publicId}
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  {row.recordType} {row.host} · {row.action} · {row.customerRef}
                </span>
                <span className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge value={row.status} />
                  <VerificationBadge value={row.verification} />
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="text-slate-500">
              Page {page} of {pages} · {total} matching
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 disabled:opacity-40"
                disabled={page >= pages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}
      {detailError ? (
        <p className="text-sm text-rose-700">{detailError}</p>
      ) : null}
      {detail ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold break-all text-slate-900">
                {detail.publicId}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {detail.domain} · {detail.customerRef}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={detail.status} />
              <VerificationBadge value={detail.verification} />
            </div>
          </div>
          {detail.uncertainExplanation ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {detail.uncertainExplanation}
            </p>
          ) : null}
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Item
              label="Record"
              value={`${detail.recordType} ${detail.host}`}
            />
            <Item label="Action" value={detail.action} />
            <Item label="Proposed value" value={detail.value || "—"} />
            <Item label="TTL" value={String(detail.ttl)} />
            <Item
              label="Priority"
              value={detail.priority == null ? "—" : String(detail.priority)}
            />
            <Item
              label="Provider status"
              value={detail.providerStatus ?? "—"}
            />
            <Item label="Provider record id" value={detail.recordId ?? "—"} />
            <Item label="Created" value={formatWhen(detail.createdAt)} />
            <Item label="Expires" value={formatWhen(detail.expiresAt)} />
            <Item label="Updated" value={formatWhen(detail.updatedAt)} />
          </dl>
          {detail.snapshot ? (
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Existing record snapshot
              </h3>
              <p className="mt-1 text-sm text-slate-700">
                {detail.snapshot.type} {detail.snapshot.host} →{" "}
                {detail.snapshot.value} · TTL {detail.snapshot.ttl ?? "—"}
              </p>
            </div>
          ) : null}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Beyond Master DNS audit
            </h3>
            {audit.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">
                No related audit records.
              </p>
            ) : null}
            <ol className="mt-2 space-y-2">
              {audit.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700"
                >
                  <span className="font-semibold">
                    {entry.recordAction ?? "event"}
                  </span>{" "}
                  · {entry.recordType ?? "record"} ·{" "}
                  {entry.domain ?? detail.domain}
                  <span className="mt-1 block text-slate-500">
                    Previous {entry.previous?.value ?? "—"} · Next{" "}
                    {entry.next?.value ?? "—"} · Provider{" "}
                    {entry.providerStatus ?? "—"} · {entry.verification} ·{" "}
                    {formatWhen(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="break-all text-slate-800">{value}</dd>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "executed"
      ? "bg-emerald-100 text-emerald-800"
      : value === "failed" || value === "expired"
        ? "bg-rose-100 text-rose-800"
        : value === "executing"
          ? "bg-amber-100 text-amber-900"
          : "bg-slate-100 text-slate-700";
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>
      {value}
    </span>
  );
}

function VerificationBadge({ value }: { value: string }) {
  const tone =
    value === "verified"
      ? "bg-emerald-100 text-emerald-800"
      : value === "unverified" || value === "mismatch"
        ? "bg-amber-100 text-amber-900"
        : "bg-slate-100 text-slate-700";
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
