"use client";

import { useState } from "react";
import { nicknameSchema } from "@/utils/nickname";

type UseNicknameFormOptions = {
  initialValue?: string;
  /** 서버에 저장된 뒤 호출된다 (세션을 다시 불러와 화면에 반영하는 용도) */
  onSaved: (nickname: string) => void | Promise<void>;
};

/** 닉네임 입력·검증·저장. 가입 직후 설정 화면과 수정 대화상자가 함께 쓴다. */
export function useNicknameForm({ initialValue = "", onSaved }: UseNicknameFormOptions) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const changeValue = (next: string) => {
    setValue(next);
    setError(null);
  };

  const reset = (next = initialValue) => {
    setValue(next);
    setError(null);
  };

  const submit = async (): Promise<boolean> => {
    const parsed = nicknameSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "닉네임이 올바르지 않아요.");
      return false;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/me/nickname", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: parsed.data }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "닉네임을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
        return false;
      }
      await onSaved(parsed.data);
      return true;
    } catch {
      setError("닉네임을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { value, error, isSaving, changeValue, reset, submit };
}
