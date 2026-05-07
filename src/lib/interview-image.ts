/**
 * 인터뷰 인물 일러 경로 헬퍼
 *
 * 2026-05-07: codex-image로 생성한 농장 풍경 + 익명 silhouette 일러.
 * 2026-05-08: PNG → WebP 변환 (20배 압축, 동일 품질).
 * 실존 인물 초상화 회피, 작목·환경 중심 구성.
 *
 * 일러가 없는 인물은 null을 반환하고 호출자가 FarmerAvatar로 폴백한다.
 */

const ILLUSTRATED_PERSONS = new Set<string>([
  "bae-dongju",
  "jo-sungsu",
  "kang-namwook",
  "kim-gwanghun",
  "lee-gyuho",
  "lee-jonghyun",
  "yeom-sujeong",
]);

export function getInterviewImageSrc(personId: string): string | null {
  if (ILLUSTRATED_PERSONS.has(personId)) {
    return `/interviews/illustrations/${personId}.webp`;
  }
  return null;
}

export function getInterviewImageAbsoluteUrl(personId: string): string | null {
  const src = getInterviewImageSrc(personId);
  return src ? `https://irangfarm.com${src}` : null;
}
