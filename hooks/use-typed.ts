"use client";

import { useEffect, useState } from "react";

export function useTyped(
  text: string,
  playing: boolean,
  reduce: boolean | null,
) {
  const [count, setCount] = useState(reduce || !playing ? text.length : 0);

  useEffect(() => {
    if (reduce || !playing) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(timer);
    }, 42);
    return () => window.clearInterval(timer);
  }, [text, playing, reduce]);

  return text.slice(0, count);
}
