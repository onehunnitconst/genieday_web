"use client";

import { PartnerView } from "./partner-view";
import { usePartner } from "./use-partner";

/** 파트너 연결 코드 발급과 연결 해제. AuthGateContainer 안에서만 쓸 수 있다. */
export function PartnerContainer() {
  const vm = usePartner();

  return (
    <PartnerView
      card={vm.card}
      isBusy={vm.isBusy}
      error={vm.error}
      isCopied={vm.isCopied}
      onIssueCode={vm.issueCode}
      onCopyCode={vm.copyCode}
      onCancelInvite={vm.cancelInvite}
      onUnlink={vm.unlink}
    />
  );
}
