#!/usr/bin/env node
/**
 * crops.ts에 다음을 일괄 추가하는 스크립트:
 * 1. 기존 16개 작물에 investmentDetail 추가
 * 2. arugula, mango CROP_DETAILS 엔트리 추가 (investmentDetail 포함)
 *
 * 전략: 각 crop의 prosCons 블록 끝(verdict 줄의 `},` 다음)에 investmentDetail 삽입
 * arugula/mango는 파일 끝 `];` 앞에 전체 엔트리 삽입
 */

import { readFileSync, writeFileSync } from "fs";

const FILE = "src/lib/data/crops.ts";
let code = readFileSync(FILE, "utf-8");

// ── investmentDetail 데이터 (16개 기존 작물) ──────────────────────────

const investmentData = {
  rice: `    investmentDetail: {
      initialCost: "농기계(이앙기·콤바인) 구입 또는 임차 2,000~5,000만 원",
      annualOperatingCost: "ha당 비료·농약·연료 등 약 300~400만 원",
      breakEvenPeriod: "1~2년차부터 수익 발생 (기계 임차 시 초년도 가능)",
      minimumArea: "논 1ha(3,000평) 이상이어야 기계화 효율",
      annualLaborDays: "연 40~60일 (이앙·수확기 집중, 그 외 여유)",
    },`,
  soybean: `    investmentDetail: {
      initialCost: "종자·비료 위주 500만 원 미만 (논콩 활용 시 추가 비용 적음)",
      annualOperatingCost: "ha당 약 150~250만 원",
      breakEvenPeriod: "첫 해부터 수익 가능",
      minimumArea: "3,000㎡(약 900평) 이상 권장",
      annualLaborDays: "연 30~50일 (파종·수확기 집중)",
    },`,
  "sweet-potato": `    investmentDetail: {
      initialCost: "묘 구입·비닐멀칭·소형 농기계 등 1,000~2,000만 원",
      annualOperatingCost: "ha당 약 400~600만 원 (묘·멀칭·비료·인건비)",
      breakEvenPeriod: "1~2년차부터 수익 발생",
      minimumArea: "1,000㎡(약 300평) 이상이면 시작 가능",
      annualLaborDays: "연 50~80일 (수확기 집중 노동)",
    },`,
  potato: `    investmentDetail: {
      initialCost: "씨감자·농기계·저온저장고 등 1,500~3,000만 원",
      annualOperatingCost: "ha당 약 400~600만 원 (씨감자·농약·비료)",
      breakEvenPeriod: "1~2년차부터 수익 발생 (저장고 투자 시 3년)",
      minimumArea: "3,000㎡(약 900평) 이상 권장",
      annualLaborDays: "연 40~60일 (파종·수확기 집중)",
    },`,
  corn: `    investmentDetail: {
      initialCost: "종자·비닐멀칭·소형 농기계 등 500~1,000만 원",
      annualOperatingCost: "ha당 약 200~350만 원",
      breakEvenPeriod: "첫 해부터 수익 가능",
      minimumArea: "2,000㎡(약 600평) 이상 권장",
      annualLaborDays: "연 30~50일 (재배 기간이 짧아 부담 적음)",
    },`,
  "chili-pepper": `    investmentDetail: {
      initialCost: "비가림 시설·건조기·묘 구입 등 2,000~4,000만 원",
      annualOperatingCost: "ha당 약 600~1,000만 원 (농약·인건비 비중 높음)",
      breakEvenPeriod: "2~3년차 (비가림 시설 투자 회수 포함)",
      minimumArea: "1,000~2,000㎡(300~600평) 권장 (초보자 기준)",
      annualLaborDays: "연 80~120일 (수확·건조·방제 등 연중 관리)",
    },`,
  "napa-cabbage": `    investmentDetail: {
      initialCost: "종자·비료·농기계 임차 등 500~1,500만 원",
      annualOperatingCost: "ha당 약 300~500만 원",
      breakEvenPeriod: "첫 해부터 수익 가능 (가격 변동에 따라 차이)",
      minimumArea: "3,000㎡(약 900평) 이상 권장",
      annualLaborDays: "연 40~70일 (정식·수확기 집중)",
    },`,
  garlic: `    investmentDetail: {
      initialCost: "종구(씨마늘)·농기계 등 1,500~3,000만 원 (종구비 비중 높음)",
      annualOperatingCost: "ha당 약 500~800만 원",
      breakEvenPeriod: "1~2년차부터 수익 발생",
      minimumArea: "2,000㎡(약 600평) 이상 권장",
      annualLaborDays: "연 50~80일 (심기·수확기 집중 노동)",
    },`,
  onion: `    investmentDetail: {
      initialCost: "묘 구입·저장시설·농기계 등 1,500~3,000만 원",
      annualOperatingCost: "ha당 약 400~700만 원 (묘·정식 인건비 비중 높음)",
      breakEvenPeriod: "1~2년차 (저장시설 투자 시 3년)",
      minimumArea: "3,000㎡(약 900평) 이상 권장",
      annualLaborDays: "연 50~80일 (정식·수확기 집중)",
    },`,
  lettuce: `    investmentDetail: {
      initialCost: "비닐하우스 시설 1,000~3,000만 원 (규모에 따라 차이)",
      annualOperatingCost: "10a당 약 150~300만 원 (난방·종자·비료)",
      breakEvenPeriod: "1~2년차부터 수익 발생",
      minimumArea: "100~200평 하우스로 시작 가능",
      annualLaborDays: "연 200일 이상 (매일 수확·포장 반복)",
    },`,
  apple: `    investmentDetail: {
      initialCost: "묘목·지주·방조망·관수 시설 등 ha당 3,000~6,000만 원",
      annualOperatingCost: "ha당 약 800~1,200만 원 (농약·비료·인건비)",
      breakEvenPeriod: "5~7년 (식재 후 3~5년 무수확 + 초기 수확 2년)",
      minimumArea: "3,000㎡(약 1,000평) 이상 권장",
      annualLaborDays: "연 150~200일 (전정·적과·수확 등 연중 관리)",
    },`,
  pear: `    investmentDetail: {
      initialCost: "묘목·지주·수분수·방조망 등 ha당 3,000~5,000만 원",
      annualOperatingCost: "ha당 약 700~1,100만 원 (봉지·인건비·농약)",
      breakEvenPeriod: "6~8년 (식재 후 4~5년 무수확)",
      minimumArea: "3,000㎡(약 1,000평) 이상 권장",
      annualLaborDays: "연 150~200일 (인공수분·전정·봉지씌우기·수확)",
    },`,
  grape: `    investmentDetail: {
      initialCost: "비가림 시설·덕 설치·묘목 등 ha당 4,000~8,000만 원",
      annualOperatingCost: "ha당 약 800~1,500만 원 (시설유지·인건비·농약)",
      breakEvenPeriod: "4~6년 (식재 후 2~3년 무수확)",
      minimumArea: "2,000㎡(약 600평) 이상 권장",
      annualLaborDays: "연 150~200일 (적방·적과·수확 등 세밀 작업)",
    },`,
  citrus: `    investmentDetail: {
      initialCost: "묘목·하우스(만감류) 등 ha당 2,000~6,000만 원",
      annualOperatingCost: "ha당 약 600~1,200만 원 (난방비 변동 큼)",
      breakEvenPeriod: "4~6년 (식재 후 3~4년 무수확)",
      minimumArea: "3,000㎡(약 1,000평) 이상 권장",
      annualLaborDays: "연 120~180일 (적과·수확·전정·방제)",
    },`,
  strawberry: `    investmentDetail: {
      initialCost: "하우스·난방·양액·고설베드 등 10a당 5,000만~1억 원",
      annualOperatingCost: "10a당 약 1,500~2,500만 원 (난방·인건비·자재)",
      breakEvenPeriod: "3~5년 (시설 투자 회수 기간)",
      minimumArea: "100~200평 하우스로 시작 가능",
      annualLaborDays: "연 250일 이상 (겨울 내내 매일 수확·관리)",
    },`,
  ginseng: `    investmentDetail: {
      initialCost: "해가림 시설·묘삼·토지 임차 등 ha당 5,000만~1억 원",
      annualOperatingCost: "ha당 약 500~800만 원 (병해 방제·시설 유지)",
      breakEvenPeriod: "6~8년 (4~6년 재배 + 투자 회수 2년)",
      minimumArea: "3,000㎡(약 1,000평) 이상 권장",
      annualLaborDays: "연 80~120일 (해가림 관리·병해 방제 중심)",
    },`,
  sesame: `    investmentDetail: {
      initialCost: "종자·비료·소형 농기계 등 300~500만 원",
      annualOperatingCost: "10a당 약 50~100만 원",
      breakEvenPeriod: "첫 해부터 수익 가능",
      minimumArea: "1,000㎡(약 300평) 이상이면 시작 가능",
      annualLaborDays: "연 30~50일 (수확기 집중 노동)",
    },`,
};

