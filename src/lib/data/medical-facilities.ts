/**
 * 의료기관 통계 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-medical-facilities.ts
 * 데이터 소스: 건강보험심사평가원 의료기관 정보 v2
 *   https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList
 * 마지막 수집: 2026-10-07
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/collect-medical-facilities.ts`
 *
 * Phase 4 — 빌드 시 시군구별 HIRA API 호출을 제거하기 위한 정적 폴백.
 * 통합시는 산하 구 totalCount 합산.
 *
 * 커버리지: 230/230 시군구 (수집일 기준)
 */

export interface MedicalFacilityStat {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 의료기관 총 수 */
  totalCount: number;
}

/** 시군구 의료기관 수 (SGIS 5자리) */
export const MEDICAL_FALLBACK_SIGUNGU: MedicalFacilityStat[] = [
  {
    "sgisCode": "11010",
    "name": "종로구",
    "totalCount": 477
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "totalCount": 622
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "totalCount": 337
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "totalCount": 499
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "totalCount": 603
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "totalCount": 644
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "totalCount": 586
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "totalCount": 563
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "totalCount": 477
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "totalCount": 385
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "totalCount": 766
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "totalCount": 724
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "totalCount": 458
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "totalCount": 795
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "totalCount": 701
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "totalCount": 985
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "totalCount": 628
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "totalCount": 372
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "totalCount": 860
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "totalCount": 615
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "totalCount": 719
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "totalCount": 1610
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "totalCount": 3182
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "totalCount": 1344
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "totalCount": 967
  },
  {
    "sgisCode": "23100",
    "name": "제물포구",
    "totalCount": 143
  },
  {
    "sgisCode": "23110",
    "name": "영종구",
    "totalCount": 92
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "totalCount": 525
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "totalCount": 523
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "totalCount": 757
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "totalCount": 683
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "totalCount": 377
  },
  {
    "sgisCode": "23120",
    "name": "서해구",
    "totalCount": 432
  },
  {
    "sgisCode": "23130",
    "name": "검단구",
    "totalCount": 262
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "totalCount": 87
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "totalCount": 27
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "totalCount": 1806
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "totalCount": 1915
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "totalCount": 627
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "totalCount": 937
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "totalCount": 1172
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "totalCount": 489
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "totalCount": 710
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "totalCount": 93
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "totalCount": 812
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "totalCount": 1398
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "totalCount": 120
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "totalCount": 355
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "totalCount": 846
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "totalCount": 267
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "totalCount": 577
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "totalCount": 339
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "totalCount": 173
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "totalCount": 459
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "totalCount": 1296
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "totalCount": 540
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "totalCount": 268
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "totalCount": 222
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "totalCount": 557
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "totalCount": 1034
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "totalCount": 368
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "totalCount": 255
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "totalCount": 158
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "totalCount": 143
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "totalCount": 149
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "totalCount": 95
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "totalCount": 54
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "totalCount": 382
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "totalCount": 514
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "totalCount": 275
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "totalCount": 105
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "totalCount": 45
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "totalCount": 135
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "totalCount": 66
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "totalCount": 88
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "totalCount": 53
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "totalCount": 38
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "totalCount": 58
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "totalCount": 39
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "totalCount": 51
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "totalCount": 31
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "totalCount": 24
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "totalCount": 32
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "totalCount": 32
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "totalCount": 26
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "totalCount": 1149
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "totalCount": 275
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "totalCount": 193
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "totalCount": 55
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "totalCount": 85
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "totalCount": 81
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "totalCount": 49
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "totalCount": 103
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "totalCount": 53
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "totalCount": 129
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "totalCount": 42
  },
  {
    "sgisCode": "29010",
    "name": "세종특별자치시",
    "totalCount": 470
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "totalCount": 343
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "totalCount": 360
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "totalCount": 933
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "totalCount": 512
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "totalCount": 218
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "totalCount": 860
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "totalCount": 169
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "totalCount": 146
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "totalCount": 387
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "totalCount": 209
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "totalCount": 201
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "totalCount": 60
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "totalCount": 205
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "totalCount": 86
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "totalCount": 102
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "totalCount": 88
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "totalCount": 49
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "totalCount": 140
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "totalCount": 110
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "totalCount": 79
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "totalCount": 1113
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "totalCount": 366
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "totalCount": 410
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "totalCount": 190
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "totalCount": 138
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "totalCount": 143
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "totalCount": 135
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "totalCount": 45
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "totalCount": 37
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "totalCount": 33
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "totalCount": 63
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "totalCount": 59
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "totalCount": 93
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "totalCount": 83
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "totalCount": 237
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "totalCount": 578
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "totalCount": 353
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "totalCount": 642
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "totalCount": 523
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "totalCount": 286
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "totalCount": 363
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "totalCount": 364
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "totalCount": 171
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "totalCount": 160
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "totalCount": 79
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "totalCount": 53
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "totalCount": 48
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "totalCount": 105
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "totalCount": 69
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "totalCount": 105
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "totalCount": 66
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "totalCount": 55
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "totalCount": 102
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "totalCount": 77
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "totalCount": 117
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "totalCount": 56
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "totalCount": 93
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "totalCount": 63
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "totalCount": 73
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "totalCount": 52
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "totalCount": 63
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "totalCount": 138
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "totalCount": 137
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "totalCount": 157
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "totalCount": 134
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "totalCount": 871
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "totalCount": 535
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "totalCount": 414
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "totalCount": 390
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "totalCount": 705
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "totalCount": 436
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "totalCount": 365
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "totalCount": 133
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "totalCount": 402
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "totalCount": 337
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "totalCount": 243
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "totalCount": 210
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "totalCount": 482
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "totalCount": 508
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "totalCount": 268
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "totalCount": 259
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "totalCount": 603
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "totalCount": 923
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "totalCount": 874
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "totalCount": 284
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "totalCount": 35
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "totalCount": 237
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "totalCount": 621
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "totalCount": 174
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "totalCount": 191
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "totalCount": 210
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "totalCount": 668
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "totalCount": 306
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "totalCount": 157
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "totalCount": 225
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "totalCount": 470
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "totalCount": 144
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "totalCount": 149
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "totalCount": 146
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "totalCount": 110
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "totalCount": 350
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "totalCount": 82
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "totalCount": 39
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "totalCount": 21
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "totalCount": 60
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "totalCount": 70
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "totalCount": 46
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "totalCount": 62
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "totalCount": 122
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "totalCount": 74
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "totalCount": 36
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "totalCount": 65
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "totalCount": 8
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "totalCount": 1357
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "totalCount": 486
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "totalCount": 161
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "totalCount": 142
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "totalCount": 595
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "totalCount": 138
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "totalCount": 235
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "totalCount": 428
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "totalCount": 47
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "totalCount": 70
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "totalCount": 96
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "totalCount": 69
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "totalCount": 66
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "totalCount": 73
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "totalCount": 61
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "totalCount": 64
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "totalCount": 95
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "totalCount": 73
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "totalCount": 773
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "totalCount": 276
  }
];
