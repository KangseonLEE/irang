/**
 * 의료기관 통계 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-medical-facilities.ts
 * 데이터 소스: 건강보험심사평가원 의료기관 정보 v2
 *   https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList
 * 마지막 수집: 2026-05-03
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/collect-medical-facilities.ts`
 *
 * Phase 4 — 빌드 시 시군구별 HIRA API 호출을 제거하기 위한 정적 폴백.
 * 통합시는 산하 구 totalCount 합산.
 *
 * 커버리지: 229/229 시군구 (수집일 기준)
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
    "totalCount": 470
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "totalCount": 617
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "totalCount": 331
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "totalCount": 490
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "totalCount": 604
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "totalCount": 648
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "totalCount": 577
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "totalCount": 564
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "totalCount": 478
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "totalCount": 382
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "totalCount": 768
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "totalCount": 720
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "totalCount": 453
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "totalCount": 796
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "totalCount": 703
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "totalCount": 983
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "totalCount": 621
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "totalCount": 372
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "totalCount": 856
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "totalCount": 616
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "totalCount": 722
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "totalCount": 1595
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "totalCount": 3115
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "totalCount": 1326
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "totalCount": 965
  },
  {
    "sgisCode": "23010",
    "name": "중구",
    "totalCount": 150
  },
  {
    "sgisCode": "23020",
    "name": "동구",
    "totalCount": 87
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "totalCount": 526
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "totalCount": 519
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "totalCount": 760
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "totalCount": 682
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "totalCount": 380
  },
  {
    "sgisCode": "23080",
    "name": "서구",
    "totalCount": 688
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "totalCount": 86
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "totalCount": 27
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "totalCount": 1802
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "totalCount": 1915
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "totalCount": 626
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "totalCount": 937
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "totalCount": 1173
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "totalCount": 484
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "totalCount": 700
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "totalCount": 93
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "totalCount": 802
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "totalCount": 1395
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "totalCount": 119
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "totalCount": 352
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "totalCount": 838
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "totalCount": 264
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "totalCount": 572
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "totalCount": 340
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "totalCount": 168
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "totalCount": 456
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "totalCount": 1283
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "totalCount": 535
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "totalCount": 267
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "totalCount": 223
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "totalCount": 554
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "totalCount": 461
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "totalCount": 363
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "totalCount": 251
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "totalCount": 159
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "totalCount": 142
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "totalCount": 149
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "totalCount": 94
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "totalCount": 54
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "totalCount": 384
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "totalCount": 507
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "totalCount": 273
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "totalCount": 106
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "totalCount": 44
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "totalCount": 134
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
    "totalCount": 50
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "totalCount": 34
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
    "totalCount": 1147
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "totalCount": 276
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "totalCount": 195
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "totalCount": 56
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "totalCount": 85
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "totalCount": 80
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "totalCount": 49
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "totalCount": 101
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "totalCount": 53
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "totalCount": 128
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "totalCount": 42
  },
  {
    "sgisCode": "29010",
    "name": "세종특별자치시",
    "totalCount": 0
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "totalCount": 346
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "totalCount": 361
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "totalCount": 930
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "totalCount": 514
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "totalCount": 218
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "totalCount": 855
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
    "totalCount": 384
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "totalCount": 209
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "totalCount": 202
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "totalCount": 57
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "totalCount": 201
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "totalCount": 85
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "totalCount": 104
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
    "totalCount": 138
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "totalCount": 111
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "totalCount": 78
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "totalCount": 1123
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "totalCount": 369
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "totalCount": 412
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "totalCount": 191
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "totalCount": 140
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "totalCount": 142
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "totalCount": 132
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
    "totalCount": 60
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "totalCount": 93
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "totalCount": 84
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "totalCount": 239
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "totalCount": 579
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "totalCount": 353
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "totalCount": 635
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "totalCount": 522
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "totalCount": 289
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "totalCount": 366
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "totalCount": 367
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "totalCount": 171
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "totalCount": 159
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "totalCount": 78
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "totalCount": 53
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "totalCount": 47
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "totalCount": 105
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "totalCount": 71
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "totalCount": 107
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "totalCount": 65
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "totalCount": 55
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "totalCount": 103
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "totalCount": 77
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "totalCount": 115
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
    "totalCount": 62
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
    "totalCount": 139
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "totalCount": 140
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "totalCount": 160
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "totalCount": 137
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "totalCount": 867
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "totalCount": 535
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "totalCount": 409
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "totalCount": 388
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "totalCount": 715
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "totalCount": 439
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "totalCount": 364
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "totalCount": 127
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "totalCount": 402
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "totalCount": 338
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "totalCount": 248
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "totalCount": 209
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "totalCount": 479
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "totalCount": 508
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "totalCount": 270
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "totalCount": 259
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "totalCount": 602
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "totalCount": 918
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
    "sgisCode": "26010",
    "name": "중구",
    "totalCount": 236
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "totalCount": 626
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "totalCount": 175
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "totalCount": 192
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "totalCount": 209
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "totalCount": 671
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "totalCount": 306
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "totalCount": 158
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "totalCount": 227
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "totalCount": 472
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "totalCount": 144
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "totalCount": 148
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
    "totalCount": 352
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "totalCount": 0
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
    "totalCount": 47
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
    "totalCount": 35
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
    "totalCount": 1363
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "totalCount": 487
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "totalCount": 163
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "totalCount": 142
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "totalCount": 594
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "totalCount": 137
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "totalCount": 238
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "totalCount": 427
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
    "totalCount": 67
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "totalCount": 73
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "totalCount": 60
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "totalCount": 65
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "totalCount": 96
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "totalCount": 75
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "totalCount": 774
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "totalCount": 276
  }
];

/** 시도 합산 의료기관 수 (SGIS 2자리) */
export const MEDICAL_FALLBACK_SIDO: MedicalFacilityStat[] = [
  {
    "sgisCode": "11",
    "name": "서울",
    "totalCount": 19772
  },
  {
    "sgisCode": "23",
    "name": "인천",
    "totalCount": 3905
  },
  {
    "sgisCode": "31",
    "name": "경기",
    "totalCount": 17571
  },
  {
    "sgisCode": "32",
    "name": "강원",
    "totalCount": 1988
  },
  {
    "sgisCode": "33",
    "name": "충북",
    "totalCount": 2212
  },
  {
    "sgisCode": "25",
    "name": "대전",
    "totalCount": 2369
  },
  {
    "sgisCode": "34",
    "name": "충남",
    "totalCount": 2876
  },
  {
    "sgisCode": "35",
    "name": "전북",
    "totalCount": 2924
  },
  {
    "sgisCode": "24",
    "name": "광주",
    "totalCount": 2328
  },
  {
    "sgisCode": "36",
    "name": "전남",
    "totalCount": 2627
  },
  {
    "sgisCode": "21",
    "name": "부산",
    "totalCount": 5617
  },
  {
    "sgisCode": "22",
    "name": "대구",
    "totalCount": 4194
  },
  {
    "sgisCode": "26",
    "name": "울산",
    "totalCount": 1438
  },
  {
    "sgisCode": "37",
    "name": "경북",
    "totalCount": 3419
  },
  {
    "sgisCode": "38",
    "name": "경남",
    "totalCount": 4269
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "totalCount": 1050
  }
];

const SIGUNGU_INDEX = new Map(
  MEDICAL_FALLBACK_SIGUNGU.map((m) => [m.sgisCode, m]),
);
const SIDO_INDEX = new Map(MEDICAL_FALLBACK_SIDO.map((m) => [m.sgisCode, m]));

export function getMedicalFallback(sgisCode: string): MedicalFacilityStat | null {
  return SIGUNGU_INDEX.get(sgisCode) ?? SIDO_INDEX.get(sgisCode) ?? null;
}
