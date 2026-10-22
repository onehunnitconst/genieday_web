import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

/**
 * 로고 마크: 둥근 사각형 위, 비스듬한 초승달과 그 안의 가는 초승달 위로 물방울이 떠 있는 모양.
 * app/icon.svg, app/apple-icon.tsx와 같은 모양이다. (64×64 좌표)
 */
export const LOGO_COLOR = "#e44065"; // --period (oklch(0.62 0.2 12))
export const LOGO_MOON_COLOR = "#ffe7e9"; // --period-soft
export const LOGO_DROP_PATH = "M40 10C40 10 33 17.5 33 23a7 7 0 0 0 14 0C47 17.5 40 10 40 10Z";
/** 큰 초승달 안쪽에 겹쳐 놓은 가는 초승달 */
export const LOGO_THIN_MOON_PATH = "M25.5 25.3A11 11 0 0 0 43.5 37.9A12 12 0 0 1 25.5 25.3Z";
export const LOGO_MOON_PATH = "M15.5 27.4A18 18 0 0 0 45 48A28 28 0 0 1 15.5 27.4Z";

export function LogoMark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-8", className)} {...props}>
      <rect width="64" height="64" rx="16" fill={LOGO_COLOR} />
      <path d={LOGO_MOON_PATH} fill={LOGO_MOON_COLOR} />
      <path d={LOGO_THIN_MOON_PATH} fill={LOGO_MOON_COLOR} />
      <path d={LOGO_DROP_PATH} fill="#fff" />
    </svg>
  );
}

/** 마크 + 앱 이름 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-10" />
      <span className="text-2xl font-semibold tracking-tight">Period Check</span>
    </span>
  );
}
