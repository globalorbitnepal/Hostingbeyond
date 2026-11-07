"use client";

import { useEffect, useId, useRef, useState } from "react";

import { setBeyondMasterDraft } from "@/lib/beyond-master/ui-store";

const LANGS: { code: string; label: string }[] = [
  { code: "en-US", label: "English (US)" },
  { code: "hi-IN", label: "Hindi" },
  { code: "ne-NP", label: "Nepali" },
];

type SpeechResultLike = {
  resultIndex: number;
  results: { 0?: { transcript: string }; isFinal?: boolean }[];
};

type WebSpeechCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechResultLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export function BeyondMasterVoiceBar() {
  const id = useId();
  const recRef = useRef<{ stop: () => void } | null>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState(LANGS[0]!.code);
  const [transcript, setTranscript] = useState("");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & {
      SpeechRecognition?: WebSpeechCtor;
      webkitSpeechRecognition?: WebSpeechCtor;
    };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  function stopPlayback() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }

  function speakPreview() {
    const text = transcript.trim();
    if (
      !text ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    )
      return;
    stopPlayback();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  function toggleListen() {
    if (typeof window === "undefined") return;
    const w = window as Window & {
      SpeechRecognition?: WebSpeechCtor;
      webkitSpeechRecognition?: WebSpeechCtor;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (event: SpeechResultLike) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const alt = event.results[i]?.[0];
        if (alt?.transcript) text += alt.transcript;
      }
      setTranscript((prev) =>
        event.results[0]?.isFinal ? text.trim() : `${prev}${text}`.trim(),
      );
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  function applyToComposer() {
    const text = transcript.trim();
    if (!text) return;
    setBeyondMasterDraft(text);
  }

  if (!supported) {
    return (
      <div className="hb-bmai-voice-fallback rounded-xl border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-600">
        Voice input uses your browser. Speech recognition is not available here
        — type your message instead.
      </div>
    );
  }

  return (
    <div className="hb-bmai-voice space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold text-slate-700" htmlFor={id}>
          Voice language
        </label>
        <select
          id={id}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          {LANGS.map((row) => (
            <option key={row.code} value={row.code}>
              {row.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            listening ? "bg-rose-600 text-white" : "bg-slate-900 text-white"
          }`}
          onClick={toggleListen}
        >
          {listening ? "Stop mic" : "Microphone"}
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800"
          onClick={speakPreview}
          disabled={!transcript.trim()}
        >
          Read aloud
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800"
          onClick={stopPlayback}
          disabled={!speaking}
        >
          Stop playback
        </button>
        <button
          type="button"
          className="rounded-full bg-violet-700 px-3 py-1 text-xs font-semibold text-white"
          onClick={applyToComposer}
          disabled={!transcript.trim()}
        >
          Use in message
        </button>
      </div>
      <textarea
        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
        rows={2}
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Editable transcription — nothing is sent until you press Send."
      />
      <p className="text-[11px] text-slate-500">
        Uses Web Speech API only. Does not bypass sign-in or confirmations.
      </p>
    </div>
  );
}
