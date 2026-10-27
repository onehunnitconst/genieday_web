"use client";

import { useCallback, useSyncExternalStore } from "react";

const getServerSnapshot = () => null;

/**
 * intervalMs마다 갱신되는 현재 시각(ms). intervalMs가 null이면 갱신하지 않고 null을 반환한다.
 * 서버 프리렌더 중에도 null이다.
 */
export function useNow(intervalMs: number | null): number | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (intervalMs === null) return () => {};
      const timer = setInterval(onChange, intervalMs);
      return () => clearInterval(timer);
    },
    [intervalMs],
  );
  // 같은 구간 안에서는 같은 값을 돌려줘야 useSyncExternalStore가 매번 다시 그리지 않는다.
  const getSnapshot = useCallback(
    () => (intervalMs === null ? null : Math.floor(Date.now() / intervalMs) * intervalMs),
    [intervalMs],
  );
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
