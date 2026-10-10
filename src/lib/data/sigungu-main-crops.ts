/**
 * 시·군·구·구 '주요 작물' — 2025 농림어업총조사 재배면적 (scripts/collect-sigungu-main-crops.ts 가 생성, 손으로 고치지 않는다)
 *
 * 규칙: 그 단위 안에서 재배면적 큰 순 최대 3개, 각 10ha 이상. 대상은 총조사에 항목이 있는 우리 작물
 * 37종(crop-sigungu-tables.ts). 원천: 국가데이터처 KOSIS orgId 101 DT_1AG25401·25402·25403·25407·25411,
 * 2025-12-01 기준. 수집 때 항목 이름·단위·짝·원천 시·도 = 시·군·구 합·시 = 구 합을 확인했다. 수집일: 2026-10-10
 * 값은 농가 주소지 기준(경작지가 다른 시·군·구에 있을 수 있다). 주소지 쏠림이 큰 시·도(seoul)와
 * 표에 없는 단위(인천·화성 2026 신설 구)는 키가 없거나 빈 배열 — 화면은 '자료 없음'.
 */

export interface MainCropEntry {
  cropId: string;
  /** CROPS.name */
  crop: string;
  /** 2025 재배면적 (ha) */
  areaHa: number;
}

export const MAIN_CROPS_SOURCE = "2025 농림어업총조사(국가데이터처)";
export const MAIN_CROP_RULE = { maxCrops: 3, minAreaHa: 10, residenceSkewMax: 3, cropCount: 37 } as const;
/** 주소지 쏠림으로 제외한 시·도 id */
export const MAIN_CROPS_SKEWED_PROVINCES: readonly string[] = ["seoul"];

