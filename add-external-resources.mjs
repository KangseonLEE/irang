#!/usr/bin/env node
/**
 * crops.ts의 모든 CROP_DETAILS 엔트리에 externalResources를 추가하는 스크립트.
 * investmentDetail 블록 뒤에 삽입합니다.
 */

import { readFileSync, writeFileSync } from "fs";

const FILE = "src/lib/data/crops.ts";
let code = readFileSync(FILE, "utf-8");

const YT = (id, title) => ({
  type: "youtube", title,
  url: `https://www.youtube.com/watch?v=${id}`,
  thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
});

const BLOG = (title, url, source) => ({ type: "blog", title, url, source });

const externalResources = {
  rice: [
    YT("AlqPtOC5blw", "쌀값 올리는 비밀, 진짜 있었다.. 벼농사 50년 노하우 공개"),
    YT("8Dl-DAxnbVc", "벼농사 출수후 물관리 · 병해충 방제 (도열병, 벼멸구 등)"),
    BLOG("쌀 농사 과정", "https://brunch.co.kr/@paxcom/85", "브런치"),
  ],
  soybean: [
    YT("ahJcQikLCWs", "이놈을 막지 못하면 콩농사는 헛방!"),
    YT("5fngEcx3Tpo", "부지런한 농민과 게으른 농민 — 콩농사에서 드러나는 진실"),
    BLOG("콩 키우기 / 콩 심는 시기 / 콩 심는 방법", "https://kwonnong.com/farminginfo/?bmode=view&idx=15230833", "권농종묘"),
  ],
  "sweet-potato": [
    YT("46v065GSyOQ", "싱싱한 고구마 순을 내 손으로 키운다! 씨고구마 싹 틔우기"),
    YT("f1oPm24a5h4", "고구마비료 — 칼리(K)질 비료성분 많은 이유?"),
    BLOG("고구마 키우기 / 고구마 심는시기 / 심는방법", "https://kwonnong.com/farminginfo/?bmode=view&idx=14484381", "권농종묘"),
  ],
  potato: [
    YT("dPDfMQXzKEw", "감자 전부 알려드립니다 | 감자 재배교육 총 정리"),
    YT("uaQ0zEyVQHU", "씨감자의 싹틔우기 결과가 감자순이 올라오는 기간에 미치는 영향"),
    BLOG("감자 키우기 / 감자 심는시기 / 감자 심는방법", "https://kwonnong.com/farminginfo/?bmode=view&idx=14413313", "권농종묘"),
  ],
  corn: [
    YT("8aR0035757Y", "옥수수 심을 밭에 밑거름 넣고 두둑을 이렇게 만드는 이유!"),
    YT("wXkjjvJBVq0", "F3 찰옥수수 첫수확 — 한포기에 수확량은 이것이 결정한다!"),
    BLOG("2024년 옥수수 심는 시기 및 재배방법 알아보기", "https://healthygirl.easycorp.kr/entry/2024%EB%85%84-%EC%98%A5%EC%88%98%EC%88%98-%EC%8B%AC%EB%8A%94-%EC%8B%9C%EA%B8%B0-%EB%B0%8F-%EC%9E%AC%EB%B0%B0%EB%B0%A9%EB%B2%95-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0", "텃밭일기"),
  ],
  "chili-pepper": [
    YT("ZAtVhrV6xHs", "고추모종 이식(가식)작업 — 고추농사 고추묘 키우기"),
    YT("NRdVBxqHTfw", "지금 익은 후물고추, 수확해야 하나요?!! 농사의 여신의 고추농사"),
    BLOG("고추 재배법", "https://brunch.co.kr/@jayyoon1/191", "브런치"),
  ],
  "napa-cabbage": [
    YT("mHWChpTSUJ0", "속이 꽉차고 단단한 배추 수확하려면 수확전 꼭! 해주세요"),
    YT("rk1eUtu2wGM", "배추농사 이렇게 했더니 대박났어요 — 노하우는?"),
    BLOG("배추 키우기 김장배추 심는 시기와 방법", "https://kwonnong.com/farminginfo/?bmode=view&idx=76961942", "권농종묘"),
  ],
  garlic: [
    YT("TAh8oB90Kk8", "마늘잎이 노랗게 변했다면? 당장 이것 안하면 다 썩고 마늘농사 폭망합니다"),
    YT("V68HuZjySqs", "3월에 이것 안 뿌리면 마늘 농사 망칩니다! 굵고 단단한 마늘 만드는 비결"),
    BLOG("마늘 심는 시기 마늘 심는 방법 알아보기", "https://kwonnong.com/farminginfo/?bmode=view&idx=16577405", "권농종묘"),
  ],
  onion: [
    YT("rCCjRffODeQ", "양파 지금 심어도될까? 한겨울에도 견디는 양파 품종 심는팁 3가지"),
    YT("9dh_1hiixaI", "양파농사 어떻게 준비하세요?"),
    BLOG("양파 키우기 — 양파 심는 시기와 심는 방법", "https://kwonnong.com/farminginfo/?bmode=view&idx=16104305", "권농종묘"),
  ],
  lettuce: [
    YT("eCHUFY9hXH4", "추운 겨울에 거실에서 키우는 상추 1차 수확!"),
    YT("uEXv3Ya7FZs", "강추위 속에서 상추 쑥갓을 파종하여 키우는 2가지 방법"),
    BLOG("상추 키우기 / 상추 심는 시기 / 상추 심는 방법", "https://kwonnong.com/farminginfo/?bmode=view&idx=14543744", "권농종묘"),
  ],
  apple: [
    YT("HQVv19CoH7g", "9월 사과나무 유목관리 / 2년생 생육상태"),
    YT("rV_qE57LLVE", "사과 조류피해 이렇게 하면 새가 도망갑니다 [사과재배]"),
    BLOG("사과나무 재배법 (개화시기, 인공수분, 착과, 적과 시기와 방법)", "https://furune.info/449", "푸른하늘"),
  ],
  pear: [
    YT("dgWnYLkXLic", "3년차 배나무 지지대 설치하고, 수형잡고, 가지치기"),
    YT("d8ujda9XmSI", "배 해충, 주경배나무이 — 배나무 병해충 관리"),
    BLOG("배 재배 일정 및 관리 기술", "https://nongsaro.go.kr/portal/ps/psb/psbl/workScheduleDtl.ps?cntntsNo=30661&menuId=PS00087", "농사로"),
  ],
  grape: [
    YT("tH-rlgeuyLY", "샤인머스켓 재배방법 · 포도경매가격 · 수확 비닐하우스 귀농귀촌"),
    YT("04es-lmgP_U", "포도나무 3년차 — V형 지지대 이렇게 설치한다! [포도재배]"),
    BLOG("포도 재배법 — 다락골사랑 블로그", "http://blog.daum.net/_blog/BlogTypeView.do?articleno=543&blogid=0TcG5&categoryId=16&regdt=20130604214210", "다음 블로그"),
  ],
  citrus: [
    YT("7wjfTSsw54o", "과일의 품질을 높이는 스테비아 감귤에 1년 동안 사용했더니 무엇이 달라졌을까요?"),
    YT("8-kaSWMqN08", "감귤방제 보르도칼과 기계유로 살균 및 응애, 진딧물 방제 방법"),
    BLOG("귀농 6년 째, 귤 농사는 사면초가", "https://www.jejusori.net/news/articleView.html?idxno=174524", "제주의소리"),
  ],
  strawberry: [
    YT("zzsqX3oSqfc", "스마트팜 46일 매출공개 / 딸기농장 / 매출 / 귀농 / 수익"),
    YT("Vvcv4Oe-OUk", "[딸기 일지#3] 스마트팜(수경재배)에서 2달 만에 딸기 재배"),
    BLOG("딸기 재배 방법 :: 알콩달콩 귀농생활", "https://blog.daum.net/interworld/207", "다음 블로그"),
  ],
  ginseng: [
    YT("KEWcoCxvXZU", "텃밭 인삼재배 — 묘상 만들기, 배양토 만들기, 묘삼 심는방법"),
    YT("BNGR2-irCDs", "화분·스티로폼으로 새싹삼 아주 쉽게 키우는방법"),
    BLOG("인삼 수경재배의 재배 절차 (18화)", "https://brunch.co.kr/@jupiter/144", "브런치"),
  ],
  sesame: [
    YT("CN3BbH2iTBM", "참깨 빈꼬투리 안생기게 하려면 확실히 잘라줘야 통통한 참깨 수확해요"),
    YT("rln7sYvdvm4", "농사 짓기 쉬운 참깨농사!!!! 수익도 엄청 좋아요~"),
    BLOG("참깨재배 (파종방법, 발아, 수확시기, 종자소독, 밑거름 시비량)", "https://furune.info/159", "푸른하늘"),
  ],
  arugula: [
    YT("CIHoQ68OXWk", "지금 심으면 폭풍성장 대박나는 작물 — 뿌리 쪼개 심으면 최대 20배"),
    BLOG("루꼴라 키우기 : 3천원짜리 씨앗으로 부자가 됐다", "https://brunch.co.kr/@binah/5", "브런치"),
  ],
  mango: [
    YT("ZwhNYUHvNEY", "1200평 6년차 애플망고 농사 수익은? 망고도 샤인머스켓처럼 시장포화일까?"),
    YT("x4Dk-zpcez0", "애플망고가 고소득작물??? 잘키워야 고소득 작물입니다!"),
    BLOG("딸기 이어 애플망고 재배 도전…'땀과 노력 결실 보았죠'", "https://www.nongmin.com/article/20240108500634", "농민신문"),
  ],
};

