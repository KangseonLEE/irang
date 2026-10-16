/**
 * Sentry 세션 리플레이 통합 — `instrumentation-client.ts` 가 첫 화면 뒤에 동적 import 로 붙인다 (2026-10-17).
 * 별도 모듈이어야 리플레이(rrweb) 코드가 첫 로드 청크에서 빠진다.
 */
import { replayIntegration } from "@sentry/nextjs";

export function createReplayIntegration() {
  return replayIntegration({
    // 에러 발생 시에만 리플레이 캡처 (10% — replaysOnErrorSampleRate)
    maskAllText: true,
    blockAllMedia: true,
    // 9/30 오류 보고 기능과 함께 명시 — 사용자가 "관리자에게 알리기"로 화면 정황을 보낼 때
    // 입력값(input·textarea·select)이 그대로 올라가지 않게 한다. SDK 기본값도 true 지만
    // 이 기능의 개인정보 전제라 의존하지 않고 못 박는다.
    maskAllInputs: true,
  });
}
