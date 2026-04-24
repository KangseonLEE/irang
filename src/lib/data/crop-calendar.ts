/**
 * 작물별 월별 작업 캘린더 정적 데이터
 *
 * 출처: 농촌진흥청 재배력 / 농사로(nongsaro.go.kr) 작물별 재배 매뉴얼
 * 기준: 한국 중부(경기·충청) 기준. 남부/제주는 detail에 별도 표기.
 * 갱신 주기: 연 1회 (이랑-데이터갱신-운영가이드 준수)
 */

export interface MonthlyTask {
  month: number; // 1~12
  task: string; // 핵심 작업명 (짧게)
  detail: string; // 상세 설명 (1~2문장)
  intensity: "상" | "중" | "하" | "없음"; // 노동 강도
}

export interface CropCalendar {
  cropId: string;
  tasks: MonthlyTask[]; // 12개월 전부 포함
}

export const CROP_CALENDARS: CropCalendar[] = [
  // ──────────────────────────────────────
  // 식량작물
  // ──────────────────────────────────────

  {
    cropId: "rice",
    tasks: [
      {
        month: 1,
        task: "휴지기",
        detail: "영농 계획 수립 및 종자 준비.",
        intensity: "없음",
      },
      {
        month: 2,
        task: "휴지기",
        detail: "볍씨 소독 준비, 육묘 자재 점검.",
        intensity: "하",
      },
      {
        month: 3,
        task: "볍씨 준비",
        detail: "볍씨 소독·침종, 육묘상 설치.",
        intensity: "중",
      },
      {
        month: 4,
        task: "육묘·못자리",
        detail: "파종 후 육묘 관리. 논 경운·써레질 시작.",
        intensity: "상",
      },
      {
        month: 5,
        task: "이앙(모내기)",
        detail:
          "5월 중순~6월 초 이앙. 남부는 5월 초순부터 가능.",
        intensity: "상",
      },
      {
        month: 6,
        task: "물 관리",
        detail: "분얼기 얕은 물 관리, 중간 낙수. 제초제 처리.",
        intensity: "중",
      },
      {
        month: 7,
        task: "병해충 방제",
        detail: "도열병·멸구류 예찰 및 방제. 깊은 물 관리.",
        intensity: "중",
      },
      {
        month: 8,
        task: "수정·등숙",
        detail: "출수기 물 관리, 이삭도열병 방제. 등숙기 진입.",
        intensity: "중",
      },
      {
        month: 9,
        task: "등숙·낙수",
        detail: "수확 2~3주 전 낙수. 쓰러짐 방지 관리.",
        intensity: "중",
      },
      {
        month: 10,
        task: "수확",
        detail: "벼 수확 및 건조. 적기 수확이 품질 결정.",
        intensity: "상",
      },
      {
        month: 11,
        task: "수확 후 관리",
        detail: "건조·도정, 볏짚 처리. 토양 환원.",
        intensity: "중",
      },
      {
        month: 12,
        task: "휴지기",
        detail: "농기계 정비, 다음 해 영농 계획.",
        intensity: "없음",
      },
    ],
  },

  {
    cropId: "soybean",
    tasks: [
      {
        month: 1,
        task: "휴지기",
        detail: "종자 준비 및 재배 계획.",
        intensity: "없음",
      },
      {
        month: 2,
        task: "휴지기",
        detail: "포장 정비, 석회·퇴비 시비 계획.",
        intensity: "없음",
      },
      {
        month: 3,
        task: "휴지기",
        detail: "밭 경운 및 퇴비 살포.",
        intensity: "하",
      },
      {
        month: 4,
        task: "밭 준비",
        detail: "기비 시비, 이랑 만들기. 배수로 정비.",
        intensity: "중",
      },
      {
        month: 5,
        task: "파종",
        detail: "5월 하순~6월 초 파종 적기. 종자 소독 후 파종.",
        intensity: "상",
      },
      {
        month: 6,
        task: "파종·제초",
        detail: "파종 마무리, 발아 후 제초 작업. 남부는 6월 중순까지.",
        intensity: "상",
      },
      {
        month: 7,
        task: "생육 관리",
        detail: "배토·중경, 웃거름 시비. 장마철 배수 관리.",
        intensity: "중",
      },
      {
        month: 8,
        task: "병해충 방제",
        detail: "노린재·콩나방 방제. 개화기 수분 관리.",
        intensity: "중",
      },
      {
        month: 9,
        task: "성숙",
        detail: "꼬투리 비대 및 성숙기. 노린재 후기 방제.",
        intensity: "하",
      },
      {
        month: 10,
        task: "수확",
        detail: "잎이 떨어지고 꼬투리가 갈변하면 수확 적기.",
        intensity: "상",
      },
      {
        month: 11,
        task: "수확 후 관리",
        detail: "탈곡·건조·선별. 저장 습도 관리.",
        intensity: "중",
      },
      {
        month: 12,
        task: "휴지기",
        detail: "저장 관리, 다음 해 윤작 계획.",
        intensity: "없음",
      },
    ],
  },

  {
    cropId: "sweet-potato",
    tasks: [
      {
        month: 1,
        task: "휴지기",
        detail: "씨고구마 저장 관리 (13~15°C).",
        intensity: "없음",
      },
      {
        month: 2,
        task: "온상 설치",
        detail: "씨고구마 묻기, 온상(핫베드) 설치·가온 시작.",
        intensity: "중",
      },
      {
        month: 3,
        task: "육묘",
        detail: "온상에서 싹 틔우기. 묘 생장 관리.",
        intensity: "중",
      },
      {
        month: 4,
        task: "밭 준비·채묘",
        detail: "퇴비·비료 시비, 이랑(두둑) 만들기. 첫 채묘.",
        intensity: "상",
      },
      {
        month: 5,
        task: "정식(삽식)",
        detail:
          "순자르기 묘를 이랑에 삽식. 남부는 4월 하순부터 가능.",
        intensity: "상",
      },
      {
        month: 6,
        task: "활착·덩굴 관리",
        detail: "활착 확인, 결주 보식. 초기 제초.",
        intensity: "중",
      },
      {
        month: 7,
        task: "덩굴 관리",
        detail: "덩굴 뒤집기(부정근 제거). 장마철 배수 관리.",
        intensity: "중",
      },
      {
        month: 8,
        task: "비대기 관리",
        detail: "괴근 비대기. 병해충(굼벵이) 방제.",
        intensity: "중",
      },
      {
        month: 9,
        task: "수확",
        detail:
          "서리 오기 전 수확 시작. 초기 수확분은 가격 프리미엄.",
        intensity: "상",
      },
      {
        month: 10,
        task: "수확·큐어링",
        detail: "본격 수확. 큐어링(33°C, 4일) 후 저장.",
        intensity: "상",
      },
      {
        month: 11,
        task: "저장 관리",
        detail: "12~15°C 저장고 관리. 출하 시기 조절.",
        intensity: "하",
      },
      {
        month: 12,
        task: "저장·출하",
        detail: "겨울철 출하. 씨고구마 선별 보관.",
        intensity: "하",
      },
    ],
  },

  {
    cropId: "potato",
    tasks: [
      {
        month: 1,
        task: "휴지기",
        detail: "씨감자 주문·확보. 재배 계획 수립.",
        intensity: "없음",
      },
      {
        month: 2,
        task: "씨감자 준비",
        detail: "씨감자 절단·소독, 최아(싹 틔우기) 시작.",
        intensity: "중",
      },
      {
        month: 3,
        task: "파종",
        detail:
          "3월 중순~4월 초 파종. 남부는 2월 하순부터 가능.",
        intensity: "상",
      },
      {
        month: 4,
        task: "생육 관리",
        detail: "출아 후 1본 적심. 북주기·제초 작업.",
        intensity: "중",
      },
      {
        month: 5,
        task: "비대기 관리",
        detail: "괴경 비대기. 추비 시비, 역병 예방 방제.",
        intensity: "중",
      },
      {
        month: 6,
        task: "수확",
        detail: "봄감자 수확 적기. 장마 전 수확 완료 권장.",
        intensity: "상",
      },
      {
        month: 7,
        task: "가을 준비",
        detail:
          "가을감자 재배 시 씨감자 최아. 고랭지는 7월 수확.",
        intensity: "중",
      },
      {
        month: 8,
        task: "가을 파종",
        detail:
          "가을감자 파종(8월 중순). 남부 2기작 지역 해당.",
        intensity: "중",
      },
      {
        month: 9,
        task: "가을 생육",
        detail: "가을감자 생육 관리. 봄감자 저장 출하.",
        intensity: "중",
      },
      {
        month: 10,
        task: "가을 수확",
        detail: "가을감자 수확. 서리 전 완료.",
        intensity: "상",
      },
      {
        month: 11,
        task: "저장 관리",
        detail: "2~4°C 저장고 관리. 출하 조절.",
        intensity: "하",
      },
      {
        month: 12,
        task: "휴지기",
        detail: "저장 관리, 다음 해 품종 선정.",
        intensity: "없음",
      },
    ],
  },

  {
    cropId: "corn",
    tasks: [
      {
        month: 1,
        task: "휴지기",
        detail: "종자 선정·주문. 재배 계획.",
        intensity: "없음",
      },
      {
        month: 2,
        task: "휴지기",
        detail: "밭 기반 정비, 퇴비 확보.",
        intensity: "없음",
      },
      {
        month: 3,
        task: "밭 준비",
        detail: "퇴비 살포·경운. 비닐 멀칭 준비.",
        intensity: "중",
      },
      {
        month: 4,
        task: "파종",
        detail:
          "4월 중순~5월 초 파종. 멀칭 재배 시 조기 파종 가능.",
        intensity: "상",
      },
      {
        month: 5,
        task: "생육 관리",
        detail: "솎음(1본 남기기), 제초, 추비 시비.",
        intensity: "중",
      },
      {
        month: 6,
        task: "생육·방제",
        detail: "조명나방 방제, 수분기 관수. 장마 전 배수로 확인.",
        intensity: "중",
      },
      {
        month: 7,
        task: "수확(조생)",
        detail:
          "초당옥수수 등 조생종 수확 시작. 적기 수확이 당도 결정.",
        intensity: "상",
      },
      {
        month: 8,
        task: "수확",
        detail: "찰옥수수 본격 수확. 수확 후 즉시 냉장 필수.",
        intensity: "상",
      },
      {
        month: 9,
        task: "후기 수확",
        detail: "만생종 수확 마무리. 포장 정리.",
        intensity: "중",
      },
      {
        month: 10,
        task: "휴지기",
        detail: "잔재물 정리, 토양 환원.",
        intensity: "하",
      },
      {
        month: 11,
        task: "휴지기",
        detail: "토양 검정, 다음 해 윤작 계획.",
        intensity: "없음",
      },
      {
        month: 12,
        task: "휴지기",
        detail: "영농 계획 수립.",
        intensity: "없음",
      },
    ],
  },

  // ──────────────────────────────────────
  // 채소류
  // ──────────────────────────────────────

  {
    cropId: "chili-pepper",
    tasks: [
      {
        month: 1,
        task: "육묘 준비",
        detail: "1월 하순 파종 시작(시설 육묘). 육묘 상토 준비.",
        intensity: "중",
      },
      {
        month: 2,
        task: "육묘",
        detail: "온실 육묘 관리. 묘 온도·습도·광 관리.",
        intensity: "중",
      },
      {
        month: 3,
        task: "육묘·밭 준비",
        detail:
          "묘 경화 처리. 밭에 퇴비·석회 시비, 비닐 멀칭.",
        intensity: "상",
      },
      {
        month: 4,
        task: "정식",
        detail:
          "4월 하순~5월 초 정식. 남부는 4월 중순. 방풍 설치.",
        intensity: "상",
      },
      {
        month: 5,
        task: "초기 관리",
        detail: "활착 확인, 지주 세우기·유인. 초기 제초.",
        intensity: "상",
      },
      {
        month: 6,
        task: "생육 관리",
        detail: "곁순 제거, 추비 시비. 진딧물 방제.",
        intensity: "상",
      },
      {
        month: 7,
        task: "수확·방제",
        detail:
          "풋고추 첫 수확. 장마철 탄저병·역병 집중 방제.",
        intensity: "상",
      },
      {
        month: 8,
        task: "수확·건조",
        detail: "홍고추 본격 수확·건조. 탄저병 지속 방제.",
        intensity: "상",
      },
      {
        month: 9,
        task: "수확",
        detail: "후기 수확. 건고추 건조·선별.",
        intensity: "상",
      },
      {
        month: 10,
        task: "수확 마무리",
        detail: "마지막 수확, 포장 정리. 건고추 저장.",
        intensity: "중",
      },
      {
        month: 11,
        task: "휴지기",
        detail: "잔재물 제거, 토양 소독. 건고추 출하.",
        intensity: "하",
      },
      {
        month: 12,
        task: "휴지기",
        detail: "다음 해 품종 선정, 육묘 일정 계획.",
        intensity: "없음",
      },
    ],
  },

  {
    cropId: "napa-cabbage",
    tasks: [
      {
        month: 1,
        task: "휴지기",
        detail: "봄배추 재배 계획, 종자 준비.",
        intensity: "없음",
      },
      {
        month: 2,
        task: "봄배추 육묘",
        detail: "2월 하순 봄배추 파종(시설 육묘). 추대 저항성 품종 선택.",
        intensity: "중",
      },
      {
        month: 3,
        task: "봄배추 정식",
        detail: "3월 하순~4월 초 정식. 터널 피복으로 보온.",
        intensity: "상",
      },
      {
        month: 4,
        task: "봄배추 관리",
        detail: "봄배추 생육 관리, 추비. 무름병 예방.",
        intensity: "중",
      },
      {
        month: 5,
        task: "봄배추 수확",
        detail: "봄배추 수확(5~6월). 고랭지배추 파종 시작.",
        intensity: "상",
      },
      {
        month: 6,
        task: "고랭지 관리",
        detail: "고랭지배추 정식·관리. 평지는 휴지기.",
        intensity: "중",
      },
      {
        month: 7,
        task: "가을배추 육묘",
        detail: "7월 중순 가을배추(김장용) 파종. 고랭지 수확 시작.",
        intensity: "상",
      },
      {
        month: 8,
        task: "가을배추 정식",
        detail:
          "8월 중순 정식. 남부는 8월 하순. 활착 관수 필수.",
        intensity: "상",
      },
      {
        month: 9,
        task: "생육 관리",
        detail: "결구기 관리. 추비·관수, 배추좀나방 방제.",
        intensity: "상",
      },
      {
        month: 10,
        task: "결구·방제",
        detail: "결구 충실화. 노균병·무름병 방제.",
        intensity: "중",
      },
      {
        month: 11,
        task: "수확",
        detail: "김장배추 수확(11월 초~중순). 영하 전 수확 완료.",
        intensity: "상",
      },
      {
        month: 12,
        task: "휴지기",
        detail: "포장 정리, 토양 환원. 다음 해 계획.",
        intensity: "없음",
      },
    ],
  },

  {
    cropId: "garlic",
    tasks: [
      {
        month: 1,
        task: "월동 관리",
        detail: "한파 시 피복 자재 점검. 동해 피해 확인.",
        intensity: "하",
      },
      {
        month: 2,
        task: "월동 후 관리",
        detail: "비닐 멀칭 보수. 배수로 정비.",
        intensity: "하",
      },
      {
        month: 3,
        task: "추비·제초",
        detail:
          "월동 후 첫 추비(3월 상순). 제초 작업 시작.",
        intensity: "중",
      },
      {
        month: 4,
        task: "생육 관리",
        detail: "2차 추비, 병해충(흑색썩음병) 예찰. 관수.",
        intensity: "중",
      },
      {
        month: 5,
        task: "꽃대 제거",
        detail: "쫑(꽃대) 제거로 구비대 촉진. 마늘쫑 수확 판매 가능.",
        intensity: "상",
      },
      {
        month: 6,
        task: "수확",
        detail:
          "난지형(남부) 5월 하순, 한지형(중부) 6월 중순 수확.",
        intensity: "상",
      },
      {
        month: 7,
        task: "건조·저장",
        detail: "수확 후 건조(2~3주). 통풍 잘 되는 곳에 저장.",
        intensity: "중",
      },
      {
        month: 8,
        task: "저장·출하",
        detail: "건마늘 출하, 저장 관리. 씨마늘 선별.",
        intensity: "하",
      },
      {
        month: 9,
        task: "밭 준비",
        detail:
          "퇴비·석회 시비, 경운·이랑 만들기. 씨마늘 소독.",
        intensity: "중",
      },
      {
        month: 10,
        task: "파종",
        detail:
          "한지형 9월 하순~10월 초, 난지형 10월 중순 파종. 남부는 1개월 늦음.",
        intensity: "상",
      },
      {
        month: 11,
        task: "월동 준비",
        detail: "비닐 멀칭·볏짚 피복으로 동해 방지.",
        intensity: "중",
      },
      {
        month: 12,
        task: "월동 관리",
        detail: "동해 방지 관리. 배수 점검.",
        intensity: "하",
      },
    ],
  },

  {
    cropId: "onion",
    tasks: [
      {
        month: 1,
        task: "월동 관리",
        detail: "한파 시 피복 점검. 동해 피해 방지.",
        intensity: "하",
      },
      {
        month: 2,
        task: "월동 후 관리",
        detail: "비닐 멀칭 보수. 잡초 제거 시작.",
        intensity: "하",
      },
      {
        month: 3,
        task: "추비·관수",
        detail: "생육 재개 시 1차 추비. 관수 시작.",
        intensity: "중",
      },
      {
        month: 4,
        task: "비대기 관리",
        detail: "구 비대 촉진 추비. 노균병·잎마름병 방제.",
        intensity: "중",
      },
      {
        month: 5,
        task: "도복·수확",
        detail:
          "도복(쓰러짐) 확인 후 수확 시작. 남부(무안·창녕) 5월 중순~.",
        intensity: "상",
      },
      {
        month: 6,
        task: "수확·건조",
        detail: "중부 수확(6월 중순). 수확 후 2~3일 포장 건조.",
        intensity: "상",
      },
      {
        month: 7,
        task: "저장",
        detail: "저장 양파 입고(0~1°C). 출하 시기 조절.",
        intensity: "중",
      },
      {
        month: 8,
        task: "육묘 파종",
        detail: "8월 하순~9월 초 육묘 파종. 묘상 관리.",
        intensity: "중",
      },
      {
        month: 9,
        task: "육묘 관리",
        detail: "묘 관리(간이 시설). 밭 준비 시작.",
        intensity: "중",
      },
      {
        month: 10,
        task: "정식",
        detail:
          "10월 하순~11월 초 정식. 남부는 11월 중순까지.",
        intensity: "상",
      },
      {
        month: 11,
        task: "정식·월동 준비",
        detail: "정식 마무리, 비닐 멀칭. 동해 대비 피복.",
        intensity: "상",
      },
      {
        month: 12,
        task: "월동 관리",
        detail: "동해 방지 점검. 배수로 관리.",
        intensity: "하",
      },
    ],
  },

  {
    cropId: "lettuce",
    tasks: [
      {
        month: 1,
        task: "시설 재배",
        detail: "비닐하우스 내 파종·수확 반복. 보온 관리 중요.",
        intensity: "중",
      },
      {
        month: 2,
        task: "시설 재배",
        detail: "하우스 내 연속 파종·수확. 환기로 과습 방지.",
        intensity: "중",
      },
      {
        month: 3,
        task: "노지 파종",
        detail:
          "3월 중순 노지 첫 파종 가능. 비닐 터널 피복 권장.",
        intensity: "중",
      },
      {
        month: 4,
        task: "정식·수확",
        detail: "연속 정식으로 수확 이어가기. 진딧물 방제.",
        intensity: "중",
      },
      {
        month: 5,
        task: "수확",
        detail: "본격 노지 수확. 고온 시 추대 주의.",
        intensity: "중",
      },
      {
        month: 6,
        task: "추대 관리",
        detail: "고온기 추대(꽃대 올림) 빈번. 차광 처리 또는 재배 중단.",
        intensity: "하",
      },
      {
        month: 7,
        task: "휴지기",
        detail: "고온·장마로 노지 재배 어려움. 시설 재배만 가능.",
        intensity: "하",
      },
      {
        month: 8,
        task: "가을 파종",
        detail: "8월 하순 가을 재배 파종 시작. 내서성 품종 선택.",
        intensity: "중",
      },
      {
        month: 9,
        task: "정식·수확",
        detail: "가을 상추 정식, 초기 수확 시작.",
        intensity: "중",
      },
      {
        month: 10,
        task: "수확",
        detail: "가을 상추 본격 수확. 서리 전까지 노지 가능.",
        intensity: "중",
      },
      {
        month: 11,
        task: "시설 전환",
        detail: "노지 종료, 시설(하우스) 재배로 전환.",
        intensity: "중",
      },
      {
        month: 12,
        task: "시설 재배",
        detail: "비닐하우스 내 겨울 재배. 보온·환기 관리.",
        intensity: "중",
      },
    ],
  },

  // ──────────────────────────────────────
  // 과수류
  // ──────────────────────────────────────

  {
    cropId: "apple",
    tasks: [
      {
        month: 1,
        task: "전정",
        detail: "겨울 전정(도장지·교차지 제거). 수형 구성의 핵심.",
        intensity: "상",
      },
      {
        month: 2,
        task: "전정·방제",
        detail: "전정 마무리, 기계유 유제 살포(월동 해충 방제).",
        intensity: "상",
      },
      {
        month: 3,
        task: "시비·방제",
        detail: "기비(밑거름) 시비, 부란병 도포 처리.",
        intensity: "중",
      },
      {
        month: 4,
        task: "개화·수분",
        detail:
          "개화기 인공수분 또는 방화곤충 투입. 만상(늦서리) 주의.",
        intensity: "상",
      },
      {
        month: 5,
        task: "적과",
        detail:
          "중심과 남기고 측과 제거. 약제 적과 또는 수작업.",
        intensity: "상",
      },
      {
        month: 6,
        task: "적과·봉지",
        detail: "마무리 적과, 봉지 씌우기(고급 사과). 유기물 멀칭.",
        intensity: "상",
      },
      {
        month: 7,
        task: "하계 관리",
        detail: "도장지 제거, 관수. 갈반병·탄저병 방제.",
        intensity: "중",
      },
      {
        month: 8,
        task: "착색 관리",
        detail: "반사필름 설치, 봉지 제거. 탄저병 방제 지속.",
        intensity: "중",
      },
      {
        month: 9,
        task: "수확(조생)",
        detail: "쓰가루 등 조생종 수확. 부사 착색 관리.",
        intensity: "상",
      },
      {
        month: 10,
        task: "수확",
        detail: "부사 등 만생종 수확(10~11월). 적기 수확 중요.",
        intensity: "상",
      },
      {
        month: 11,
        task: "수확·저장",
        detail: "만생종 수확 마무리. CA 저장고 입고.",
        intensity: "상",
      },
      {
        month: 12,
        task: "전정 준비",
        detail: "낙엽 처리, 동해 방지 백도 처리. 전정 계획.",
        intensity: "중",
      },
    ],
  },

  {
    cropId: "pear",
    tasks: [
      {
        month: 1,
        task: "전정",
        detail: "겨울 전정. 결과지 배치 및 도장지 제거.",
        intensity: "상",
      },
      {
        month: 2,
        task: "전정·방제",
        detail: "전정 마무리, 기계유 유제 살포.",
        intensity: "상",
      },
      {
        month: 3,
        task: "시비",
        detail: "기비 시비, 나무 상태 점검. 흑성병 예방 방제.",
        intensity: "중",
      },
      {
        month: 4,
        task: "개화·수분",
        detail:
          "인공수분 필수(배는 자가 불화합). 만상 대비 방상팬 가동.",
        intensity: "상",
      },
      {
        month: 5,
        task: "적과",
        detail:
          "1차 적과(꽃 적과 후 열매 적과). 중심과 1개 남기기.",
        intensity: "상",
      },
      {
        month: 6,
        task: "봉지·관리",
        detail: "봉지 씌우기(필수). 추비 시비, 흑성병 방제.",
        intensity: "상",
      },
      {
        month: 7,
        task: "하계 관리",
        detail: "관수, 도장지 관리. 심식나방 방제.",
        intensity: "중",
      },
      {
        month: 8,
        task: "비대기 관리",
        detail: "과실 비대 촉진 관수. 봉지 제거 준비.",
        intensity: "중",
      },
      {
        month: 9,
        task: "수확 준비",
        detail:
          "봉지 제거, 반사필름 설치. 조생 품종(원황) 수확.",
        intensity: "상",
      },
      {
        month: 10,
        task: "수확",
        detail: "신고배 본격 수확(10월 초~중순). 과실 당도 측정.",
        intensity: "상",
      },
      {
        month: 11,
        task: "수확 후 관리",
        detail: "저장고 입고, 낙엽 처리. 기비 시비(남부).",
        intensity: "중",
      },
      {
        month: 12,
        task: "전정 준비",
        detail: "동해 방지 처리, 전정 계획 수립.",
        intensity: "중",
      },
    ],
  },

  {
    cropId: "grape",
    tasks: [
      {
        month: 1,
        task: "전정",
        detail: "겨울 전정, 덕(시설) 점검·보수.",
        intensity: "중",
      },
      {
        month: 2,
        task: "전정·방제",
        detail: "전정 마무리, 석회유황합제 살포.",
        intensity: "중",
      },
      {
        month: 3,
        task: "시비·유인",
        detail: "기비 시비, 비가림 비닐 피복. 수액 유동 확인.",
        intensity: "중",
      },
      {
        month: 4,
        task: "발아·순 관리",
        detail:
          "발아 후 불필요한 눈 제거. 샤인머스캣은 무핵 처리 준비.",
        intensity: "상",
      },
      {
        month: 5,
        task: "개화·GA 처리",
        detail:
          "개화 전 꽃송이 정형. 지베렐린(GA) 1차 처리(무핵 처리).",
        intensity: "상",
      },
      {
        month: 6,
        task: "적립·봉지",
        detail:
          "GA 2차 처리(비대 촉진), 적립(알솎기). 봉지 씌우기.",
        intensity: "상",
      },
      {
        month: 7,
        task: "비대기 관리",
        detail: "관수·추비, 곁순 제거. 탄저병·노균병 방제.",
        intensity: "중",
      },
      {
        month: 8,
        task: "착색·수확",
        detail:
          "캠벨얼리 수확(8월 중순). 샤인머스캣 착색 관리.",
        intensity: "상",
      },
      {
        month: 9,
        task: "수확",
        detail: "샤인머스캣·거봉 수확. 당도 측정 후 출하.",
        intensity: "상",
      },
      {
        month: 10,
        task: "수확 마무리",
        detail: "만생종 수확, 비가림 비닐 제거.",
        intensity: "중",
      },
      {
        month: 11,
        task: "휴지기 준비",
        detail: "낙엽 처리, 동해 방지(매몰 등). 기비 시비.",
        intensity: "중",
      },
      {
        month: 12,
        task: "휴지기",
        detail: "동해 방지 관리, 전정 계획.",
        intensity: "하",
      },
    ],
  },

  {
    cropId: "citrus",
    tasks: [
      {
        month: 1,
        task: "수확·저장",
        detail: "만감류(한라봉) 수확 시작. 동해 방지 보온.",
        intensity: "상",
      },
      {
        month: 2,
        task: "수확·전정",
        detail: "만감류 수확 계속. 전정 시작(낙엽 후).",
        intensity: "상",
      },
      {
        month: 3,
        task: "전정·시비",
        detail: "전정 마무리, 봄 기비 시비. 월동 해충 방제.",
        intensity: "중",
      },
      {
        month: 4,
        task: "발아·관리",
        detail: "새싹 관리. 깍지벌레·응애 방제.",
        intensity: "중",
      },
      {
        month: 5,
        task: "개화·수분",
        detail: "개화기 관리. 비 올 때 꽃 피해 주의.",
        intensity: "중",
      },
      {
        month: 6,
        task: "생리낙과·적과",
        detail: "자연 낙과 후 적과. 추비(여름 비료).",
        intensity: "상",
      },
      {
        month: 7,
        task: "비대기 관리",
        detail: "과실 비대기 관수. 하계 전정(도장지).",
        intensity: "중",
      },
      {
        month: 8,
        task: "비대·방제",
        detail:
          "관수 지속, 깍지벌레·검은점무늬병 방제.",
        intensity: "중",
      },
      {
        month: 9,
        task: "착색 관리",
        detail: "극조생 수확(하우스). 노지 착색 시작.",
        intensity: "중",
      },
      {
        month: 10,
        task: "수확(조생)",
        detail: "극조생·조생 감귤 수확 시작(10월 하순~).",
        intensity: "상",
      },
      {
        month: 11,
        task: "수확",
        detail: "온주밀감 본격 수확. 선과·출하.",
        intensity: "상",
      },
      {
        month: 12,
        task: "수확·월동",
        detail: "만생 온주밀감 수확 마무리. 동해 방지 조치.",
        intensity: "상",
      },
    ],
  },

  {
    cropId: "strawberry",
    tasks: [
      {
        month: 1,
        task: "수확·관리",
        detail: "보온 관리 철저(야간 10°C 이상). 꿀벌 활동 확인.",
        intensity: "상",
      },
      {
        month: 2,
        task: "수확",
        detail: "수확 최성기. 잿빛곰팡이병 방제, 환기 관리.",
        intensity: "상",
      },
      {
        month: 3,
        task: "수확",
        detail: "수확 지속. 봄철 온도 상승에 따른 환기 강화.",
        intensity: "상",
      },
      {
        month: 4,
        task: "수확·정리",
        detail: "수확 후기. 수량 감소, 가격 하락기.",
        intensity: "중",
      },
      {
        month: 5,
        task: "수확 종료·모주 관리",
        detail: "수확 종료. 모주(어미주) 관리 시작, 런너 유인.",
        intensity: "중",
      },
      {
        month: 6,
        task: "자묘 증식",
        detail: "런너에서 자묘 채취·육묘. 고온기 차광 관리.",
        intensity: "상",
      },
      {
        month: 7,
        task: "육묘",
        detail: "자묘 육묘 관리. 탄저병 집중 방제(핵심 시기).",
        intensity: "상",
      },
      {
        month: 8,
        task: "육묘·하우스 준비",
        detail: "묘 포트 이식, 하우스 토양 소독·시비.",
        intensity: "상",
      },
      {
        month: 9,
        task: "정식",
        detail:
          "9월 중순 정식. 활착 관수, 고설 또는 토경 선택.",
        intensity: "상",
      },
      {
        month: 10,
        task: "보온·관리",
        detail: "비닐 보온 개시(10월 하순). 꽃눈 분화 관리.",
        intensity: "중",
      },
      {
        month: 11,
        task: "개화·수분",
        detail: "1화방 개화. 꿀벌 투입, 온도·습도 관리.",
        intensity: "중",
      },
      {
        month: 12,
        task: "수확 시작",
        detail: "12월 중순부터 첫 수확. 야간 보온 철저.",
        intensity: "상",
      },
    ],
  },

  // ──────────────────────────────────────
  // 특용작물
  // ──────────────────────────────────────

  {
    cropId: "ginseng",
    tasks: [
      {
        month: 1,
        task: "휴지기",
        detail: "해가림 시설 점검. 적설 관리.",
        intensity: "하",
      },
      {
        month: 2,
        task: "휴지기",
        detail: "해가림 보수, 배수로 점검.",
        intensity: "하",
      },
      {
        month: 3,
        task: "해가림·시비",
        detail: "해가림 시설 설치·점검. 기비 시비. 신규 포장은 이식.",
        intensity: "상",
      },
      {
        month: 4,
        task: "출아·방제",
        detail: "출아기 잿빛곰팡이병·점무늬병 예방 방제.",
        intensity: "중",
      },
      {
        month: 5,
        task: "생육 관리",
        detail: "개화기 관리. 채종포 외 꽃대 제거.",
        intensity: "중",
      },
      {
        month: 6,
        task: "방제·관수",
        detail: "장마 전 배수 점검. 역병·탄저병 집중 방제.",
        intensity: "상",
      },
      {
        month: 7,
        task: "병해충 방제",
        detail: "장마철 역병·잿빛곰팡이 방제. 배수 관리 최우선.",
        intensity: "상",
      },
      {
        month: 8,
        task: "방제·관수",
        detail: "고온기 차광·관수. 점무늬병·뿌리썩음병 방제.",
        intensity: "중",
      },
      {
        month: 9,
        task: "종자 채종",
        detail: "4년근 채종포 열매 수확. 종자 개갑 처리.",
        intensity: "중",
      },
      {
        month: 10,
        task: "수확(6년근)",
        detail: "6년근 수확 시작. 세척·건조(백삼·홍삼 가공).",
        intensity: "상",
      },
      {
        month: 11,
        task: "수확·정리",
        detail: "수확 마무리. 해가림 철거 또는 보수.",
        intensity: "중",
      },
      {
        month: 12,
        task: "휴지기",
        detail: "포장 정리, 다음 해 연작 회피 포장 계획.",
        intensity: "하",
      },
    ],
  },

  {
    cropId: "sesame",
    tasks: [
      {
        month: 1,
        task: "휴지기",
        detail: "재배 계획 수립, 종자 확보.",
        intensity: "없음",
      },
      {
        month: 2,
        task: "휴지기",
        detail: "밭 기반 정비.",
        intensity: "없음",
      },
      {
        month: 3,
        task: "휴지기",
        detail: "퇴비 살포, 밭 경운.",
        intensity: "하",
      },
      {
        month: 4,
        task: "밭 준비",
        detail: "비료 시비, 이랑 만들기. 배수로 정비.",
        intensity: "중",
      },
      {
        month: 5,
        task: "파종",
        detail:
          "5월 중순~6월 초 파종(직파 또는 이식). 남부는 5월 초.",
        intensity: "상",
      },
      {
        month: 6,
        task: "생육 관리",
        detail: "솎음·제초, 추비 시비. 장마 전 배수 확인.",
        intensity: "중",
      },
      {
        month: 7,
        task: "개화·방제",
        detail: "개화기(7~8월). 세균성점무늬병·역병 방제.",
        intensity: "중",
      },
      {
        month: 8,
        task: "성숙·수확",
        detail: "아래쪽 꼬투리 2~3개 갈변 시 수확 적기. 세워서 건조.",
        intensity: "상",
      },
      {
        month: 9,
        task: "탈립·건조",
        detail: "건조 후 탈립(깨 털기). 선별·포장.",
        intensity: "상",
      },
      {
        month: 10,
        task: "출하·저장",
        detail: "참깨 출하 또는 착유. 저장 시 밀봉 필수.",
        intensity: "중",
      },
      {
        month: 11,
        task: "휴지기",
        detail: "포장 정리, 토양 환원.",
        intensity: "하",
      },
      {
        month: 12,
        task: "휴지기",
        detail: "영농 결산, 다음 해 계획.",
        intensity: "없음",
      },
    ],
  },

  // ──────────────────────────────────────
  // 채소류 (추가)
  // ──────────────────────────────────────

  {
    cropId: "arugula",
    tasks: [
      {
        month: 1,
        task: "시설 재배",
        detail: "비닐하우스 내 파종·수확 반복. 보온(10°C 이상) 필수.",
        intensity: "중",
      },
      {
        month: 2,
        task: "시설 재배",
        detail: "하우스 연속 재배. 환기로 잿빛곰팡이 방지.",
        intensity: "중",
      },
      {
        month: 3,
        task: "노지 파종",
        detail:
          "3월 중순 노지 첫 파종 가능. 부직포 피복 권장.",
        intensity: "중",
      },
      {
        month: 4,
        task: "수확",
        detail: "파종 후 40~50일 수확. 연속 파종으로 출하 유지.",
        intensity: "중",
      },
      {
        month: 5,
        task: "수확·파종",
        detail: "봄 재배 수확. 고온기 진입 전 마지막 파종.",
        intensity: "중",
      },
      {
        month: 6,
        task: "휴지기",
        detail: "고온(25°C 이상) 시 추대·쓴맛 증가. 노지 재배 중단.",
        intensity: "하",
      },
      {
        month: 7,
        task: "휴지기",
        detail: "고온·장마로 재배 부적합. 시설 차광 재배만 가능.",
        intensity: "없음",
      },
      {
        month: 8,
        task: "휴지기",
        detail: "8월 하순부터 가을 재배 파종 가능(남부 기준).",
        intensity: "하",
      },
      {
        month: 9,
        task: "가을 파종",
        detail: "9월 초~중순 노지 파종 적기. 서늘해지며 품질 향상.",
        intensity: "중",
      },
      {
        month: 10,
        task: "수확",
        detail: "가을 재배 수확. 밀키트·레스토랑 납품 성수기.",
        intensity: "중",
      },
      {
        month: 11,
        task: "수확·시설 전환",
        detail: "노지 마지막 수확, 시설 재배로 전환.",
        intensity: "중",
      },
      {
        month: 12,
        task: "시설 재배",
        detail: "비닐하우스 내 겨울 재배. 보온·환기 균형 중요.",
        intensity: "중",
      },
    ],
  },

  // ──────────────────────────────────────
  // 과수류 (추가)
  // ──────────────────────────────────────

  {
    cropId: "mango",
    tasks: [
      {
        month: 1,
        task: "개화 관리",
        detail:
          "하우스 내 가온(18~25°C). 꽃눈 분화 후 화방 정리.",
        intensity: "상",
      },
      {
        month: 2,
        task: "개화·수분",
        detail:
          "개화기 수분 관리. 인공수분 또는 파리 투입.",
        intensity: "상",
      },
      {
        month: 3,
        task: "착과·적과",
        detail: "착과 확인 후 적과. 1화방 1~2과 남기기.",
        intensity: "상",
      },
      {
        month: 4,
        task: "비대기 관리",
        detail: "과실 비대기 관수·추비. 탄저병 방제.",
        intensity: "중",
      },
      {
        month: 5,
        task: "비대·착색",
        detail: "과실 비대 지속. 봉지 씌우기(일소 방지).",
        intensity: "중",
      },
      {
        month: 6,
        task: "수확",
        detail: "조생종 수확 시작(6월 중순~). 후숙 관리.",
        intensity: "상",
      },
      {
        month: 7,
        task: "수확·정리",
        detail: "본격 수확·출하. 수확 후 전정 시작.",
        intensity: "상",
      },
      {
        month: 8,
        task: "전정·관리",
        detail: "수확 후 전정(갱신 전정). 새 가지 유도.",
        intensity: "중",
      },
      {
        month: 9,
        task: "생육 관리",
        detail: "신초 관리, 추비. 가을 눈 충실화.",
        intensity: "중",
      },
      {
        month: 10,
        task: "화아분화 유도",
        detail:
          "야간 온도 낮춰 꽃눈 분화 유도(15°C 이하). 시설 관리.",
        intensity: "중",
      },
      {
        month: 11,
        task: "가온 시작",
        detail:
          "가온 시작(야간 15~18°C). 난방비가 경영비의 핵심.",
        intensity: "중",
      },
      {
        month: 12,
        task: "화아분화·보온",
        detail: "꽃눈 분화 진행. 가온·보온 관리 철저.",
        intensity: "상",
      },
    ],
  },
];
