"use client";

import { useSyncExternalStore } from "react";
import type { PeriodRecord } from "@/types/period";
import { PERIOD_RECORDS_STORAGE_KEY } from "../constants";

// 저장소를 바꿀 때(서버 API 등)는 이 파일만 교체하면 된다.

const listeners = new Set<() => void>();
let cache: { raw: string | null; records: PeriodRecord[] } = {
  raw: null,
  records: [],
};

const isPeriodRecord = (value: unknown): value is PeriodRecord => {
  if (typeof value !== "object" || value === null) return false;
  const { id, startDate, endDate } = value as Record<string, unknown>;
  return (
    typeof id === "string" &&
    typeof startDate === "string" &&
    typeof endDate === "string"
  );
};

const parse = (raw: string | null): PeriodRecord[] => {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter(isPeriodRecord) : [];
  } catch {
    return [];
  }
};

const readRaw = () => {
  try {
    return window.localStorage.getItem(PERIOD_RECORDS_STORAGE_KEY);
  } catch {
    return null;
  }
};

const getSnapshot = () => {
  const raw = readRaw();
  if (raw !== cache.raw) cache = { raw, records: parse(raw) };
  return cache.records;
};

const getServerSnapshot = () => null;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // 다른 탭에서 바뀐 기록도 반영한다.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const writeRecords = (records: PeriodRecord[]) => {
  const raw = JSON.stringify(records);
  try {
    window.localStorage.setItem(PERIOD_RECORDS_STORAGE_KEY, raw);
  } catch {
    // 저장 공간이 없거나 막힌 경우에도 이번 세션에서는 화면에 반영한다.
  }
  cache = { raw, records };
  listeners.forEach((listener) => listener());
};

/** 생리 기록 저장소. 서버 렌더링 중에는 records가 null이다. */
export function usePeriodRecords() {
  const records = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { records, saveRecords: writeRecords };
}