// ── externalResources 삽입 ──────────────────────────────────────────
// 전략: 각 crop의 investmentDetail 블록 끝(`    },` 줄)을 찾아서
//        그 뒤에 externalResources를 삽입

function formatResources(resources) {
  const items = resources.map((r) => {
    const parts = [`        type: "${r.type}"`, `        title: "${r.title}"`, `        url: "${r.url}"`];
    if (r.thumbnail) parts.push(`        thumbnail: "${r.thumbnail}"`);
    if (r.source) parts.push(`        source: "${r.source}"`);
    return `      {\n${parts.join(",\n")},\n      }`;
  });
  return `    externalResources: [\n${items.join(",\n")},\n    ],`;
}

const detailsSectionStart = code.indexOf("export const CROP_DETAILS");
let successCount = 0;

// 역순으로 처리 (뒤에서부터 삽입해야 앞의 위치가 밀리지 않음)
const cropIds = Object.keys(externalResources).reverse();

for (const cropId of cropIds) {
  const idPattern = `id: "${cropId}",`;
  const idPos = code.indexOf(idPattern, detailsSectionStart);

  if (idPos === -1) {
    console.error(`❌ ${cropId}: CROP_DETAILS에서 id를 찾을 수 없음`);
    continue;
  }

  // investmentDetail 블록 찾기
  const investPos = code.indexOf("investmentDetail:", idPos);
  if (investPos === -1 || investPos > idPos + 5000) {
    console.error(`❌ ${cropId}: investmentDetail을 찾을 수 없음`);
    continue;
  }

  // investmentDetail의 마지막 `    },` (4칸 인덴트) 찾기
  // annualLaborDays 줄 이후의 `    },`
  const laborDaysPos = code.indexOf("annualLaborDays:", investPos);
  if (laborDaysPos === -1) {
    console.error(`❌ ${cropId}: annualLaborDays를 찾을 수 없음`);
    continue;
  }

  const investClose = code.indexOf("    },", laborDaysPos);
  if (investClose === -1) {
    console.error(`❌ ${cropId}: investmentDetail 닫는 괄호를 찾을 수 없음`);
    continue;
  }

  const lineEnd = code.indexOf("\n", investClose);
  const insertPos = lineEnd + 1;

  // 이미 externalResources가 있는지 확인
  const nextChunk = code.slice(insertPos, insertPos + 200);
  if (nextChunk.includes("externalResources:")) {
    console.log(`⏭️  ${cropId}: externalResources 이미 존재, 스킵`);
    continue;
  }

  const formatted = formatResources(externalResources[cropId]);
  code = code.slice(0, insertPos) + formatted + "\n" + code.slice(insertPos);
  successCount++;
  console.log(`✅ ${cropId}: externalResources 추가 완료 (${externalResources[cropId].length}개)`);
}

console.log(`\n📊 결과: ${successCount}/19 작물에 externalResources 추가됨`);

writeFileSync(FILE, code, "utf-8");
console.log(`💾 ${FILE} 저장 완료`);
