import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

/**
 * 로고 마크: 지니의 램프를 세 도형으로 단순화했다.
 * 위에서부터 물방울(뚜껑), 뿔이 위로 향한 초승달(본체), 반원(받침)이 서로 떨어져 쌓여 있다.
 * app/icon.svg, app/apple-icon.tsx, app/pwa-icons와 같은 모양이다. (64×64 좌표)
 * 모든 도형은 maskable 아이콘의 안전 영역(가운데 반지름 25.6) 안에 있다.
 */
export const LOGO_COLOR = "#E44065"; // --ohc-primary-500
export const LOGO_LAMP_COLOR = "#FEE7E9"; // --ohc-primary-100
export const LOGO_DROP_COLOR = "#FFFFFF";

/** 뒤에서 앞 순서. ImageResponse(아이콘 생성)에서도 그대로 그린다. */
export const LOGO_SHAPES: { d: string; fill: string }[] = [
  // 받침: 반원
  { d: "M21 53A11 11 0 0 1 43 53Z", fill: LOGO_LAMP_COLOR },
  // 본체: 얕고 넓게 누운 초승달
  { d: "M9 24A25.13 25.13 0 0 0 55 24A37.06 37.06 0 0 1 9 24Z", fill: LOGO_LAMP_COLOR },
  // 뚜껑: 물방울
  {
    d: "M32 11C32 11 27.5 19 27.5 23.5a4.5 4.5 0 0 0 9 0C36.5 19 32 11 32 11Z",
    fill: LOGO_DROP_COLOR,
  },
];

/** LOGO_SHAPES를 <path>로 그린다. <svg viewBox="0 0 64 64"> 안에 넣는다. */
export const renderLogoShapes = () =>
  LOGO_SHAPES.map((shape) => <path key={shape.d} d={shape.d} fill={shape.fill} />);

export function LogoMark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-8", className)} {...props}>
      <rect width="64" height="64" rx="16" fill={LOGO_COLOR} />
      {renderLogoShapes()}
    </svg>
  );
}

/** 마크 + 앱 이름 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-10" />
      <span className="font-brand text-heading-1 font-normal">지니데이</span>
    </span>
  );
}
