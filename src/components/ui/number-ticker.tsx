"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type NumberTickerProps = {
  value: number;
  prefix?: string;
  decimals?: number;
};

export function NumberTicker({
  value,
  prefix = "",
  decimals = 0,
}: NumberTickerProps) {
  const [display, setDisplay] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const initial = previousValue.current;
    const duration = 800;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = initial + (value - initial) * eased;
      setDisplay(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        previousValue.current = value;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const formatted = useMemo(
    () => `${prefix}${display.toFixed(decimals)}`,
    [decimals, display, prefix],
  );

  return <span>{formatted}</span>;
}
