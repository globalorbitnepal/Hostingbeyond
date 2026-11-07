"use client";

import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";

import {
  sendBeyondMasterMessage,
  setBeyondMasterDraft,
} from "@/lib/beyond-master/ui-store";

type SpeechResultLike = {
  resultIndex: number;
  results: { 0?: { transcript: string }; isFinal?: boolean }[];
};

type WebSpeechCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechResultLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function recognitionLanguage(): string {
  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement.lang?.trim();
    if (htmlLang) return htmlLang;
  }
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  return "en-US";
}

export function BeyondMasterVoiceButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const recRef = useRef<{ stop: () => void } | null>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & {
      SpeechRecognition?: WebSpeechCtor;
      webkitSpeechRecognition?: WebSpeechCtor;
    };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => recRef.current?.stop();
  }, []);

  function toggleListen() {
    if (disabled || typeof window === "undefined") return;
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
    rec.lang = recognitionLanguage();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let finalText = "";
    rec.onresult = (event: SpeechResultLike) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const row = event.results[i];
        const alt = row?.[0]?.transcript ?? "";
        if (row?.isFinal) finalText = `${finalText} ${alt}`.trim();
        else interim += alt;
      }
      setBeyondMasterDraft((finalText || interim).trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
      const spoken = finalText.trim();
      if (spoken) void sendBeyondMasterMessage(spoken);
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      className="hb-bmai-mic"
      data-listening={listening ? "true" : "false"}
      aria-pressed={listening}
      aria-label={listening ? "Stop listening" : "Speak to AI Agent"}
      disabled={disabled}
      onClick={toggleListen}
    >
      <Mic className="size-[18px]" aria-hidden />
    </button>
  );
}
