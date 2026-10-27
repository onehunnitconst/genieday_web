/** 내 계정의 파트너 연결 상태 */
export type PartnerStatus =
  | { kind: "none" }
  /** 연결 코드를 만들었고 파트너가 아직 입력하지 않음. expiresAt은 ISO 시각 */
  | { kind: "invited"; code: string; expiresAt: string }
  /** 파트너가 코드를 입력해 연결됨. linkedAt은 ISO 시각 */
  | { kind: "linked"; nickname: string; linkedAt: string };
