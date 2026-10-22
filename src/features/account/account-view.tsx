import type { FormEvent } from "react";
import { Pencil } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { NicknameField } from "@/components/nickname-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type AccountViewProps = {
  nickname: string;
  isEditOpen: boolean;
  nicknameValue: string;
  nicknameError: string | null;
  isSaving: boolean;
  onOpenEdit: () => void;
  onEditOpenChange: (open: boolean) => void;
  onNicknameChange: (value: string) => void;
  onSaveNickname: () => void;
  onSignOut: () => void;
};

export function AccountView({
  nickname,
  isEditOpen,
  nicknameValue,
  nicknameError,
  isSaving,
  onOpenEdit,
  onEditOpenChange,
  onNicknameChange,
  onSaveNickname,
  onSignOut,
}: AccountViewProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSaveNickname();
  };

  return (
    <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
      <div className="flex min-w-0 items-center gap-1">
        <LogoMark className="mr-1 size-6" />
        <span className="truncate">{nickname}님의 기록</span>
        <Button variant="ghost" size="icon-sm" aria-label="닉네임 수정" onClick={onOpenEdit}>
          <Pencil />
        </Button>
      </div>
      <Button variant="ghost" size="sm" onClick={onSignOut}>
        로그아웃
      </Button>

      <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
        <DialogContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>닉네임 수정</DialogTitle>
            </DialogHeader>
            <NicknameField
              id="nickname-edit"
              value={nicknameValue}
              error={nicknameError}
              disabled={isSaving}
              autoFocus
              onChange={onNicknameChange}
            />
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" disabled={isSaving} />}>
                취소
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "저장하는 중…" : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
