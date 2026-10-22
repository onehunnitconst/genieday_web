"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { PeriodRecord } from "@/types/period";
import { PERIOD_RECORDS_STORAGE_KEY } from "../constants";
import { sortRecords } from "../utils/period-records";

// 저장소를 바꿀 때는 이 파일만 교체하면 된다. 지금은 서버(/api/period-records)에 저장한다.

const ENDPOINT = "/api/period-records";

const listeners = new Set<() => void>();
/** 로그인한 사용자의 기록. 계정이 바뀌면 처음부터 다시 불러온다. */
let store: { userId: string | null; records: PeriodRecord[] | null } = {
  userId: null,
  records: null,
};
let loading: Promise<void> | null = null;
/** 저장 요청이 순서대로 서버에 닿도록 이어 붙인다. */
let saving: Promise<unknown> = Promise.resolve();

const notify = () => listeners.forEach((listener) => listener());

const setRecords = (userId: string, records: PeriodRecord[] | null) => {
  if (store.userId !== userId) return; // 그사이 다른 계정으로 바뀌었으면 버린다.
  store = { userId, records };
  notify();
};

// ── 로그인 전 기기에 저장해 둔 기록 (처음 로그인할 때 서버로 옮긴다) ──

const isPeriodRecord = (value: unknown): value is PeriodRecord => {
  if (typeof value !== "object" || value === null) return false;
  const { id, startDate, endDate } = value as Record<string, unknown>;
  return (
    typeof id === "string" &&
    typeof startDate === "string" &&
    typeof endDate === "string"
  );
};

const readLocalRecords = (): PeriodRecord[] => {
  try {
    const raw = window.localStorage.getItem(PERIOD_RECORDS_STORAGE_KEY);
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.filter(isPeriodRecord) : [];
  } catch {
    return [];
  }
};

const clearLocalRecords = () => {
  try {
    window.localStorage.removeItem(PERIOD_RECORDS_STORAGE_KEY);
  } catch {
    // 지우지 못해도 다음 로그인 때 같은 ID로 다시 합쳐지므로 중복되지 않는다.
  }
};

// ── 서버 API ──

const fetchRecords = async (): Promise<PeriodRecord[]> => {
  const response = await fetch(ENDPOINT, { cache: "no-store" });
  if (!response.ok) throw new Error(`기록을 불러오지 못했습니다. (${response.status})`);
  const body = (await response.json()) as { records: PeriodRecord[] };
  return body.records;
};

const putRecords = async (records: PeriodRecord[]) => {
  const response = await fetch(ENDPOINT, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ records }),
  });
  if (!response.ok) throw new Error(`기록을 저장하지 못했습니다. (${response.status})`);
};

const load = (userId: string) => {
  loading ??= (async () => {
    try {
      const serverRecords = await fetchRecords();
      const localRecords = readLocalRecords();
      if (localRecords.length === 0) {
        setRecords(userId, serverRecords);
        return;
      }
      // 같은 ID는 서버 쪽을 남기고, 기기에만 있던 기록을 더한다.
      const serverIds = new Set(serverRecords.map((r) => r.id));
      const merged = sortRecords([
        ...serverRecords,
        ...localRecords.filter((r) => !serverIds.has(r.id)),
      ]);
      await putRecords(merged);
      clearLocalRecords();
      setRecords(userId, merged);
    } catch (error) {
      console.error(error);
      setRecords(userId, store.records ?? []);
    } finally {
      loading = null;
    }
  })();
};

const getServerSnapshot = () => null;

/** 생리 기록 저장소. 서버에서 불러오기 전(과 서버 렌더링 중)에는 records가 null이다. */
export function usePeriodRecords(userId: string) {
  const subscribe = useCallback(
    (listener: () => void) => {
      listeners.add(listener);
      if (store.userId !== userId) {
        store = { userId, records: null };
        loading = null;
      }
      if (store.records === null) load(userId);
      return () => {
        listeners.delete(listener);
      };
    },
    [userId],
  );
  const getSnapshot = useCallback(
    () => (store.userId === userId ? store.records : null),
    [userId],
  );

  const records = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveRecords = useCallback(
    (next: PeriodRecord[]) => {
      const previous = store.records;
      setRecords(userId, next); // 화면에는 바로 반영하고, 저장에 실패하면 되돌린다.
      saving = saving.then(() =>
        putRecords(next).catch((error: unknown) => {
          console.error(error);
          if (store.records === next) setRecords(userId, previous);
        }),
      );
    },
    [userId],
  );

  return { records, saveRecords };
}
