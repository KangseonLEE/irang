/**
 * 공유 링크 꼬리표 (2026-10-20) — 공유 버튼이 만드는 링크에 utm 을 붙여, 받은 사람이 어디서 왔는지 남긴다.
 *
 * 카카오톡·메일 앱으로 연 링크는 유입 주소(referrer)가 비어 '직접'으로 잡힌다. 우리가 만든 링크라면
 * 꼬리표로 출처를 박아 둘 수 있다. 받는 쪽은 lib/assess-entry 의 captureLandingTags 가 첫 방문 때 읽는다.
 *
 *   utm_source   = kakao(카카오 공유) · copy_link(링크 복사) · share_sheet(휴대폰 공유 창)
 *   utm_medium   = share
 *   utm_campaign = 공유한 내용(GA contentType 과 같은 값, 예: assess_result·region)
 *
 * 목록 페이지 정규화(normalize.ts TRACKING_PARAM_KEYS)가 utm 을 지우지 않는다.
 */

export type ShareChannel = "kakao" | "copy_link" | "share_sheet";

export function tagShareUrl(url: string, channel: ShareChannel, campaign: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  parsed.searchParams.set("utm_source", channel);
  parsed.searchParams.set("utm_medium", "share");
  const safeCampaign = campaign.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 40);
  if (safeCampaign) parsed.searchParams.set("utm_campaign", safeCampaign);
  return parsed.toString();
}
