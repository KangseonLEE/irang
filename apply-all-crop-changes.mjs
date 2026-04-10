#!/usr/bin/env node
/**
 * crops.ts 종합 수정 스크립트 — 모든 변경을 단일 패스로 적용
 *
 * 현재 파일 상태: arugula/mango 이미 추가됨, CultivationStep 인터페이스 존재
 * 필요한 변경:
 * 1. InvestmentDetail, ExternalResource 인터페이스 추가
 * 2. CropDetailInfo에 investmentDetail?, externalResources? 필드 추가
 * 3. 전체 19개 작물에 investmentDetail 추가
 * 4. 전체 19개 작물에 externalResources 추가
 */

import { readFileSync, writeFileSync } from "fs";

const FILE = "src/lib/data/crops.ts";
let code = readFileSync(FILE, "utf-8");
console.log(`📖 원본 파일 읽기 완료 (${code.split("\n").length}줄, ${code.length}자)`);

// ═══════════════════════════════════════════════════════════════════
// STEP 1: 인터페이스 추가 (ProsConsInfo 뒤, CropDetailInfo 앞)
// ═══════════════════════════════════════════════════════════════════

const interfacesBlock = `
/** 투자·노력 상세 — "이 수익을 얻으려면 얼마나 필요한가" */
export interface InvestmentDetail {
  /** 초기 투자 비용 (시설·묘목·장비 등) */
  initialCost: string;
  /** 연간 운영 비용 (난방·인건비·자재 등) */
  annualOperatingCost: string;
  /** 손익분기점까지 기간 */
  breakEvenPeriod: string;
  /** 안정 수익을 위한 최소 권장 면적 */
  minimumArea: string;
  /** 연간 주요 작업 노동일수 또는 강도 */
  annualLaborDays: string;
}

/** 외부 콘텐츠 (유튜브·블로그 큐레이션) */
export interface ExternalResource {
  type: "youtube" | "blog";
  title: string;
  url: string;
  /** 유튜브: 썸네일 URL, 블로그: OG 이미지 (선택) */
  thumbnail?: string;
  /** 블로그 출처명 (네이버 블로그, 티스토리 등) */
  source?: string;
}
`;

// CropDetailInfo JSDoc 주석 바로 앞에 삽입
const cropDetailJsDoc = "/** 작물 상세 정보 — CropInfo.id로 1:1 매핑 */";
const jsDocPos = code.indexOf(cropDetailJsDoc);
if (jsDocPos === -1) {
  console.error("❌ CropDetailInfo JSDoc 주석을 찾을 수 없습니다.");
  process.exit(1);
}
code = code.slice(0, jsDocPos) + interfacesBlock + "\n" + code.slice(jsDocPos);
console.log("✅ STEP 1: InvestmentDetail, ExternalResource 인터페이스 추가 완료");

// ═══════════════════════════════════════════════════════════════════
// STEP 2: CropDetailInfo에 새 필드 추가
// ═══════════════════════════════════════════════════════════════════

// 현재 CropDetailInfo의 마지막 필드는 cultivationSteps
const oldFields = `  /** 재배 방법 (단계별) */
  cultivationSteps?: CultivationStep[];
}`;

const newFields = `  /** 재배 방법 (단계별) */
  cultivationSteps?: CultivationStep[];
  investmentDetail?: InvestmentDetail;
  externalResources?: ExternalResource[];
}`;

if (!code.includes(oldFields)) {
  console.error("❌ CropDetailInfo의 기존 필드를 찾을 수 없습니다.");
  console.error("검색 문자열:", JSON.stringify(oldFields));
  // 디버깅: CropDetailInfo 부분 출력
  const detailInfoPos = code.indexOf("export interface CropDetailInfo");
  if (detailInfoPos !== -1) {
    console.error("현재 CropDetailInfo:", code.slice(detailInfoPos, detailInfoPos + 400));
  }
  process.exit(1);
}
code = code.replace(oldFields, newFields);
console.log("✅ STEP 2: CropDetailInfo에 investmentDetail?, externalResources? 필드 추가 완료");

