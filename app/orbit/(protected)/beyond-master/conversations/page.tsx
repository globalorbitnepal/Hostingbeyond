"use client";

import { useEffect, useState } from "react";

type ThreadSummary = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string | null; email: string } | null;
  messageCount: number;
  attachmentCount: number;
};

type ThreadDetail = {
  id: string;
  title: string;
  customer: { id: string; name: string | null; email: string } | null;
  messages: { id: string; role: string; body: string; createdAt: string }[];
  attachments: {
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
  }[];
};

function stamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrbitBeyondMasterConversationsPage() {
  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [detail, setDetail] = useState<ThreadDetail | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load(search = query) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const response = await fetch(
        `/api/orbit/beyond-master/conversations?${params.toString()}`,
        { cache: "no-store" },
      );
      const payload = (await response.json().catch(() => null)) as {
        threads?: ThreadSummary[];
        error?: string;
      } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Conversations could not be loaded.");
        setThreads([]);
        return;
      }
      setThreads(payload?.threads ?? []);
    } catch {
      setError("Conversations could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openThread(id: string) {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(
        `/api/orbit/beyond-master/conversations?id=${encodeURIComponent(id)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json().catch(() => null)) as {
        thread?: ThreadDetail;
        error?: string;
      } | null;
      if (!response.ok || !payload?.thread) {
        setNotice(payload?.error ?? "Conversation could not be opened.");
        return;
      }
      setDetail(payload.thread);
    } finally {
      setBusy(false);
    }
  }

  async function removeThread(id: string) {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(
        `/api/orbit/beyond-master/conversations?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        setNotice("Conversation could not be removed.");
        return;
      }
      if (detail?.id === id) setDetail(null);
      setNotice("Conversation removed.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            AI Agent conversations
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Every customer conversation is saved here, including files up to 5
            MB. Closing the panel does not remove a request.
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void load();
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer or title"
            className="h-10 w-64 rounded-full border border-slate-200 px-4 text-sm"
            aria-label="Search conversations"
          />
          <button
            type="submit"
            className="h-10 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            Search
          </button>
        </form>
      </header>

      {notice ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {loading ? (
              <li className="px-4 py-6 text-sm text-slate-500">Loading…</li>
            ) : threads.length === 0 ? (
              <li className="px-4 py-6 text-sm text-slate-500">
                No customer conversations yet.
              </li>
            ) : (
              threads.map((thread) => (
                <li key={thread.id} className="px-4 py-3">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => void openThread(thread.id)}
                  >
                    <span className="block text-sm font-semibold text-slate-900">
                      {thread.title}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {thread.customer?.name ||
                        thread.customer?.email ||
                        "Guest visitor"}{" "}
                      · {thread.messageCount} messages
                      {thread.attachmentCount > 0
                        ? ` · ${thread.attachmentCount} files`
                        : ""}{" "}
                      · {stamp(thread.updatedAt)}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-red-600"
                    disabled={busy}
                    onClick={() => void removeThread(thread.id)}
                  >
                    Remove
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          {detail ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {detail.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {detail.customer?.name ||
                      detail.customer?.email ||
                      "Guest visitor"}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-red-600"
                  disabled={busy}
                  onClick={() => void removeThread(detail.id)}
                >
                  Remove conversation
                </button>
              </div>
              <ol className="mt-4 space-y-3">
                {detail.messages.map((message) => (
                  <li
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900"
                        : "rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-800"
                    }
                  >
                    <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                      {message.role}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
                  </li>
                ))}
              </ol>
              {detail.attachments.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Attachments
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {detail.attachments.map((file) => (
                      <li key={file.id}>
                        <a
                          className="text-violet-700 underline"
                          href={`/api/orbit/beyond-master/conversations?thread=${encodeURIComponent(detail.id)}&attachment=${encodeURIComponent(file.id)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {file.fileName}
                        </a>{" "}
                        <span className="text-xs text-slate-500">
                          {(file.sizeBytes / 1024).toFixed(0)} KB
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Select a conversation to read the customer requirement.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
