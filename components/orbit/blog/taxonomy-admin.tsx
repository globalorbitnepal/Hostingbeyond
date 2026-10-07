"use client";

import { useEffect, useState } from "react";

type Row = { id: string; name: string; slug: string; description?: string };

export function TaxonomyAdmin({
  kind,
  title,
}: {
  kind: "categories" | "tags" | "authors";
  title: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");

  const endpoint = `/api/orbit/blog/${kind === "authors" ? "authors" : kind}`;

  async function load() {
    const res = await fetch(endpoint);
    const json = await res.json();
    const key =
      kind === "categories"
        ? "categories"
        : kind === "tags"
          ? "tags"
          : "authors";
    setRows(json[key] ?? []);
  }

  useEffect(() => {
    void load();
  }, [endpoint]);

  async function save() {
    setMsg("");
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, slug, description }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg(json.error || "Save failed");
      return;
    }
    setName("");
    setSlug("");
    setDescription("");
    await load();
  }

  async function remove(id: string) {
    await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug (optional)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        {kind !== "authors" ? (
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        ) : null}
        <button
          type="button"
          onClick={() => void save()}
          className="rounded-lg bg-[#673de6] px-4 py-2 text-sm font-semibold text-white md:col-span-3 md:w-fit"
        >
          Add{" "}
          {kind === "authors" ? "author" : kind === "tags" ? "tag" : "category"}
        </button>
        {msg ? (
          <p className="text-sm text-red-600 md:col-span-3">{msg}</p>
        ) : null}
      </div>
      <ul className="divide-y rounded-2xl border border-slate-200 bg-white">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span>
              <strong>{row.name}</strong>{" "}
              <span className="text-slate-400">/{row.slug}</span>
            </span>
            <button
              type="button"
              onClick={() => void remove(row.id)}
              className="text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