// ═══════════════════════════════════════════════════════════════════
// STEP 3: 전체 19개 작물에 investmentDetail 추가
// ═══════════════════════════════════════════════════════════════════

const investmentData = {
  rice: {
    initialCost: "농기계(이앙기·콤바인) 구입 또는 임차 2,000~5,000만 원",
    annualOperatingCost: "ha당 비료·농약·연료 등 약 300~400만 원",
    breakEvenPeriod: "1~2년차부터 수익 발생 (기계 임차 시 초년도 가능)",
    minimumArea: "논 1ha(3,000평) 이상이어야 기계화 효율",
    annualLaborDays: "연 40~60일 (이앙·수확기 집중, 그 외 여유)",
  },
  soybean: {
    initialCost: "종자·비료 위주 500만 원 미만 (논콩 활용 시 추가 비용 적음)",
    annualOperatingCost: "ha당 약 150~250만 원",
    breakEvenPeriod: "첫 해부터 수익 가능",
    minimumArea: "3,000㎡(약 900평) 이상 권장",
    annualLaborDays: "연 30~50일 (파종·수확기 집중)",
  },
  "sweet-potato": {
    initialCost: "묘 구입·비닐멀칭·소형 농기계 등 1,000~2,000만 원",
    annualOperatingCost: "ha당 약 400~600만 원 (묘·멀칭·비료·인건비)",
    breakEvenPeriod: "1~2년차부터 수익 발생",
    minimumArea: "1,000㎡(약 300평) 이상이면 시작 가능",
    annualLaborDays: "연 50~80일 (수확기 집중 노동)",
  },
  potato: {
    initialCost: "씨감자·농기계·저온저장고 등 1,500~3,000만 원",
    annualOperatingCost: "ha당 약 400~600만 원 (씨감자·농약·비료)",
    breakEvenPeriod: "1~2년차부터 수익 발생 (저장고 투자 시 3년)",
    minimumArea: "3,000㎡(약 900평) 이상 권장",
    annualLaborDays: "연 40~60일 (파종·수확기 집중)",
  },
  corn: {
    initialCost: "종자·비닐멀칭·소형 농기계 등 500~1,000만 원",
    annualOperatingCost: "ha당 약 200~350만 원",
    breakEvenPeriod: "첫 해부터 수익 가능",
    minimumArea: "2,000㎡(약 600평) 이상 권장",
    annualLaborDays: "연 30~50일 (재배 기간이 짧아 부담 적음)",
  },
  "chili-pepper": {
    initialCost: "비가림 시설·건조기·묘 구입 등 2,000~4,000만 원",
    annualOperatingCost: "ha당 약 600~1,000만 원 (농약·인건비 비중 높음)",
    breakEvenPeriod: "2~3년차 (비가림 시설 투자 회수 포함)",
    minimumArea: "1,000~2,000㎡(300~600평) 권장 (초보자 기준)",
    annualLaborDays: "연 80~120일 (수확·건조·방제 등 연중 관리)",
  },
  "napa-cabbage": {
    initialCost: "종자·비료·농기계 임차 등 500~1,500만 원",
    annualOperatingCost: "ha당 약 300~500만 원",
    breakEvenPeriod: "첫 해부터 수익 가능 (가격 변동에 따라 차이)",
    minimumArea: "3,000㎡(약 900평) 이상 권장",
    annualLaborDays: "연 40~70일 (정식·수확기 집중)",
  },
  garlic: {
    initialCost: "종구(씨마늘)·농기계 등 1,500~3,000만 원 (종구비 비중 높음)",
    annualOperatingCost: "ha당 약 500~800만 원",
    breakEvenPeriod: "1~2년차부터 수익 발생",
    minimumArea: "2,000㎡(약 600평) 이상 권장",
    annualLaborDays: "연 50~80일 (심기·수확기 집중 노동)",
  },
  onion: {
    initialCost: "묘 구입·저장시설·농기계 등 1,500~3,000만 원",
    annualOperatingCost: "ha당 약 400~700만 원 (묘·정식 인건비 비중 높음)",
    breakEvenPeriod: "1~2년차 (저장시설 투자 시 3년)",
    minimumArea: "3,000㎡(약 900평) 이상 권장",
    annualLaborDays: "연 50~80일 (정식·수확기 집중)",
  },
  lettuce: {
    initialCost: "비닐하우스 시설 1,000~3,000만 원 (규모에 따라 차이)",
    annualOperatingCost: "10a당 약 150~300만 원 (난방·종자·비료)",
    breakEvenPeriod: "1~2년차부터 수익 발생",
    minimumArea: "100~200평 하우스로 시작 가능",
    annualLaborDays: "연 200일 이상 (매일 수확·포장 반복)",
  },
  apple: {
    initialCost: "묘목·지주·방조망·관수 시설 등 ha당 3,000~6,000만 원",
    annualOperatingCost: "ha당 약 800~1,200만 원 (농약·비료·인건비)",
    breakEvenPeriod: "5~7년 (식재 후 3~5년 무수확 + 초기 수확 2년)",
    minimumArea: "3,000㎡(약 1,000평) 이상 권장",
    annualLaborDays: "연 150~200일 (전정·적과·수확 등 연중 관리)",
  },
  pear: {
    initialCost: "묘목·지주·수분수·방조망 등 ha당 3,000~5,000만 원",
    annualOperatingCost: "ha당 약 700~1,100만 원 (봉지·인건비·농약)",
    breakEvenPeriod: "6~8년 (식재 후 4~5년 무수확)",
    minimumArea: "3,000㎡(약 1,000평) 이상 권장",
    annualLaborDays: "연 150~200일 (인공수분·전정·봉지씌우기·수확)",
  },
  grape: {
    initialCost: "비가림 시설·덕 설치·묘목 등 ha당 4,000~8,000만 원",
    annualOperatingCost: "ha당 약 800~1,500만 원 (시설유지·인건비·농약)",
    breakEvenPeriod: "4~6년 (식재 후 2~3년 무수확)",
    minimumArea: "2,000㎡(약 600평) 이상 권장",
    annualLaborDays: "연 150~200일 (적방·적과·수확 등 세밀 작업)",
  },
  citrus: {
    initialCost: "묘목·하우스(만감류) 등 ha당 2,000~6,000만 원",
    annualOperatingCost: "ha당 약 600~1,200만 원 (난방비 변동 큼)",
    breakEvenPeriod: "4~6년 (식재 후 3~4년 무수확)",
    minimumArea: "3,000㎡(약 1,000평) 이상 권장",
    annualLaborDays: "연 120~180일 (적과·수확·전정·방제)",
  },
  strawberry: {
    initialCost: "하우스·난방·양액·고설베드 등 10a당 5,000만~1억 원",
    annualOperatingCost: "10a당 약 1,500~2,500만 원 (난방·인건비·자재)",
    breakEvenPeriod: "3~5년 (시설 투자 회수 기간)",
    minimumArea: "100~200평 하우스로 시작 가능",
    annualLaborDays: "연 250일 이상 (겨울 내내 매일 수확·관리)",
  },
  ginseng: {
    initialCost: "해가림 시설·묘삼·토지 임차 등 ha당 5,000만~1억 원",
    annualOperatingCost: "ha당 약 500~800만 원 (병해 방제·시설 유지)",
    breakEvenPeriod: "6~8년 (4~6년 재배 + 투자 회수 2년)",
    minimumArea: "3,000㎡(약 1,000평) 이상 권장",
    annualLaborDays: "연 80~120일 (해가림 관리·병해 방제 중심)",
  },
  sesame: {
    initialCost: "종자·비료·소형 농기계 등 300~500만 원",
    annualOperatingCost: "10a당 약 50~100만 원",
    breakEvenPeriod: "첫 해부터 수익 가능",
    minimumArea: "1,000㎡(약 300평) 이상이면 시작 가능",
    annualLaborDays: "연 30~50일 (수확기 집중 노동)",
  },
  arugula: {
    initialCost: "비닐하우스·관수 시설 등 500~1,500만 원 (노지 시 더 적음)",
    annualOperatingCost: "10a당 약 100~200만 원 (종자·비료·수도)",
    breakEvenPeriod: "첫 해부터 수익 가능 (회전율 높음)",
    minimumArea: "100평 이상이면 시작 가능",
    annualLaborDays: "연 60~100일 (연중 다회 수확 시)",
  },
  mango: {
    initialCost: "보온 하우스·묘목·난방 설비 등 10a당 1억~2억 원",
    annualOperatingCost: "10a당 약 2,000~3,000만 원 (난방비 비중 매우 높음)",
    breakEvenPeriod: "5~8년 (식재 후 3~4년 무수확 + 시설 투자 회수)",
    minimumArea: "200~300평 하우스 이상 권장",
    annualLaborDays: "연 200일 이상 (온도 관리·수분·적과·수확 등 연중 관리)",
  },
};