// ── arugula & mango 완전한 CROP_DETAILS 엔트리 ──────────────────────

const arugulaEntry = `  {
    id: "arugula",
    cultivation: {
      climate: "서늘한 기후 선호, 생육적온 15~20℃, 고온에서 매운맛 강해짐",
      soil: "배수 양호한 양토~사질양토, 유기질 풍부한 토양",
      water: "생육 전 기간 고른 수분 공급, 과습에 주의",
      spacing: "이랑폭 20~25cm, 주간 10~15cm (밀식 가능)",
      fertilizerNote: "질소 비료 적정량, 과다 시 질산염 축적 우려",
    },
    income: {
      revenueRange: "10a당 약 300~600만 원 추정 (공식 통계 미등재)",
      costNote: "종자비 저렴, 하우스 시설비가 주요 투자",
      laborNote: "파종 후 20~30일 수확, 연중 다회 수확 가능",
    },
    majorRegions: ["경기도", "충청남도", "전라북도", "전라남도"],
    tips: [
      "파종 후 20~30일이면 수확 가능해 회전율이 매우 높습니다.",
      "서늘한 봄·가을이 최적기이며, 여름에는 차광망을 활용하세요.",
      "레스토랑·카페 직거래를 확보하면 일반 채소보다 높은 단가를 받을 수 있습니다.",
      "샐러드 믹스용으로 다른 엽채류(비타민, 적겨자 등)와 함께 재배하면 상품 가치가 올라갑니다.",
    ],
    relatedCropIds: ["lettuce", "napa-cabbage", "sesame"],
    prosCons: {
      pros: [
        { category: "수익성", text: "파종~수확이 20~30일로 회전율이 매우 높아 연간 다회 수확 가능" },
        { category: "시장성", text: "레스토랑·카페 등 외식업체 직거래 수요가 꾸준하고 프리미엄 단가" },
        { category: "재배난이도", text: "재배 기술이 단순하고, 소규모 하우스나 노지에서도 시작 가능" },
      ],
      cons: [
        { category: "시장성", text: "일반 소비자 인지도가 낮아 대량 유통 판로 확보가 어려움" },
        { category: "안정성", text: "여름 고온기에는 추대·매운맛 강화로 품질 관리가 까다로움" },
        { category: "수익성", text: "공식 통계가 미등재되어 소득 예측이 어렵고, 가격 변동 데이터 부족" },
      ],
      verdict: "소규모 틈새시장을 노리는 귀농인에게 적합 — 외식업체 직거래와 샐러드 믹스 전략이 핵심",
    },
    investmentDetail: {
      initialCost: "비닐하우스·관수 시설 등 500~1,500만 원 (노지 시 더 적음)",
      annualOperatingCost: "10a당 약 100~200만 원 (종자·비료·수도)",
      breakEvenPeriod: "첫 해부터 수익 가능 (회전율 높음)",
      minimumArea: "100평 이상이면 시작 가능",
      annualLaborDays: "연 60~100일 (연중 다회 수확 시)",
    },
  },`;

