"use client";

import type { ReactNode } from "react";

export function OrbitCard({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {hint ? (
            <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function TextField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none focus:border-[#673de6]"
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
}) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      <input
        type="number"
        min={0}
        step="0.01"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
        onBlur={onBlur}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none focus:border-[#673de6]"
      />
    </label>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  onBlur,
  rows = 3,
  hint,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={`mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none focus:border-[#673de6] ${
          mono ? "font-mono text-[13px]" : ""
        }`}
      />
      {hint ? (
        <span className="mt-1 block text-[11px] font-normal tracking-normal text-slate-400 normal-case">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function RowTools({
  visible,
  onVisible,
  onUp,
  onDown,
  onRemove,
  title,
}: {
  visible: boolean;
  onVisible: (value: boolean) => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:col-span-2">
      <p className="text-xs font-semibold text-slate-600">{title}</p>
      <label className="flex items-center gap-1.5 text-xs text-slate-500">
        <input
          type="checkbox"
          checked={visible}
          onChange={(event) => onVisible(event.target.checked)}
        />
        Visible
      </label>
      <button
        type="button"
        onClick={onUp}
        className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:text-slate-900"
      >
        Up
      </button>
      <button
        type="button"
        onClick={onDown}
        className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:text-slate-900"
      >
        Down
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="ml-auto rounded-lg border border-red-100 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
      >
        Remove
      </button>
    </div>
  );
}

export function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
    >
      + {label}
    </button>
  );
}
