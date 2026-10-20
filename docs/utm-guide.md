# 링크 꼬리표(utm) 규칙

> 2026-10-20. 직접 퍼뜨리는 링크(블로그·카페·메일·카톡 단톡방·인스타 프로필)에 꼬리표를 붙이면, 카카오톡·메일 앱처럼 출처가 안 남는 경로도 어드민 진단 결과 '어디서 왔나'와 GA 에서 갈라 볼 수 있다.

## 붙이는 법

주소 뒤에 `?utm_source=<어디>&utm_medium=<어떤 방식>&utm_campaign=<무엇>` 을 붙인다. 이미 `?` 가 있으면 `&` 로 잇는다.

```
https://irangfarm.com/crops/apple?utm_source=naver_blog&utm_medium=blog&utm_campaign=apple_post
https://irangfarm.com/match?mode=assess&utm_source=kakao_openchat&utm_medium=social&utm_campaign=guinong_room
```

- 값은 **영문 소문자·숫자·`_`·`-`·`.`만, 40자 안**. 한글·공백은 저장 단계에서 버려진다.
- `utm_medium` 은 아래 표의 값만 쓴다 — 어드민이 이 값으로 묶는다.

| utm_medium | 어드민 묶음 | 예시 utm_source |
|---|---|---|
| `share` | 공유 링크 | 공유 버튼이 자동으로 붙임(`kakao`·`copy_link`·`share_sheet`) — 손으로 쓰지 않는다 |
| `email` | 메일 | `newsletter`·`gmail_direct` |
| `social` | SNS·메신저·앱 | `kakao_openchat`·`instagram_bio`·`naver_cafe_post` |
| `blog` | SNS·메신저·앱 | `naver_blog`·`tistory` |

## 자동으로 붙는 것

- 사이트의 공유 버튼(카카오 공유·링크 복사·휴대폰 공유 창)은 `utm_source=kakao|copy_link|share_sheet&utm_medium=share&utm_campaign=<공유한 내용>` 을 붙인다 (`src/lib/share-tag.ts`).

## 동작

- 목록 페이지 정규화(`src/lib/search-params/normalize.ts` `TRACKING_PARAM_KEYS`)는 utm_*·gclid·fbclid 를 지우지 않는다. 형식이 틀린 값만 308 로 지운다.
- 세션 첫 방문의 utm_source·utm_medium 을 기억했다가(`src/lib/assess-entry.ts`) 진단 결과 저장 때 함께 남긴다.
- 꼬리표가 없을 때 어드민은 바깥 주소(referrer) → 앱 안 브라우저(user agent) 순으로 가른다. 메일 앱·외부 브라우저로 연 꼬리표 없는 링크는 '직접·알 수 없음'으로 남는다.