function formatInvestmentDetail(data) {
  return `    investmentDetail: {
      initialCost: "${data.initialCost}",
      annualOperatingCost: "${data.annualOperatingCost}",
      breakEvenPeriod: "${data.breakEvenPeriod}",
      minimumArea: "${data.minimumArea}",
      annualLaborDays: "${data.annualLaborDays}",
    },`;
}

// investmentDetail 삽입 위치: 각 crop의 마지막 필드 뒤
// arugula/mango는 cultivationSteps가 있고, 기존 17개는 prosCons가 마지막
// 전략: cultivationSteps가 있으면 그 뒤, 없으면 prosCons verdict 뒤의 `    },` 뒤

const detailsSectionStart = code.indexOf("export const CROP_DETAILS");
const investCropIds = Object.keys(investmentData).reverse();
let investSuccessCount = 0;

for (const cropId of investCropIds) {
  const idPattern = `id: "${cropId}",`;
  const idPos = code.indexOf(idPattern, detailsSectionStart);

  if (idPos === -1) {
    console.error(`  ❌ ${cropId}: CROP_DETAILS에서 id를 찾을 수 없음`);
    continue;
  }

  // 이미 investmentDetail이 있는지 확인 (해당 crop 범위 내)
  const nextCropPos = code.indexOf('id: "', idPos + 10);
  const cropEndBound = nextCropPos === -1 ? code.length : nextCropPos;
  const cropBlock = code.slice(idPos, cropEndBound);

  if (cropBlock.includes("investmentDetail:")) {
    console.log(`  ⏭️  ${cropId}: investmentDetail 이미 존재, 스킵`);
    continue;
  }

  // cultivationSteps가 있는 crop (arugula, mango)
  const cultStepsPos = code.indexOf("cultivationSteps:", idPos);
  let insertPos;

  if (cultStepsPos !== -1 && cultStepsPos < cropEndBound) {
    // cultivationSteps 배열의 끝 `    ],` 찾기
    const stepsArrayStart = code.indexOf("[", cultStepsPos);
    // 중첩된 배열에 주의하여 올바른 닫는 괄호 찾기
    let depth = 0;
    let pos = stepsArrayStart;
    while (pos < code.length) {
      if (code[pos] === "[") depth++;
      if (code[pos] === "]") {
        depth--;
        if (depth === 0) break;
      }
      pos++;
    }
    // `],` 뒤의 줄바꿈 위치
    const closeBracket = pos; // `]` 위치
    const lineEnd = code.indexOf("\n", closeBracket);
    insertPos = lineEnd + 1;
  } else {
    // prosCons의 verdict 뒤의 `    },` 찾기
    const prosConsStart = code.indexOf("prosCons:", idPos);
    if (prosConsStart === -1 || prosConsStart > cropEndBound) {
      console.error(`  ❌ ${cropId}: prosCons를 찾을 수 없음`);
      continue;
    }

    const verdictPos = code.indexOf("verdict:", prosConsStart);
    if (verdictPos === -1 || verdictPos > cropEndBound) {
      console.error(`  ❌ ${cropId}: verdict를 찾을 수 없음`);
      continue;
    }

    const prosConsClose = code.indexOf("    },", verdictPos);
    if (prosConsClose === -1) {
      console.error(`  ❌ ${cropId}: prosCons 닫는 괄호를 찾을 수 없음`);
      continue;
    }

    const lineEnd = code.indexOf("\n", prosConsClose);
    insertPos = lineEnd + 1;
  }

  const formatted = formatInvestmentDetail(investmentData[cropId]);
  code = code.slice(0, insertPos) + formatted + "\n" + code.slice(insertPos);
  investSuccessCount++;
}
console.log(`✅ STEP 3: ${investSuccessCount}/19 작물에 investmentDetail 추가 완료`);

