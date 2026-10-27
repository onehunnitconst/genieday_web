"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useNow } from "@/hooks/use-now";
import type { PartnerStatus } from "@/types/partner";
import { COPIED_FEEDBACK_MS, INVITE_POLL_INTERVAL_MS } from "./constants";

const ENDPOINT = "/api/partner";

export type PartnerCardState =
  | { kind: "loading" }
  | { kind: "none" }
  | { kind: "invited"; code: string; remainingLabel: string; isExpired: boolean }
  | { kind: "linked"; nickname: string; linkedAtLabel: string };

const readError = async (response: Response, fallback: string) => {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
};

const fetchStatus = async (): Promise<PartnerStatus> => {
  const response = await fetch(ENDPOINT, { cache: "no-store" });
  if (!response.ok) throw new Error(`파트너 정보를 불러오지 못했습니다. (${response.status})`);
  return ((await response.json()) as { status: PartnerStatus }).status;
};

/** 남은 시간을 "29:41"처럼 */
const formatRemaining = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const toCardState = (status: PartnerStatus | null, now: number | null): PartnerCardState => {
  if (!status) return { kind: "loading" };
  switch (status.kind) {
    case "none":
      return status;
    case "invited": {
      const remainingMs = now === null ? null : Date.parse(status.expiresAt) - now;
      return {
        kind: "invited",
        code: status.code,
        remainingLabel: remainingMs === null ? "" : formatRemaining(remainingMs),
        isExpired: remainingMs !== null && remainingMs <= 0,
      };
    }
    case "linked":
      return {
        kind: "linked",
        nickname: status.nickname,
        linkedAtLabel: format(new Date(status.linkedAt), "yyyy년 M월 d일", { locale: ko }),
      };
  }
};

export function usePartner() {
  const [status, setStatus] = useState<PartnerStatus | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const isInvited = status?.kind === "invited";
  const now = useNow(isInvited ? 1000 : null);

  const handleLoadError = useCallback((cause: unknown) => {
    console.error(cause);
    setError("파트너 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    setStatus((previous) => previous ?? { kind: "none" });
  }, []);

  const refresh = useCallback(
    () => fetchStatus().then(setStatus, handleLoadError),
    [handleLoadError],
  );

  useEffect(() => {
    let ignore = false;
    fetchStatus().then(
      (next) => {
        if (!ignore) setStatus(next);
      },
      (cause: unknown) => {
        if (!ignore) handleLoadError(cause);
      },
    );
    return () => {
      ignore = true;
    };
  }, [handleLoadError]);

  // 코드를 띄워 둔 동안 파트너가 입력했는지(또는 만료됐는지) 주기적으로 확인한다.
  useEffect(() => {
    if (!isInvited) return;
    const timer = setInterval(() => void refresh(), INVITE_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isInvited, refresh]);

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [isCopied]);

  const issueCode = async () => {
    setIsBusy(true);
    setError(null);
    setIsCopied(false);
    try {
      const response = await fetch(`${ENDPOINT}/invite`, { method: "POST" });
      if (!response.ok) {
        setError(await readError(response, "코드를 만들지 못했어요. 잠시 후 다시 시도해 주세요."));
        await refresh();
        return;
      }
      setStatus(((await response.json()) as { status: PartnerStatus }).status);
    } catch {
      setError("코드를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsBusy(false);
    }
  };

  /** 연결 해제와 코드 취소는 같은 요청이다. (서버가 연결과 코드를 함께 지운다) */
  const disconnect = async (failureMessage: string) => {
    setIsBusy(true);
    setError(null);
    try {
      const response = await fetch(ENDPOINT, { method: "DELETE" });
      if (!response.ok) {
        setError(await readError(response, failureMessage));
        return;
      }
      setStatus({ kind: "none" });
    } catch {
      setError(failureMessage);
    } finally {
      setIsBusy(false);
    }
  };

  const copyCode = async () => {
    if (status?.kind !== "invited") return;
    try {
      await navigator.clipboard.writeText(status.code);
      setIsCopied(true);
    } catch {
      setError("코드를 복사하지 못했어요. 화면의 코드를 직접 알려 주세요.");
    }
  };

  return {
    card: toCardState(status, now),
    isBusy,
    error,
    isCopied,
    issueCode,
    copyCode,
    cancelInvite: () => disconnect("코드를 취소하지 못했어요. 잠시 후 다시 시도해 주세요."),
    unlink: () => disconnect("연결을 해제하지 못했어요. 잠시 후 다시 시도해 주세요."),
  };
}