/** SIGUNGUS.id → 주요 작물 */
export const SIGUNGU_MAIN_CROPS: Record<string, MainCropEntry[]> = {
  "jongno": [],
  "jung-gu-seoul": [],
  "yongsan": [],
  "seongdong": [],
  "gwangjin": [],
  "dongdaemun": [],
  "jungnang": [],
  "seongbuk": [],
  "gangbuk": [],
  "dobong": [],
  "nowon": [],
  "eunpyeong": [],
  "seodaemun": [],
  "mapo": [],
  "yangcheon": [],
  "gangseo": [],
  "guro": [],
  "geumcheon": [],
  "yeongdeungpo": [],
  "dongjak": [],
  "gwanak": [],
  "seocho": [],
  "gangnam": [],
  "songpa": [],
  "gangdong": [],
  "michuhol": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 85
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 24
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 17
    }
  ],
  "yeonsu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 185
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 43
    },
    {
      "cropId": "potato",
      "crop": "감자",
      "areaHa": 20
    }
  ],
  "namdong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 220
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 48
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 42
    }
  ],
  "bupyeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 241
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 25
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 19
    }
  ],
  "gyeyang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 304
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 25
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 24
    }
  ],
  "ganghwa": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 6999
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 364
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 241
    }
  ],
  "ongjin": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 774
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 97
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 56
    }
  ],
  "suwon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1513
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 130
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 126
    }
  ],
  "seongnam": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 209
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 47
    },
    {
      "cropId": "potato",
      "crop": "감자",
      "areaHa": 40
    }
  ],
  "uijeongbu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 229
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 71
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 55
    }
  ],
  "anyang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 262
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 38
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 31
    }
  ],
  "bucheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 357
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 43
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 35
    }
  ],
  "gwangmyeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 125
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 32
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 21
    }
  ],
  "pyeongtaek": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 8338
    },
    {
      "cropId": "pear",
      "crop": "배",
      "areaHa": 252
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 252
    }
  ],
  "dongducheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 106
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 64
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 45
    }
  ],
  "ansan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 552
    },
    {
      "cropId": "grape",
      "crop": "포도",
      "areaHa": 144
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 57
    }
  ],
  "goyang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1153
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 199
    },
    {
      "cropId": "spinach",
      "crop": "시금치",
      "areaHa": 141
    }
  ],
  "gwacheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 47
    }
  ],
  "guri": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 46
    },
    {
      "cropId": "green-onion",
      "crop": "대파",
      "areaHa": 25
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 23
    }
  ],
  "namyangju": [
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 244
    },
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 234
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 152
    }
  ],
  "osan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 535
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 37
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 27
    }
  ],
  "siheung": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 601
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 71
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 61
    }
  ],
  "gunpo": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 165
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 24
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 23
    }
  ],
  "uiwang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 98
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 25
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 18
    }
  ],
  "hanam": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 81
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 37
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 32
    }
  ],
  "yongin": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3104
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 293
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 213
    }
  ],
  "paju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 5348
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 1005
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 395
    }
  ],
  "icheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 5638
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 475
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 445
    }
  ],
  "anseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 5248
    },
    {
      "cropId": "pear",
      "crop": "배",
      "areaHa": 408
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 376
    }
  ],
  "gimpo": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3465
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 134
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 134
    }
  ],
  "hwaseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 8180
    },
    {
      "cropId": "grape",
      "crop": "포도",
      "areaHa": 460
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 361
    }
  ],
  "gwangju-gg": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 581
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 155
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 141
    }
  ],
  "yangju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 980
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 198
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 195
    }
  ],
  "pocheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2138
    },
    {
      "cropId": "spinach",
      "crop": "시금치",
      "areaHa": 544
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 497
    }
  ],
  "yeoju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 5728
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 1172
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 268
    }
  ],
  "yangpyeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2219
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 327
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 248
    }
  ],
  "gapyeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 571
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 333
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 140
    }
  ],
  "yeoncheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2211
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 939
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 236
    }
  ],
  "chuncheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 866
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 422
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 375
    }
  ],
  "wonju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2310
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 604
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 481
    }
  ],
  "gangneung": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1767
    },
    {
      "cropId": "potato",
      "crop": "감자",
      "areaHa": 732
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 555
    }
  ],
  "donghae": [
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 108
    },
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 91
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 85
    }
  ],
  "taebaek": [
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 436
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 59
    },
    {
      "cropId": "radish",
      "crop": "무",
      "areaHa": 39
    }
  ],
  "sokcho": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 284
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 47
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 43
    }
  ],
  "samcheok": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 439
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 309
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 202
    }
  ],
  "hongcheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1802
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 878
    },
    {
      "cropId": "potato",
      "crop": "감자",
      "areaHa": 799
    }
  ],
  "hoengseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1533
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 684
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 363
    }
  ],
  "yeongwol": [
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 690
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 555
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 348
    }
  ],
  "pyeongchang": [
    {
      "cropId": "potato",
      "crop": "감자",
      "areaHa": 1249
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 1154
    },
    {
      "cropId": "radish",
      "crop": "무",
      "areaHa": 660
    }
  ],
  "jeongseon": [
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 583
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 456
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 384
    }
  ],
  "cheorwon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 7904
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 357
    },
    {
      "cropId": "paprika",
      "crop": "파프리카",
      "areaHa": 183
    }
  ],
  "hwacheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 462
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 314
    },
    {
      "cropId": "ginseng",
      "crop": "인삼",
      "areaHa": 144
    }
  ],
  "yanggu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 917
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 221
    },
    {
      "cropId": "watermelon",
      "crop": "수박",
      "areaHa": 205
    }
  ],
  "inje": [
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 429
    },
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 376
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 269
    }
  ],
  "goseong-gw": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2290
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 150
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 79
    }
  ],
  "yangyang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1286
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 169
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 127
    }
  ],
  "cheongju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 8031
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 614
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 470
    }
  ],
  "chungju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3729
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 1040
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 950
    }
  ],
  "jecheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1085
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 740
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 469
    }
  ],
  "boeun": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2735
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 369
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 243
    }
  ],
  "okcheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1310
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 301
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 274
    }
  ],
  "yeongdong": [
    {
      "cropId": "grape",
      "crop": "포도",
      "areaHa": 1013
    },
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 751
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 746
    }
  ],
  "jeungpyeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 748
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 64
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 53
    }
  ],
  "jincheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3021
    },
    {
      "cropId": "watermelon",
      "crop": "수박",
      "areaHa": 308
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 162
    }
  ],
  "goesan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1510
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 1305
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 718
    }
  ],
  "eumseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2942
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 1000
    },
    {
      "cropId": "watermelon",
      "crop": "수박",
      "areaHa": 774
    }
  ],
  "danyang": [
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 632
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 403
    },
    {
      "cropId": "garlic",
      "crop": "마늘",
      "areaHa": 219
    }
  ],
  "sejong-si": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3032
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 310
    },
    {
      "cropId": "chestnut",
      "crop": "밤",
      "areaHa": 285
    }
  ],
  "dong-gu-daejeon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 125
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 78
    },
    {
      "cropId": "grape",
      "crop": "포도",
      "areaHa": 65
    }
  ],
  "jung-gu-daejeon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 239
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 74
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 64
    }
  ],
  "seo-gu-daejeon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 691
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 138
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 93
    }
  ],
  "yuseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 728
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 153
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 94
    }
  ],
  "daedeok": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 287
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 70
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 62
    }
  ],
  "cheonan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 4667
    },
    {
      "cropId": "pear",
      "crop": "배",
      "areaHa": 809
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 385
    }
  ],
  "gongju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 4902
    },
    {
      "cropId": "chestnut",
      "crop": "밤",
      "areaHa": 3297
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 732
    }
  ],
  "boryeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 6450
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 268
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 227
    }
  ],
  "asan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 6745
    },
    {
      "cropId": "pear",
      "crop": "배",
      "areaHa": 475
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 354
    }
  ],
  "seosan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 11446
    },
    {
      "cropId": "garlic",
      "crop": "마늘",
      "areaHa": 1270
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 574
    }
  ],
  "nonsan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 7972
    },
    {
      "cropId": "strawberry",
      "crop": "딸기",
      "areaHa": 598
    },
    {
      "cropId": "lettuce",
      "crop": "상추",
      "areaHa": 414
    }
  ],
  "gyeryong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 202
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 27
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 11
    }
  ],
  "dangjin": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 13448
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 1115
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 728
    }
  ],
  "geumsan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1147
    },
    {
      "cropId": "ginseng",
      "crop": "인삼",
      "areaHa": 614
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 431
    }
  ],
  "buyeo": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 7604
    },
    {
      "cropId": "chestnut",
      "crop": "밤",
      "areaHa": 2902
    },
    {
      "cropId": "watermelon",
      "crop": "수박",
      "areaHa": 919
    }
  ],
  "seocheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 7437
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 243
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 186
    }
  ],
  "cheongyang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3944
    },
    {
      "cropId": "chestnut",
      "crop": "밤",
      "areaHa": 1302
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 525
    }
  ],
  "hongseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 6817
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 425
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 375
    }
  ],
  "yesan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 7590
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 702
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 531
    }
  ],
  "taean": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 5101
    },
    {
      "cropId": "garlic",
      "crop": "마늘",
      "areaHa": 945
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 597
    }
  ],
  "jeonju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3222
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 316
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 218
    }
  ],
  "gunsan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 9630
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 186
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 90
    }
  ],
  "iksan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 12754
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 897
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 625
    }
  ],
  "jeongeup": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 9439
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 1134
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 522
    }
  ],
  "namwon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 6719
    },
    {
      "cropId": "grape",
      "crop": "포도",
      "areaHa": 302
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 203
    }
  ],
  "gimje": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 10156
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 4007
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 569
    }
  ],
  "wanju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2641
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 340
    },
    {
      "cropId": "green-onion",
      "crop": "대파",
      "areaHa": 273
    }
  ],
  "jinan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1344
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 390
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 339
    }
  ],
  "muju": [
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 639
    },
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 627
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 155
    }
  ],
  "jangsu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1873
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 533
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 151
    }
  ],
  "imsil": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2803
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 272
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 251
    }
  ],
  "sunchang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3881
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 664
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 171
    }
  ],
  "gochang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 9100
    },
    {
      "cropId": "watermelon",
      "crop": "수박",
      "areaHa": 820
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 767
    }
  ],
  "buan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 9112
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 2102
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 181
    }
  ],
  "dong-gu-gwangju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 204
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 52
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 15
    }
  ],
  "seo-gu-gwangju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 923
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 109
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 70
    }
  ],
  "nam-gu-gwangju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1131
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 230
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 91
    }
  ],
  "buk-gu-gwangju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1420
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 178
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 78
    }
  ],
  "gwangsan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2596
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 243
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 142
    }
  ],
  "mokpo": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 564
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 60
    },
    {
      "cropId": "green-onion",
      "crop": "대파",
      "areaHa": 58
    }
  ],
  "yeosu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1239
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 233
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 139
    }
  ],
  "suncheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3825
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 604
    },
    {
      "cropId": "maesil",
      "crop": "매실",
      "areaHa": 579
    }
  ],
  "naju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 7616
    },
    {
      "cropId": "pear",
      "crop": "배",
      "areaHa": 1148
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 403
    }
  ],
  "gwangyang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1194
    },
    {
      "cropId": "maesil",
      "crop": "매실",
      "areaHa": 677
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 597
    }
  ],
  "damyang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3845
    },
    {
      "cropId": "strawberry",
      "crop": "딸기",
      "areaHa": 211
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 114
    }
  ],
  "gokseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3015
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 208
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 193
    }
  ],
  "gurye": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1625
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 422
    },
    {
      "cropId": "chestnut",
      "crop": "밤",
      "areaHa": 295
    }
  ],
  "goheung": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 7302
    },
    {
      "cropId": "garlic",
      "crop": "마늘",
      "areaHa": 607
    },
    {
      "cropId": "onion",
      "crop": "양파",
      "areaHa": 442
    }
  ],
  "boseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 5748
    },
    {
      "cropId": "potato",
      "crop": "감자",
      "areaHa": 608
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 176
    }
  ],
  "hwasun": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3166
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 304
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 161
    }
  ],
  "jangheung": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 6197
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 193
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 176
    }
  ],
  "gangjin": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 6951
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 303
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 123
    }
  ],
  "haenam": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 13838
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 4445
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 1149
    }
  ],
  "yeongam": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 9618
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 849
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 500
    }
  ],
  "muan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 5531
    },
    {
      "cropId": "onion",
      "crop": "양파",
      "areaHa": 2138
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 747
    }
  ],
  "hampyeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 5235
    },
    {
      "cropId": "onion",
      "crop": "양파",
      "areaHa": 323
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 258
    }
  ],
  "yeonggwang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 7429
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 662
    },
    {
      "cropId": "green-onion",
      "crop": "대파",
      "areaHa": 288
    }
  ],
  "jangseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2912
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 400
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 210
    }
  ],
  "wando": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1023
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 140
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 124
    }
  ],
  "jindo": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3868
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 1055
    },
    {
      "cropId": "green-onion",
      "crop": "대파",
      "areaHa": 1052
    }
  ],
  "sinan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 6267
    },
    {
      "cropId": "green-onion",
      "crop": "대파",
      "areaHa": 1308
    },
    {
      "cropId": "onion",
      "crop": "양파",
      "areaHa": 646
    }
  ],
  "jung-gu-busan": [],
  "seo-gu-busan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 22
    }
  ],
  "dong-gu-busan": [],
  "yeongdo": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 13
    }
  ],
  "busanjin": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 74
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 29
    },
    {
      "cropId": "maesil",
      "crop": "매실",
      "areaHa": 11
    }
  ],
  "dongnae": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 78
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 31
    },
    {
      "cropId": "maesil",
      "crop": "매실",
      "areaHa": 13
    }
  ],
  "nam-gu-busan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 90
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 30
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 14
    }
  ],
  "buk-gu-busan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 189
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 66
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 25
    }
  ],
  "haeundae": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 86
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 50
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 22
    }
  ],
  "saha": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 89
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 26
    }
  ],
  "geumjeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 65
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 39
    },
    {
      "cropId": "carrot",
      "crop": "당근",
      "areaHa": 19
    }
  ],
  "gangseo-busan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1097
    },
    {
      "cropId": "tomato",
      "crop": "토마토",
      "areaHa": 228
    },
    {
      "cropId": "green-onion",
      "crop": "대파",
      "areaHa": 181
    }
  ],
  "yeonje": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 46
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 19
    }
  ],
  "suyeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 38
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 13
    }
  ],
  "sasang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 87
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 34
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 13
    }
  ],
  "gijang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 279
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 54
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 53
    }
  ],
  "jung-gu-daegu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 45
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 15
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 14
    }
  ],
  "dong-gu-daegu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 269
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 177
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 112
    }
  ],
  "seo-gu-daegu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 81
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 33
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 18
    }
  ],
  "nam-gu-daegu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 47
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 20
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 10
    }
  ],
  "buk-gu-daegu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 336
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 122
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 81
    }
  ],
  "suseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 281
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 187
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 143
    }
  ],
  "dalseo": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 849
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 125
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 99
    }
  ],
  "dalseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2137
    },
    {
      "cropId": "garlic",
      "crop": "마늘",
      "areaHa": 329
    },
    {
      "cropId": "watermelon",
      "crop": "수박",
      "areaHa": 167
    }
  ],
  "gunwi": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1609
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 287
    },
    {
      "cropId": "plum",
      "crop": "자두",
      "areaHa": 269
    }
  ],
  "jung-gu-ulsan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 254
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 90
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 52
    }
  ],
  "nam-gu-ulsan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 368
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 86
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 50
    }
  ],
  "dong-gu-ulsan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 50
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 23
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 19
    }
  ],
  "buk-gu-ulsan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 411
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 41
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 35
    }
  ],
  "ulju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2057
    },
    {
      "cropId": "pear",
      "crop": "배",
      "areaHa": 263
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 125
    }
  ],
  "pohang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 5510
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 857
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 264
    }
  ],
  "gyeongju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 8202
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 289
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 245
    }
  ],
  "gimcheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2997
    },
    {
      "cropId": "grape",
      "crop": "포도",
      "areaHa": 2174
    },
    {
      "cropId": "plum",
      "crop": "자두",
      "areaHa": 832
    }
  ],
  "andong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3438
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 2055
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 1285
    }
  ],
  "gumi": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 5966
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 282
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 229
    }
  ],
  "yeongju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2592
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 2213
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 528
    }
  ],
  "yeongcheon": [
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 1539
    },
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1415
    },
    {
      "cropId": "grape",
      "crop": "포도",
      "areaHa": 1088
    }
  ],
  "sangju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 8540
    },
    {
      "cropId": "grape",
      "crop": "포도",
      "areaHa": 1733
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 1310
    }
  ],
  "mungyeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3367
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 1628
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 901
    }
  ],
  "gyeongsan": [
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 1686
    },
    {
      "cropId": "grape",
      "crop": "포도",
      "areaHa": 744
    },
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 648
    }
  ],
  "uiseong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 7227
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 1426
    },
    {
      "cropId": "plum",
      "crop": "자두",
      "areaHa": 927
    }
  ],
  "cheongsong": [
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 3006
    },
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 545
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 320
    }
  ],
  "yeongyang": [
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 1262
    },
    {
      "cropId": "napa-cabbage",
      "crop": "배추",
      "areaHa": 485
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 408
    }
  ],
  "yeongdeok": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1583
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 490
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 156
    }
  ],
  "cheongdo": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1508
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 1269
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 944
    }
  ],
  "goryeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2386
    },
    {
      "cropId": "garlic",
      "crop": "마늘",
      "areaHa": 615
    },
    {
      "cropId": "onion",
      "crop": "양파",
      "areaHa": 337
    }
  ],
  "seongju": [
    {
      "cropId": "melon",
      "crop": "참외",
      "areaHa": 2196
    },
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1325
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 112
    }
  ],
  "chilgok": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1423
    },
    {
      "cropId": "melon",
      "crop": "참외",
      "areaHa": 214
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 90
    }
  ],
  "yecheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 6983
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 605
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 592
    }
  ],
  "bonghwa": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1440
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 1226
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 1126
    }
  ],
  "uljin": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1532
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 214
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 74
    }
  ],
  "ulleung": [],
  "changwon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3754
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 1949
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 287
    }
  ],
  "jinju": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3448
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 918
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 662
    }
  ],
  "tongyeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 215
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 97
    },
    {
      "cropId": "spinach",
      "crop": "시금치",
      "areaHa": 89
    }
  ],
  "sacheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2452
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 272
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 167
    }
  ],
  "gimhae": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2863
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 772
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 83
    }
  ],
  "miryang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3494
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 668
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 617
    }
  ],
  "geoje": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 928
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 128
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 124
    }
  ],
  "yangsan": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 643
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 86
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 63
    }
  ],
  "uiryeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2261
    },
    {
      "cropId": "garlic",
      "crop": "마늘",
      "areaHa": 144
    },
    {
      "cropId": "onion",
      "crop": "양파",
      "areaHa": 126
    }
  ],
  "haman": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3282
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 427
    },
    {
      "cropId": "watermelon",
      "crop": "수박",
      "areaHa": 310
    }
  ],
  "changnyeong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 5087
    },
    {
      "cropId": "garlic",
      "crop": "마늘",
      "areaHa": 3068
    },
    {
      "cropId": "onion",
      "crop": "양파",
      "areaHa": 363
    }
  ],
  "goseong-gn": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 3547
    },
    {
      "cropId": "spinach",
      "crop": "시금치",
      "areaHa": 259
    },
    {
      "cropId": "corn",
      "crop": "옥수수",
      "areaHa": 165
    }
  ],
  "namhae": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1727
    },
    {
      "cropId": "spinach",
      "crop": "시금치",
      "areaHa": 1061
    },
    {
      "cropId": "garlic",
      "crop": "마늘",
      "areaHa": 265
    }
  ],
  "hadong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2998
    },
    {
      "cropId": "chestnut",
      "crop": "밤",
      "areaHa": 667
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 636
    }
  ],
  "sancheong": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2515
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 706
    },
    {
      "cropId": "strawberry",
      "crop": "딸기",
      "areaHa": 323
    }
  ],
  "hamyang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2397
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 397
    },
    {
      "cropId": "chestnut",
      "crop": "밤",
      "areaHa": 383
    }
  ],
  "geochang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2919
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 1375
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 214
    }
  ],
  "hapcheon": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 4765
    },
    {
      "cropId": "garlic",
      "crop": "마늘",
      "areaHa": 934
    },
    {
      "cropId": "chestnut",
      "crop": "밤",
      "areaHa": 259
    }
  ],
  "jeju-si": [
    {
      "cropId": "citrus",
      "crop": "감귤",
      "areaHa": 6766
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 1945
    },
    {
      "cropId": "carrot",
      "crop": "당근",
      "areaHa": 1355
    }
  ],
  "seogwipo": [
    {
      "cropId": "citrus",
      "crop": "감귤",
      "areaHa": 8911
    },
    {
      "cropId": "radish",
      "crop": "무",
      "areaHa": 2481
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 585
    }
  ]
};

