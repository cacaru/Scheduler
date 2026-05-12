/**
 * 가벼운 UUID v4 생성기 (Math.random 기반, 비암호학적).
 * DB PK 용도로는 충분하며 폴리필 의존이 없어 web/RN 모두에서 즉시 동작한다.
 * 보안 목적의 토큰엔 사용 금지.
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
