"use client";

import { useEffect, useState } from "react";

export function useTyped(
  text: string,
  playing: boolean,
  reduce: boolean | null,
  loop = false,
) {
  const [count, setCount] = useState(reduce || !playing ? text.length : 0);

  useEffect(() => {
    if (reduce || !playing) {
      setCount(text.length);
      return;
    }

    let cancelled = false;
    let timeout = 0;
    let i = 0;
    setCount(0);

    function tick() {
      if (cancelled) return;
      if (i < text.length) {
        i += 1;
        setCount(i);
        timeout = window.setTimeout(tick, 38);
        return;
      }
      if (!loop) return;
      timeout = window.setTimeout(() => {
        if (cancelled) return;
        i = 0;
        setCount(0);
        timeout = window.setTimeout(tick, 260);
      }, 1700);
    }

    timeout = window.setTimeout(tick, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [text, playing, reduce, loop]);

  return text.slice(0, count);
}