/** GUS.id → 주요 작물 */
export const GU_MAIN_CROPS: Record<string, MainCropEntry[]> = {
  "jangan-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 307
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 40
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 37
    }
  ],
  "gwonseon-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 581
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 46
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 44
    }
  ],
  "paldal-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 203
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 18
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 17
    }
  ],
  "yeongtong-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 422
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 43
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 31
    }
  ],
  "sujeong-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 54
    },
    {
      "cropId": "potato",
      "crop": "감자",
      "areaHa": 14
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 12
    }
  ],
  "jungwon-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 26
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 10
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 10
    }
  ],
  "bundang-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 130
    },
    {
      "cropId": "pear",
      "crop": "배",
      "areaHa": 25
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 25
    }
  ],
  "manan-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 103
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 15
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 14
    }
  ],
  "dongan-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 159
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 23
    },
    {
      "cropId": "potato",
      "crop": "감자",
      "areaHa": 19
    }
  ],
  "sangnok-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 233
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 25
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 23
    }
  ],
  "danwon-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 319
    },
    {
      "cropId": "grape",
      "crop": "포도",
      "areaHa": 135
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 32
    }
  ],
  "deogyang-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 318
    },
    {
      "cropId": "spinach",
      "crop": "시금치",
      "areaHa": 86
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 82
    }
  ],
  "ilsandong-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 364
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 61
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 46
    }
  ],
  "ilsanseo-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 471
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 55
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 25
    }
  ],
  "cheoin-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2426
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 226
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 150
    }
  ],
  "giheung-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 427
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 45
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 41
    }
  ],
  "suji-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 251
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 34
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 30
    }
  ],
  "wonmi-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 201
    },
    {
      "cropId": "sweet-potato",
      "crop": "고구마",
      "areaHa": 26
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 23
    }
  ],
  "sosa-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 54
    }
  ],
  "ojeong-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 102
    }
  ],
  "sangdang-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1761
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 233
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 180
    }
  ],
  "heungdeok-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2467
    },
    {
      "cropId": "zucchini",
      "crop": "호박",
      "areaHa": 161
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 107
    }
  ],
  "cheongwon-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2574
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 162
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 127
    }
  ],
  "seowon-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1228
    },
    {
      "cropId": "perilla-seed",
      "crop": "들깨",
      "areaHa": 117
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 91
    }
  ],
  "dongnam-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2455
    },
    {
      "cropId": "cucumber",
      "crop": "오이",
      "areaHa": 242
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 207
    }
  ],
  "seobuk-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2212
    },
    {
      "cropId": "pear",
      "crop": "배",
      "areaHa": 758
    },
    {
      "cropId": "grape",
      "crop": "포도",
      "areaHa": 287
    }
  ],
  "wansan-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1188
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 165
    },
    {
      "cropId": "peach",
      "crop": "복숭아",
      "areaHa": 149
    }
  ],
  "deokjin-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 2034
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 151
    },
    {
      "cropId": "pear",
      "crop": "배",
      "areaHa": 102
    }
  ],
  "nam-gu-pohang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1436
    },
    {
      "cropId": "spinach",
      "crop": "시금치",
      "areaHa": 128
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 115
    }
  ],
  "buk-gu-pohang": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 4074
    },
    {
      "cropId": "apple",
      "crop": "사과",
      "areaHa": 814
    },
    {
      "cropId": "soybean",
      "crop": "콩",
      "areaHa": 158
    }
  ],
  "uichang-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 1817
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 1383
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 130
    }
  ],
  "seongsan-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 483
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 240
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 38
    }
  ],
  "masanhappo-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 957
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 109
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 58
    }
  ],
  "masanhoewon-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 340
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 155
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 32
    }
  ],
  "jinhae-gu": [
    {
      "cropId": "rice",
      "crop": "쌀",
      "areaHa": 157
    },
    {
      "cropId": "persimmon",
      "crop": "감",
      "areaHa": 60
    },
    {
      "cropId": "chili-pepper",
      "crop": "고추",
      "areaHa": 28
    }
  ]
};
