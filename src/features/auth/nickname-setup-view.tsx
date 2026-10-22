import type { FormEvent } from "react";
import { NicknameField } from "@/components/nickname-field";
import { Button } from "@/components/ui/button";

export type NicknameSetupViewProps = {
  googleName: string;
  value: string;
  error: string | null;
  isSaving: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function NicknameSetupView({
  googleName,
  value,
  error,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}: NicknameSetupViewProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">반가워요, {googleName}님</h1>
        <p className="text-sm text-muted-foreground">앱에서 쓸 닉네임을 정해 주세요.</p>
      </div>

      <form className="flex w-full max-w-xs flex-col gap-4" onSubmit={handleSubmit}>
        <NicknameField
          id="nickname-setup"
          value={value}
          error={error}
          disabled={isSaving}
          autoFocus
          onChange={onChange}
        />
        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" className="h-11 w-full" disabled={isSaving}>
            {isSaving ? "저장하는 중…" : "시작하기"}
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={isSaving} onClick={onCancel}>
            다른 계정으로 로그인
          </Button>
        </div>
      </form>
    </main>
  );
}