const mangoEntry = `  {
    id: "mango",
    cultivation: {
      climate: "열대 과수, 시설재배 기준 하우스 내 생육적온 24~27℃",
      soil: "배수 양호한 사질양토~양토, pH 5.5~6.5",
      water: "개화기 관수 절제로 착과 유도, 비대기 충분한 관수",
      spacing: "열간 4~5m, 주간 3~4m (하우스 내 밀식 가능)",
      fertilizerNote: "인산·칼리 위주, 질소 과다 시 수세 과다·착과 불량",
    },
    income: {
      revenueRange: "10a당 약 2,000~4,000만 원 (애플망고 기준)",
      costNote: "보온 하우스·난방비가 가장 큰 비용, 묘목비도 고가",
      laborNote: "온도 관리·수분 작업·적과·수확 등 연중 세밀한 관리 필요",
    },
    majorRegions: ["제주특별자치도", "전라남도", "경상남도"],
    tips: [
      "제주도와 전남 일부 지역에서만 시설재배가 가능합니다 — 겨울 최저 기온을 반드시 확인하세요.",
      "난방비가 전체 운영비의 40~50%를 차지하므로, 에너지 효율이 높은 시설 설계가 핵심입니다.",
      "애플망고(어윈 품종)가 국내 시장에서 가장 인기 있고 높은 단가를 받습니다.",
      "첫 수확까지 3~4년이 걸리므로, 그 사이 하우스 안에서 단기 작물을 병행 재배하세요.",
    ],
    relatedCropIds: ["citrus", "strawberry", "grape"],
    prosCons: {
      pros: [
        { category: "수익성", text: "10a당 2,000~4,000만 원으로 면적 대비 최고 수준의 수익" },
        { category: "시장성", text: "국산 애플망고 수요가 급증 중이고, 프리미엄 가격대로 판매 가능" },
        { category: "확장성", text: "체험농장·선물용·가공품(건망고·주스) 등 부가가치 창출 가능" },
      ],
      cons: [
        { category: "수익성", text: "보온 하우스·난방 설비 등 초기 투자 규모가 10a당 1억 원 이상" },
        { category: "안정성", text: "재배 가능 지역이 제주·남해안으로 극히 제한적" },
        { category: "재배난이도", text: "열대 과수 재배 경험과 온도·습도 정밀 제어 기술이 필수" },
      ],
      verdict: "높은 투자와 기술이 필요하지만 성공 시 최고 수준의 수익 — 제주·남해안 정착 계획자에게 적합",
    },
    investmentDetail: {
      initialCost: "보온 하우스·묘목·난방 설비 등 10a당 1억~2억 원",
      annualOperatingCost: "10a당 약 2,000~3,000만 원 (난방비 비중 매우 높음)",
      breakEvenPeriod: "5~8년 (식재 후 3~4년 무수확 + 시설 투자 회수)",
      minimumArea: "200~300평 하우스 이상 권장",
      annualLaborDays: "연 200일 이상 (온도 관리·수분·적과·수확 등 연중 관리)",
    },
  },`;

