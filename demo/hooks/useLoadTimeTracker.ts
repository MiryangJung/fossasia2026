import { useCallback, useRef, useState } from "react";

type LoadEntry = {
  startMs: number;
  endMs: number;
};

export function useLoadTimeTracker() {
  const entries = useRef<LoadEntry[]>([]);
  const [stats, setStats] = useState({ count: 0, avgMs: 0, totalMs: 0 });

  const onLoadStart = useCallback(() => {
    return performance.now();
  }, []);

  const onLoadEnd = useCallback((startMs: number) => {
    const endMs = performance.now();
    entries.current.push({ startMs, endMs });

    const count = entries.current.length;
    const totalMs = entries.current.reduce(
      (sum, e) => sum + (e.endMs - e.startMs),
      0,
    );
    setStats({ count, avgMs: totalMs / count, totalMs });
  }, []);

  const reset = useCallback(() => {
    entries.current = [];
    setStats({ count: 0, avgMs: 0, totalMs: 0 });
  }, []);

  return { stats, onLoadStart, onLoadEnd, reset };
}
