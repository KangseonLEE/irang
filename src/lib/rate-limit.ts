/**
 * 인메모리 슬라이딩 윈도 rate limiter (Serverless 인스턴스 단위).
 * /api/assess 의 인라인 구현과 같은 패턴을 재사용 가능하게 분리 (2026-09-02, 커뮤니티 API용).
 * 인스턴스가 바뀌면 카운트가 초기화되므로 영속 보조(DB 카운트)와 함께 쓴다.
 */
export function createRateLimiter(opts: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  function sweep(now: number) {
    for (const [key, val] of hits) {
      if (now > val.resetAt) hits.delete(key);
    }
  }

  return {
    /** true 면 제한 초과 */
    isLimited(key: string): boolean {
      const now = Date.now();
      if (hits.size > 5_000) sweep(now);
      const entry = hits.get(key);
      if (!entry || now > entry.resetAt) {
        hits.set(key, { count: 1, resetAt: now + opts.windowMs });
        return false;
      }
      entry.count++;
      return entry.count > opts.max;
    },
  };
}
