"use client";

import { PointerEvent, useEffect, useRef, useState } from "react";
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
  abort?: () => void;
  onresult: ((ev: SpeechResultLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function recognitionLanguage(): string {
  if (typeof navigator !== "undefined") {
    const fromNav = navigator.languages?.[0] || navigator.language;
    if (fromNav) return fromNav;
  }
  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement.lang?.trim();
    if (htmlLang) return htmlLang;
  }
  return "en-US";
}

export function BeyondMasterVoiceButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const recRef = useRef<{ stop: () => void; abort?: () => void } | null>(null);
  const finalRef = useRef("");
  const holdingRef = useRef(false);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    void fetch("/api/beyond-master/features", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload: { voiceInput?: boolean }) => {
        if (payload.voiceInput === false) setVoiceEnabled(false);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & {
      SpeechRecognition?: WebSpeechCtor;
      webkitSpeechRecognition?: WebSpeechCtor;
    };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => recRef.current?.abort?.() ?? recRef.current?.stop();
  }, []);

  function stopAndSend() {
    holdingRef.current = false;
    if (recRef.current) {
      recRef.current.stop();
      return;
    }
    const spoken = finalRef.current.trim();
    finalRef.current = "";
    if (spoken) void sendBeyondMasterMessage(spoken);
  }

  function startListen(event: PointerEvent<HTMLButtonElement>) {
    if (disabled || typeof window === "undefined") return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const w = window as Window & {
      SpeechRecognition?: WebSpeechCtor;
      webkitSpeechRecognition?: WebSpeechCtor;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    recRef.current?.abort?.();
    const rec = new Ctor();
    rec.lang = recognitionLanguage();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    finalRef.current = "";
    holdingRef.current = true;
    rec.onresult = (speechEvent: SpeechResultLike) => {
      let interim = "";
      for (
        let i = speechEvent.resultIndex;
        i < speechEvent.results.length;
        i += 1
      ) {
        const row = speechEvent.results[i];
        const alt = row?.[0]?.transcript ?? "";
        if (row?.isFinal) {
          finalRef.current = `${finalRef.current} ${alt}`.trim();
        } else {
          interim += alt;
        }
      }
      setBeyondMasterDraft((finalRef.current || interim).trim());
    };
    rec.onerror = () => {
      setListening(false);
      holdingRef.current = false;
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
      const spoken = finalRef.current.trim();
      finalRef.current = "";
      if (!holdingRef.current && spoken) {
        void sendBeyondMasterMessage(spoken);
      }
    };
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      holdingRef.current = false;
    }
  }

  if (!supported || !voiceEnabled) return null;

  return (
    <button
      type="button"
      className="hb-bmai-mic"
      data-listening={listening ? "true" : "false"}
      aria-pressed={listening}
      aria-label={listening ? "Release to send your message" : "Hold to speak"}
      disabled={disabled}
      onPointerDown={startListen}
      onPointerUp={stopAndSend}
      onPointerCancel={stopAndSend}
      onContextMenu={(event) => event.preventDefault()}
    >
      <Mic className="size-[18px]" aria-hidden />
    </button>
  );
}
