"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

import {
  sendBeyondMasterMessage,
  setBeyondMasterDraft,
  setBeyondMasterError,
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
  onerror: ((ev?: { error?: string }) => void) | null;
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
  className,
  onBeforeStart,
  forceVisible = false,
}: {
  disabled?: boolean;
  className?: string;
  onBeforeStart?: () => void;
  forceVisible?: boolean;
}) {
  const recRef = useRef<{
    stop: () => void;
    abort?: () => void;
  } | null>(null);
  const finalRef = useRef("");
  const listeningRef = useRef(false);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    return () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      const rec = recRef.current;
      if (rec) {
        if (rec.abort) rec.abort();
        else rec.stop();
      }
    };
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
  }, []);

  const finish = useCallback(
    (send: boolean) => {
      clearSilenceTimer();
      listeningRef.current = false;
      setListening(false);
      const rec = recRef.current;
      recRef.current = null;
      if (rec) {
        try {
          rec.stop();
        } catch {
          /* already stopped */
        }
      }
      const spoken = finalRef.current.trim();
      finalRef.current = "";
      if (send && spoken) {
        void sendBeyondMasterMessage(spoken);
      } else if (spoken) {
        setBeyondMasterDraft(spoken);
      }
    },
    [clearSilenceTimer],
  );

  const scheduleSilenceStop = useCallback(() => {
    clearSilenceTimer();
    silenceTimer.current = setTimeout(() => finish(true), 4500);
  }, [clearSilenceTimer, finish]);

  function startListening() {
    if (disabled || typeof window === "undefined") return;
    onBeforeStart?.();
    setBeyondMasterError(null);
    const w = window as Window & {
      SpeechRecognition?: WebSpeechCtor;
      webkitSpeechRecognition?: WebSpeechCtor;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setBeyondMasterError(
        "Voice input is not supported in this browser. Type your message instead.",
      );
      return;
    }
    try {
      recRef.current?.abort?.();
    } catch {
      /* ignore */
    }
    const rec = new Ctor();
    rec.lang = recognitionLanguage();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    finalRef.current = "";
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
      scheduleSilenceStop();
    };
    rec.onerror = (event) => {
      const code = event?.error ?? "";
      if (code === "no-speech") return;
      if (code === "not-allowed" || code === "service-not-allowed") {
        setBeyondMasterError(
          "Microphone permission was blocked. Allow the mic in your browser and tap again.",
        );
      } else if (code === "network") {
        setBeyondMasterError("Voice needs an internet connection.");
      }
      finish(false);
    };
    rec.onend = () => {
      if (listeningRef.current) finish(true);
    };
    recRef.current = rec;
    listeningRef.current = true;
    setListening(true);
    try {
      rec.start();
      scheduleSilenceStop();
    } catch {
      listeningRef.current = false;
      setListening(false);
      recRef.current = null;
      setBeyondMasterError("Voice could not start. Tap the mic again.");
    }
  }

  function toggle() {
    if (listeningRef.current) {
      finish(true);
      return;
    }
    startListening();
  }

  if (!voiceEnabled && !forceVisible) return null;

  return (
    <button
      type="button"
      className={className ?? "hb-bmai-mic"}
      data-listening={listening ? "true" : "false"}
      aria-pressed={listening}
      aria-label={listening ? "Stop listening and send" : "Speak your message"}
      title={
        supported
          ? listening
            ? "Tap to stop and send"
            : "Tap and speak your message"
          : "Voice input is not available in this browser"
      }
      disabled={disabled}
      onClick={toggle}
    >
      {listening ? (
        <Square className="size-[15px] fill-current" aria-hidden />
      ) : (
        <Mic className="size-[18px]" aria-hidden />
      )}
    </button>
  );
}
