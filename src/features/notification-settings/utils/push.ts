/** 이 브라우저에서 웹 푸시를 받을 수 있는지. iOS는 홈 화면에 추가한 앱에서만 된다. */
export type PushSupport = "supported" | "needs-install" | "unsupported";

export const detectPushSupport = (): PushSupport => {
  if ("serviceWorker" in navigator && "PushManager" in window && "Notification" in window) {
    return "supported";
  }
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS Safari는 Mac으로 자신을 알린다
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
  return isIos ? "needs-install" : "unsupported";
};

/** VAPID 공개키(Base64URL)를 PushManager.subscribe가 받는 바이트로 바꾼다. */
export const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};