// ── 1단계: CROP_DETAILS 끝에 arugula / mango 엔트리 추가 ──────────

const detailsEndMarker = "];\n";
const lastCloseBracket = code.lastIndexOf(detailsEndMarker);
if (lastCloseBracket === -1) {
  console.error("❌ CROP_DETAILS 끝(];)을 찾을 수 없습니다.");
  process.exit(1);
}
code = code.slice(0, lastCloseBracket) + arugulaEntry + "\n" + mangoEntry + "\n" + detailsEndMarker;
console.log("✅ arugula + mango CROP_DETAILS 엔트리 추가 완료");

// ── 2단계: 기존 16개 작물에 investmentDetail 삽입 ──────────────────
// 전략: CROP_DETAILS 내 각 crop의 prosCons 블록 끝을 찾아서
//        prosCons의 마지막 `},`와 crop entry의 마지막 `},` 사이에 삽입
//
// 패턴: 각 crop의 verdict 문자열을 고유 키로 사용
//        verdict가 있는 줄 → 다음의 `    },` (prosCons 닫힘) → 그 뒤에 investmentDetail 삽입

const cropIds = Object.keys(investmentData);
let successCount = 0;

for (const cropId of cropIds) {
  // CROP_DETAILS 섹션에서 해당 crop의 id를 찾음
  const idPattern = `id: "${cropId}",`;
  const detailsSectionStart = code.indexOf("export const CROP_DETAILS");
  const idPos = code.indexOf(idPattern, detailsSectionStart);

  if (idPos === -1) {
    console.error(`❌ ${cropId}: CROP_DETAILS에서 id를 찾을 수 없음`);
    continue;
  }

  // 해당 crop의 prosCons 블록 찾기
  const prosConsStart = code.indexOf("prosCons:", idPos);
  if (prosConsStart === -1 || prosConsStart > idPos + 5000) {
    console.error(`❌ ${cropId}: prosCons를 찾을 수 없음`);
    continue;
  }

  // prosCons 내 verdict를 찾고, 그 뒤의 `    },` (prosCons 닫는 괄호)를 찾음
  const verdictPos = code.indexOf("verdict:", prosConsStart);
  if (verdictPos === -1 || verdictPos > prosConsStart + 3000) {
    console.error(`❌ ${cropId}: verdict를 찾을 수 없음`);
    continue;
  }

  // verdict 줄 이후 prosCons를 닫는 `    },` 찾기
  // 패턴: `    },` (4칸 인덴트)
  const prosConsClose = code.indexOf("    },", verdictPos);
  if (prosConsClose === -1) {
    console.error(`❌ ${cropId}: prosCons 닫는 괄호를 찾을 수 없음`);
    continue;
  }

  // prosCons `},` 줄의 끝 위치 (줄바꿈 포함)
  const lineEnd = code.indexOf("\n", prosConsClose);
  const insertPos = lineEnd + 1;

  // 이미 investmentDetail이 있는지 확인
  const nextChunk = code.slice(insertPos, insertPos + 100);
  if (nextChunk.includes("investmentDetail:")) {
    console.log(`⏭️  ${cropId}: investmentDetail 이미 존재, 스킵`);
    continue;
  }

  // 삽입
  code = code.slice(0, insertPos) + investmentData[cropId] + "\n" + code.slice(insertPos);
  successCount++;
  console.log(`✅ ${cropId}: investmentDetail 추가 완료`);
}

console.log(`\n📊 결과: ${successCount}/16 작물에 investmentDetail 추가됨`);

// ── 파일 저장 ──────────────────────────────────────────────────

writeFileSync(FILE, code, "utf-8");
console.log(`\n💾 ${FILE} 저장 완료`);