// ═══════════════════════════════════════════════════════════════════
// STEP 4: 전체 19개 작물에 externalResources 추가
// ═══════════════════════════════════════════════════════════════════

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

function formatExternalResources(resources) {
  const items = resources.map((r) => {
    const parts = [`        type: "${r.type}"`, `        title: "${r.title}"`, `        url: "${r.url}"`];
    if (r.thumbnail) parts.push(`        thumbnail: "${r.thumbnail}"`);
    if (r.source) parts.push(`        source: "${r.source}"`);
    return `      {\n${parts.join(",\n")},\n      }`;
  });
  return `    externalResources: [\n${items.join(",\n")},\n    ],`;
}

// externalResources는 investmentDetail 블록 뒤에 삽입
const detailsSectionStart2 = code.indexOf("export const CROP_DETAILS");
const extCropIds = Object.keys(externalResources).reverse();
let extSuccessCount = 0;

for (const cropId of extCropIds) {
  const idPattern = `id: "${cropId}",`;
  const idPos = code.indexOf(idPattern, detailsSectionStart2);

  if (idPos === -1) {
    console.error(`  ❌ ${cropId}: externalResources — CROP_DETAILS에서 id를 찾을 수 없음`);
    continue;
  }

  // investmentDetail 블록 찾기
  const investPos = code.indexOf("investmentDetail:", idPos);
  const nextCropPos2 = code.indexOf('id: "', idPos + 10);
  const cropEndBound2 = nextCropPos2 === -1 ? code.length : nextCropPos2;

  if (investPos === -1 || investPos > cropEndBound2) {
    console.error(`  ❌ ${cropId}: externalResources — investmentDetail을 찾을 수 없음`);
    continue;
  }

  // annualLaborDays 이후의 `    },` 찾기
  const laborDaysPos = code.indexOf("annualLaborDays:", investPos);
  if (laborDaysPos === -1) {
    console.error(`  ❌ ${cropId}: externalResources — annualLaborDays를 찾을 수 없음`);
    continue;
  }

  const investClose = code.indexOf("    },", laborDaysPos);
  if (investClose === -1) {
    console.error(`  ❌ ${cropId}: externalResources — investmentDetail 닫는 괄호를 찾을 수 없음`);
    continue;
  }

  const lineEnd = code.indexOf("\n", investClose);
  const insertPos = lineEnd + 1;

  // 이미 있는지 확인
  const nextChunk = code.slice(insertPos, insertPos + 200);
  if (nextChunk.includes("externalResources:")) {
    console.log(`  ⏭️  ${cropId}: externalResources 이미 존재, 스킵`);
    continue;
  }

  const formatted = formatExternalResources(externalResources[cropId]);
  code = code.slice(0, insertPos) + formatted + "\n" + code.slice(insertPos);
  extSuccessCount++;
}
console.log(`✅ STEP 4: ${extSuccessCount}/19 작물에 externalResources 추가 완료`);

// ═══════════════════════════════════════════════════════════════════
// 저장
// ═══════════════════════════════════════════════════════════════════

const finalLines = code.split("\n").length;
writeFileSync(FILE, code, "utf-8");
console.log(`\n💾 ${FILE} 저장 완료 (${finalLines}줄)`);
console.log(`📊 요약: 인터페이스 2개, investmentDetail ${investSuccessCount}/19, externalResources ${extSuccessCount}/19`);
