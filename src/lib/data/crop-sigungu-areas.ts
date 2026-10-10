/**
 * 작물별 재배면적 상위 시·군·구 — 2025 농림어업총조사 (scripts/collect-crop-sigungu-areas.ts 가 생성, 손으로 고치지 않는다)
 *
 * 항목: crop-sigungu-tables.ts. 수집 때 항목 이름·단위·시·군·구 짝·원천 시·도 = 시·군·구 합을 확인했다.
 * 작물 상세 '주요 산지 (시·군·구)' 칩이 이 순서를 쓴다. 시·도 행(provinces)은 CROP_AREAS(농작물생산조사)가 없는 작물의
 * 주산지(majorRegions) 근거다 — 원천 시·도 행 값, 큰 순. 수집일: 2026-10-10
 */

export interface CropSigunguArea {
  /** 더한 원천 항목 (표 ID + 항목 이름) */
  items: string[];
  /** 원천 단위 */
  unit: string;
  /** 시·도 행 합 */
  totalArea: number;
  /** 시·도별 재배면적(원천 시·도 행), 큰 순 */
  provinces: { provinceId: string; area: number }[];
  /** 재배면적 큰 순 상위 시·군·구 */
  top: { sigunguId: string; area: number }[];
}

export const CROP_SIGUNGU_YEAR = 2025;

export const CROP_SIGUNGU_AREAS: Record<string, CropSigunguArea> = {
  "rice": {
    "items": [
      "DT_1AG25401 재배 면적"
    ],
    "unit": "ha",
    "totalArea": 547620,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "area": 108008
      },
      {
        "provinceId": "chungnam",
        "area": 95472
      },
      {
        "provinceId": "jeonbuk",
        "area": 83300
      },
      {
        "provinceId": "gyeongbuk",
        "area": 68925
      },
      {
        "provinceId": "gyeonggi",
        "area": 60060
      },
      {
        "provinceId": "gyeongnam",
        "area": 49295
      },
      {
        "provinceId": "chungbuk",
        "area": 25964
      },
      {
        "provinceId": "gangwon",
        "area": 22772
      },
      {
        "provinceId": "incheon",
        "area": 9365
      },
      {
        "provinceId": "gwangju",
        "area": 6275
      },
      {
        "provinceId": "daegu",
        "area": 5654
      },
      {
        "provinceId": "ulsan",
        "area": 3140
      },
      {
        "provinceId": "sejong",
        "area": 3032
      },
      {
        "provinceId": "busan",
        "area": 2262
      },
      {
        "provinceId": "daejeon",
        "area": 2070
      },
      {
        "provinceId": "seoul",
        "area": 2003
      },
      {
        "provinceId": "jeju",
        "area": 23
      }
    ],
    "top": [
      {
        "sigunguId": "haenam",
        "area": 13838
      },
      {
        "sigunguId": "dangjin",
        "area": 13448
      },
      {
        "sigunguId": "iksan",
        "area": 12754
      },
      {
        "sigunguId": "seosan",
        "area": 11446
      },
      {
        "sigunguId": "gimje",
        "area": 10156
      },
      {
        "sigunguId": "gunsan",
        "area": 9630
      },
      {
        "sigunguId": "yeongam",
        "area": 9618
      },
      {
        "sigunguId": "jeongeup",
        "area": 9439
      },
      {
        "sigunguId": "buan",
        "area": 9112
      },
      {
        "sigunguId": "gochang",
        "area": 9100
      }
    ]
  },
  "corn": {
    "items": [
      "DT_1AG25402 옥수수_면적"
    ],
    "unit": "ha",
    "totalArea": 13291,
    "provinces": [
      {
        "provinceId": "gangwon",
        "area": 5328
      },
      {
        "provinceId": "chungbuk",
        "area": 2080
      },
      {
        "provinceId": "gyeonggi",
        "area": 1764
      },
      {
        "provinceId": "jeonnam",
        "area": 904
      },
      {
        "provinceId": "chungnam",
        "area": 666
      },
      {
        "provinceId": "gyeongbuk",
        "area": 664
      },
      {
        "provinceId": "jeonbuk",
        "area": 641
      },
      {
        "provinceId": "gyeongnam",
        "area": 466
      },
      {
        "provinceId": "seoul",
        "area": 150
      },
      {
        "provinceId": "ulsan",
        "area": 137
      },
      {
        "provinceId": "daejeon",
        "area": 86
      },
      {
        "provinceId": "sejong",
        "area": 84
      },
      {
        "provinceId": "incheon",
        "area": 79
      },
      {
        "provinceId": "busan",
        "area": 68
      },
      {
        "provinceId": "daegu",
        "area": 67
      },
      {
        "provinceId": "jeju",
        "area": 67
      },
      {
        "provinceId": "gwangju",
        "area": 40
      }
    ],
    "top": [
      {
        "sigunguId": "hongcheon",
        "area": 878
      },
      {
        "sigunguId": "goesan",
        "area": 718
      },
      {
        "sigunguId": "hoengseong",
        "area": 684
      },
      {
        "sigunguId": "wonju",
        "area": 604
      },
      {
        "sigunguId": "yeongwol",
        "area": 555
      },
      {
        "sigunguId": "jeongseon",
        "area": 384
      },
      {
        "sigunguId": "chuncheon",
        "area": 375
      },
      {
        "sigunguId": "pyeongchang",
        "area": 330
      },
      {
        "sigunguId": "cheongju",
        "area": 322
      },
      {
        "sigunguId": "chungju",
        "area": 299
      }
    ]
  },
  "soybean": {
    "items": [
      "DT_1AG25402 콩_면적"
    ],
    "unit": "ha",
    "totalArea": 49670,
    "provinces": [
      {
        "provinceId": "jeonbuk",
        "area": 11008
      },
      {
        "provinceId": "gyeongbuk",
        "area": 6465
      },
      {
        "provinceId": "chungnam",
        "area": 6239
      },
      {
        "provinceId": "gyeonggi",
        "area": 5655
      },
      {
        "provinceId": "chungbuk",
        "area": 5306
      },
      {
        "provinceId": "jeonnam",
        "area": 5065
      },
      {
        "provinceId": "gangwon",
        "area": 3583
      },
      {
        "provinceId": "jeju",
        "area": 2530
      },
      {
        "provinceId": "gyeongnam",
        "area": 1724
      },
      {
        "provinceId": "incheon",
        "area": 413
      },
      {
        "provinceId": "gwangju",
        "area": 366
      },
      {
        "provinceId": "seoul",
        "area": 342
      },
      {
        "provinceId": "daegu",
        "area": 328
      },
      {
        "provinceId": "daejeon",
        "area": 295
      },
      {
        "provinceId": "sejong",
        "area": 180
      },
      {
        "provinceId": "ulsan",
        "area": 108
      },
      {
        "provinceId": "busan",
        "area": 63
      }
    ],
    "top": [
      {
        "sigunguId": "gimje",
        "area": 4007
      },
      {
        "sigunguId": "buan",
        "area": 2102
      },
      {
        "sigunguId": "jeju-si",
        "area": 1945
      },
      {
        "sigunguId": "goesan",
        "area": 1305
      },
      {
        "sigunguId": "jeongeup",
        "area": 1134
      },
      {
        "sigunguId": "dangjin",
        "area": 1115
      },
      {
        "sigunguId": "chungju",
        "area": 1040
      },
      {
        "sigunguId": "andong",
        "area": 1030
      },
      {
        "sigunguId": "paju",
        "area": 1005
      },
      {
        "sigunguId": "yeoncheon",
        "area": 939
      }
    ]
  },
  "potato": {
    "items": [
      "DT_1AG25402 감자_면적"
    ],
    "unit": "ha",
    "totalArea": 14489,
    "provinces": [
      {
        "provinceId": "gangwon",
        "area": 4795
      },
      {
        "provinceId": "gyeonggi",
        "area": 1644
      },
      {
        "provinceId": "chungnam",
        "area": 1508
      },
      {
        "provinceId": "gyeongbuk",
        "area": 1217
      },
      {
        "provinceId": "jeonnam",
        "area": 1048
      },
      {
        "provinceId": "gyeongnam",
        "area": 959
      },
      {
        "provinceId": "jeonbuk",
        "area": 862
      },
      {
        "provinceId": "chungbuk",
        "area": 722
      },
      {
        "provinceId": "jeju",
        "area": 711
      },
      {
        "provinceId": "incheon",
        "area": 228
      },
      {
        "provinceId": "seoul",
        "area": 184
      },
      {
        "provinceId": "daejeon",
        "area": 148
      },
      {
        "provinceId": "ulsan",
        "area": 126
      },
      {
        "provinceId": "daegu",
        "area": 125
      },
      {
        "provinceId": "busan",
        "area": 82
      },
      {
        "provinceId": "gwangju",
        "area": 66
      },
      {
        "provinceId": "sejong",
        "area": 64
      }
    ],
    "top": [
      {
        "sigunguId": "pyeongchang",
        "area": 1249
      },
      {
        "sigunguId": "hongcheon",
        "area": 799
      },
      {
        "sigunguId": "gangneung",
        "area": 732
      },
      {
        "sigunguId": "boseong",
        "area": 608
      },
      {
        "sigunguId": "dangjin",
        "area": 509
      },
      {
        "sigunguId": "gimje",
        "area": 474
      },
      {
        "sigunguId": "miryang",
        "area": 430
      },
      {
        "sigunguId": "jeju-si",
        "area": 390
      },
      {
        "sigunguId": "seosan",
        "area": 388
      },
      {
        "sigunguId": "jeongseon",
        "area": 357
      }
    ]
  },
  "sweet-potato": {
    "items": [
      "DT_1AG25402 고구마_면적"
    ],
    "unit": "ha",
    "totalArea": 18047,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "area": 3665
      },
      {
        "provinceId": "gyeonggi",
        "area": 3514
      },
      {
        "provinceId": "jeonbuk",
        "area": 2615
      },
      {
        "provinceId": "chungnam",
        "area": 2555
      },
      {
        "provinceId": "gyeongbuk",
        "area": 1082
      },
      {
        "provinceId": "chungbuk",
        "area": 990
      },
      {
        "provinceId": "gyeongnam",
        "area": 913
      },
      {
        "provinceId": "incheon",
        "area": 674
      },
      {
        "provinceId": "gangwon",
        "area": 656
      },
      {
        "provinceId": "seoul",
        "area": 330
      },
      {
        "provinceId": "daejeon",
        "area": 248
      },
      {
        "provinceId": "gwangju",
        "area": 220
      },
      {
        "provinceId": "daegu",
        "area": 178
      },
      {
        "provinceId": "ulsan",
        "area": 171
      },
      {
        "provinceId": "busan",
        "area": 108
      },
      {
        "provinceId": "sejong",
        "area": 97
      },
      {
        "provinceId": "jeju",
        "area": 31
      }
    ],
    "top": [
      {
        "sigunguId": "yeoju",
        "area": 1172
      },
      {
        "sigunguId": "haenam",
        "area": 1149
      },
      {
        "sigunguId": "iksan",
        "area": 897
      },
      {
        "sigunguId": "yeongam",
        "area": 849
      },
      {
        "sigunguId": "dangjin",
        "area": 728
      },
      {
        "sigunguId": "muan",
        "area": 696
      },
      {
        "sigunguId": "gimje",
        "area": 569
      },
      {
        "sigunguId": "icheon",
        "area": 445
      },
      {
        "sigunguId": "gochang",
        "area": 366
      },
      {
        "sigunguId": "ganghwa",
        "area": 364
      }
    ]
  },
  "napa-cabbage": {
    "items": [
      "DT_1AG25403 배추_면적",
      "DT_1AG25407 배추_면적"
    ],
    "unit": "ha",
    "totalArea": 23009,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "area": 7226
      },
      {
        "provinceId": "gangwon",
        "area": 4399
      },
      {
        "provinceId": "gyeongbuk",
        "area": 2327
      },
      {
        "provinceId": "gyeonggi",
        "area": 1947
      },
      {
        "provinceId": "chungbuk",
        "area": 1452
      },
      {
        "provinceId": "chungnam",
        "area": 1396
      },
      {
        "provinceId": "jeonbuk",
        "area": 1328
      },
      {
        "provinceId": "gyeongnam",
        "area": 961
      },
      {
        "provinceId": "daegu",
        "area": 471
      },
      {
        "provinceId": "daejeon",
        "area": 284
      },
      {
        "provinceId": "gwangju",
        "area": 260
      },
      {
        "provinceId": "busan",
        "area": 228
      },
      {
        "provinceId": "ulsan",
        "area": 226
      },
      {
        "provinceId": "seoul",
        "area": 182
      },
      {
        "provinceId": "incheon",
        "area": 147
      },
      {
        "provinceId": "jeju",
        "area": 121
      },
      {
        "provinceId": "sejong",
        "area": 54
      }
    ],
    "top": [
      {
        "sigunguId": "haenam",
        "area": 4445
      },
      {
        "sigunguId": "pyeongchang",
        "area": 1154
      },
      {
        "sigunguId": "jindo",
        "area": 1055
      },
      {
        "sigunguId": "gangneung",
        "area": 555
      },
      {
        "sigunguId": "goesan",
        "area": 541
      },
      {
        "sigunguId": "yeongyang",
        "area": 485
      },
      {
        "sigunguId": "jeongseon",
        "area": 456
      },
      {
        "sigunguId": "taebaek",
        "area": 436
      },
      {
        "sigunguId": "muan",
        "area": 367
      },
      {
        "sigunguId": "mungyeong",
        "area": 354
      }
    ]
  },
  "radish": {
    "items": [
      "DT_1AG25403 무_면적",
      "DT_1AG25407 무_면적"
    ],
    "unit": "ha",
    "totalArea": 11363,
    "provinces": [
      {
        "provinceId": "jeju",
        "area": 3799
      },
      {
        "provinceId": "gangwon",
        "area": 2113
      },
      {
        "provinceId": "gyeonggi",
        "area": 1090
      },
      {
        "provinceId": "jeonnam",
        "area": 823
      },
      {
        "provinceId": "jeonbuk",
        "area": 782
      },
      {
        "provinceId": "chungnam",
        "area": 773
      },
      {
        "provinceId": "gyeongbuk",
        "area": 493
      },
      {
        "provinceId": "gyeongnam",
        "area": 396
      },
      {
        "provinceId": "chungbuk",
        "area": 269
      },
      {
        "provinceId": "gwangju",
        "area": 158
      },
      {
        "provinceId": "daegu",
        "area": 145
      },
      {
        "provinceId": "ulsan",
        "area": 118
      },
      {
        "provinceId": "busan",
        "area": 112
      },
      {
        "provinceId": "daejeon",
        "area": 93
      },
      {
        "provinceId": "incheon",
        "area": 86
      },
      {
        "provinceId": "seoul",
        "area": 85
      },
      {
        "provinceId": "sejong",
        "area": 28
      }
    ],
    "top": [
      {
        "sigunguId": "seogwipo",
        "area": 2481
      },
      {
        "sigunguId": "jeju-si",
        "area": 1320
      },
      {
        "sigunguId": "pyeongchang",
        "area": 660
      },
      {
        "sigunguId": "hongcheon",
        "area": 458
      },
      {
        "sigunguId": "gochang",
        "area": 430
      },
      {
        "sigunguId": "gangneung",
        "area": 268
      },
      {
        "sigunguId": "jeongseon",
        "area": 266
      },
      {
        "sigunguId": "yeongam",
        "area": 240
      },
      {
        "sigunguId": "dangjin",
        "area": 230
      },
      {
        "sigunguId": "hwaseong",
        "area": 173
      }
    ]
  },
  "chili-pepper": {
    "items": [
      "DT_1AG25403 고추_면적",
      "DT_1AG25407 고추_면적"
    ],
    "unit": "ha",
    "totalArea": 33736,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "area": 7060
      },
      {
        "provinceId": "gangwon",
        "area": 3854
      },
      {
        "provinceId": "jeonnam",
        "area": 3784
      },
      {
        "provinceId": "chungnam",
        "area": 3571
      },
      {
        "provinceId": "jeonbuk",
        "area": 3565
      },
      {
        "provinceId": "gyeonggi",
        "area": 3386
      },
      {
        "provinceId": "gyeongnam",
        "area": 3156
      },
      {
        "provinceId": "chungbuk",
        "area": 2685
      },
      {
        "provinceId": "incheon",
        "area": 499
      },
      {
        "provinceId": "daegu",
        "area": 496
      },
      {
        "provinceId": "gwangju",
        "area": 492
      },
      {
        "provinceId": "daejeon",
        "area": 314
      },
      {
        "provinceId": "ulsan",
        "area": 250
      },
      {
        "provinceId": "seoul",
        "area": 226
      },
      {
        "provinceId": "busan",
        "area": 210
      },
      {
        "provinceId": "sejong",
        "area": 126
      },
      {
        "provinceId": "jeju",
        "area": 62
      }
    ],
    "top": [
      {
        "sigunguId": "andong",
        "area": 1285
      },
      {
        "sigunguId": "yeongyang",
        "area": 1262
      },
      {
        "sigunguId": "bonghwa",
        "area": 1126
      },
      {
        "sigunguId": "gochang",
        "area": 724
      },
      {
        "sigunguId": "jinju",
        "area": 662
      },
      {
        "sigunguId": "hongcheon",
        "area": 551
      },
      {
        "sigunguId": "yeongju",
        "area": 528
      },
      {
        "sigunguId": "cheongyang",
        "area": 525
      },
      {
        "sigunguId": "jeongeup",
        "area": 522
      },
      {
        "sigunguId": "miryang",
        "area": 519
      }
    ]
  },
  "onion": {
    "items": [
      "DT_1AG25403 양파_면적"
    ],
    "unit": "ha",
    "totalArea": 10526,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "area": 4278
      },
      {
        "provinceId": "gyeongnam",
        "area": 1642
      },
      {
        "provinceId": "gyeongbuk",
        "area": 1198
      },
      {
        "provinceId": "jeonbuk",
        "area": 995
      },
      {
        "provinceId": "chungnam",
        "area": 806
      },
      {
        "provinceId": "jeju",
        "area": 577
      },
      {
        "provinceId": "gyeonggi",
        "area": 298
      },
      {
        "provinceId": "daegu",
        "area": 229
      },
      {
        "provinceId": "chungbuk",
        "area": 105
      },
      {
        "provinceId": "gwangju",
        "area": 94
      },
      {
        "provinceId": "gangwon",
        "area": 85
      },
      {
        "provinceId": "ulsan",
        "area": 61
      },
      {
        "provinceId": "busan",
        "area": 57
      },
      {
        "provinceId": "daejeon",
        "area": 29
      },
      {
        "provinceId": "seoul",
        "area": 27
      },
      {
        "provinceId": "incheon",
        "area": 27
      },
      {
        "provinceId": "sejong",
        "area": 18
      }
    ],
    "top": [
      {
        "sigunguId": "muan",
        "area": 2138
      },
      {
        "sigunguId": "sinan",
        "area": 646
      },
      {
        "sigunguId": "goheung",
        "area": 442
      },
      {
        "sigunguId": "hamyang",
        "area": 382
      },
      {
        "sigunguId": "seosan",
        "area": 369
      },
      {
        "sigunguId": "changnyeong",
        "area": 363
      },
      {
        "sigunguId": "goryeong",
        "area": 337
      },
      {
        "sigunguId": "hampyeong",
        "area": 323
      },
      {
        "sigunguId": "jeju-si",
        "area": 307
      },
      {
        "sigunguId": "seogwipo",
        "area": 270
      }
    ]
  },
  "green-onion": {
    "items": [
      "DT_1AG25403 대파_면적"
    ],
    "unit": "ha",
    "totalArea": 7894,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "area": 2989
      },
      {
        "provinceId": "gangwon",
        "area": 1263
      },
      {
        "provinceId": "gyeonggi",
        "area": 858
      },
      {
        "provinceId": "jeonbuk",
        "area": 614
      },
      {
        "provinceId": "chungbuk",
        "area": 454
      },
      {
        "provinceId": "gyeongbuk",
        "area": 425
      },
      {
        "provinceId": "chungnam",
        "area": 298
      },
      {
        "provinceId": "busan",
        "area": 258
      },
      {
        "provinceId": "gyeongnam",
        "area": 231
      },
      {
        "provinceId": "jeju",
        "area": 174
      },
      {
        "provinceId": "daegu",
        "area": 81
      },
      {
        "provinceId": "seoul",
        "area": 68
      },
      {
        "provinceId": "daejeon",
        "area": 48
      },
      {
        "provinceId": "ulsan",
        "area": 44
      },
      {
        "provinceId": "incheon",
        "area": 35
      },
      {
        "provinceId": "gwangju",
        "area": 34
      },
      {
        "provinceId": "sejong",
        "area": 20
      }
    ],
    "top": [
      {
        "sigunguId": "sinan",
        "area": 1308
      },
      {
        "sigunguId": "jindo",
        "area": 1052
      },
      {
        "sigunguId": "pyeongchang",
        "area": 651
      },
      {
        "sigunguId": "yeonggwang",
        "area": 288
      },
      {
        "sigunguId": "wanju",
        "area": 273
      },
      {
        "sigunguId": "gangseo-busan",
        "area": 181
      },
      {
        "sigunguId": "cheorwon",
        "area": 174
      },
      {
        "sigunguId": "cheongju",
        "area": 171
      },
      {
        "sigunguId": "jeju-si",
        "area": 163
      },
      {
        "sigunguId": "icheon",
        "area": 162
      }
    ]
  },
  "garlic": {
    "items": [
      "DT_1AG25403 마늘_면적"
    ],
    "unit": "ha",
    "totalArea": 18289,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "area": 5297
      },
      {
        "provinceId": "chungnam",
        "area": 3311
      },
      {
        "provinceId": "gyeongbuk",
        "area": 2935
      },
      {
        "provinceId": "jeonnam",
        "area": 2511
      },
      {
        "provinceId": "jeju",
        "area": 937
      },
      {
        "provinceId": "jeonbuk",
        "area": 705
      },
      {
        "provinceId": "gyeonggi",
        "area": 679
      },
      {
        "provinceId": "daegu",
        "area": 669
      },
      {
        "provinceId": "chungbuk",
        "area": 516
      },
      {
        "provinceId": "gangwon",
        "area": 170
      },
      {
        "provinceId": "ulsan",
        "area": 104
      },
      {
        "provinceId": "gwangju",
        "area": 102
      },
      {
        "provinceId": "daejeon",
        "area": 101
      },
      {
        "provinceId": "busan",
        "area": 94
      },
      {
        "provinceId": "incheon",
        "area": 73
      },
      {
        "provinceId": "seoul",
        "area": 51
      },
      {
        "provinceId": "sejong",
        "area": 34
      }
    ],
    "top": [
      {
        "sigunguId": "changnyeong",
        "area": 3068
      },
      {
        "sigunguId": "seosan",
        "area": 1270
      },
      {
        "sigunguId": "yeongcheon",
        "area": 981
      },
      {
        "sigunguId": "taean",
        "area": 945
      },
      {
        "sigunguId": "hapcheon",
        "area": 934
      },
      {
        "sigunguId": "uiseong",
        "area": 677
      },
      {
        "sigunguId": "goryeong",
        "area": 615
      },
      {
        "sigunguId": "goheung",
        "area": 607
      },
      {
        "sigunguId": "seogwipo",
        "area": 545
      },
      {
        "sigunguId": "sinan",
        "area": 431
      }
    ]
  },
  "spinach": {
    "items": [
      "DT_1AG25403 시금치_면적",
      "DT_1AG25407 시금치_면적"
    ],
    "unit": "ha",
    "totalArea": 4224,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "area": 1528
      },
      {
        "provinceId": "gyeonggi",
        "area": 1060
      },
      {
        "provinceId": "jeonnam",
        "area": 793
      },
      {
        "provinceId": "gyeongbuk",
        "area": 311
      },
      {
        "provinceId": "chungnam",
        "area": 126
      },
      {
        "provinceId": "chungbuk",
        "area": 68
      },
      {
        "provinceId": "daegu",
        "area": 63
      },
      {
        "provinceId": "busan",
        "area": 55
      },
      {
        "provinceId": "seoul",
        "area": 46
      },
      {
        "provinceId": "jeonbuk",
        "area": 43
      },
      {
        "provinceId": "gangwon",
        "area": 31
      },
      {
        "provinceId": "gwangju",
        "area": 28
      },
      {
        "provinceId": "incheon",
        "area": 22
      },
      {
        "provinceId": "jeju",
        "area": 20
      },
      {
        "provinceId": "ulsan",
        "area": 18
      },
      {
        "provinceId": "sejong",
        "area": 8
      },
      {
        "provinceId": "daejeon",
        "area": 4
      }
    ],
    "top": [
      {
        "sigunguId": "namhae",
        "area": 1061
      },
      {
        "sigunguId": "pocheon",
        "area": 544
      },
      {
        "sigunguId": "sinan",
        "area": 412
      },
      {
        "sigunguId": "goseong-gn",
        "area": 259
      },
      {
        "sigunguId": "muan",
        "area": 173
      },
      {
        "sigunguId": "pohang",
        "area": 155
      },
      {
        "sigunguId": "goyang",
        "area": 141
      },
      {
        "sigunguId": "yeongdeok",
        "area": 103
      },
      {
        "sigunguId": "namyangju",
        "area": 97
      },
      {
        "sigunguId": "icheon",
        "area": 91
      }
    ]
  },
  "lettuce": {
    "items": [
      "DT_1AG25403 상추_면적",
      "DT_1AG25407 상추_면적"
    ],
    "unit": "ha",
    "totalArea": 3154,
    "provinces": [
      {
        "provinceId": "gyeonggi",
        "area": 637
      },
      {
        "provinceId": "chungnam",
        "area": 577
      },
      {
        "provinceId": "jeonbuk",
        "area": 559
      },
      {
        "provinceId": "gangwon",
        "area": 268
      },
      {
        "provinceId": "chungbuk",
        "area": 232
      },
      {
        "provinceId": "gyeongbuk",
        "area": 208
      },
      {
        "provinceId": "gyeongnam",
        "area": 171
      },
      {
        "provinceId": "jeonnam",
        "area": 105
      },
      {
        "provinceId": "daegu",
        "area": 97
      },
      {
        "provinceId": "busan",
        "area": 87
      },
      {
        "provinceId": "seoul",
        "area": 62
      },
      {
        "provinceId": "daejeon",
        "area": 32
      },
      {
        "provinceId": "jeju",
        "area": 32
      },
      {
        "provinceId": "gwangju",
        "area": 26
      },
      {
        "provinceId": "ulsan",
        "area": 26
      },
      {
        "provinceId": "incheon",
        "area": 25
      },
      {
        "provinceId": "sejong",
        "area": 10
      }
    ],
    "top": [
      {
        "sigunguId": "nonsan",
        "area": 414
      },
      {
        "sigunguId": "icheon",
        "area": 220
      },
      {
        "sigunguId": "namwon",
        "area": 168
      },
      {
        "sigunguId": "iksan",
        "area": 163
      },
      {
        "sigunguId": "chungju",
        "area": 152
      },
      {
        "sigunguId": "wanju",
        "area": 85
      },
      {
        "sigunguId": "hoengseong",
        "area": 84
      },
      {
        "sigunguId": "yeongyang",
        "area": 74
      },
      {
        "sigunguId": "pyeongchang",
        "area": 63
      },
      {
        "sigunguId": "yangpyeong",
        "area": 48
      }
    ]
  },
  "zucchini": {
    "items": [
      "DT_1AG25403 호박_면적",
      "DT_1AG25407 호박_면적"
    ],
    "unit": "ha",
    "totalArea": 4459,
    "provinces": [
      {
        "provinceId": "gangwon",
        "area": 791
      },
      {
        "provinceId": "gyeongnam",
        "area": 763
      },
      {
        "provinceId": "jeonnam",
        "area": 585
      },
      {
        "provinceId": "gyeonggi",
        "area": 498
      },
      {
        "provinceId": "gyeongbuk",
        "area": 480
      },
      {
        "provinceId": "chungbuk",
        "area": 372
      },
      {
        "provinceId": "chungnam",
        "area": 240
      },
      {
        "provinceId": "jeju",
        "area": 236
      },
      {
        "provinceId": "jeonbuk",
        "area": 228
      },
      {
        "provinceId": "gwangju",
        "area": 49
      },
      {
        "provinceId": "busan",
        "area": 37
      },
      {
        "provinceId": "daegu",
        "area": 37
      },
      {
        "provinceId": "incheon",
        "area": 34
      },
      {
        "provinceId": "seoul",
        "area": 32
      },
      {
        "provinceId": "daejeon",
        "area": 31
      },
      {
        "provinceId": "sejong",
        "area": 24
      },
      {
        "provinceId": "ulsan",
        "area": 22
      }
    ],
    "top": [
      {
        "sigunguId": "jinju",
        "area": 359
      },
      {
        "sigunguId": "hongcheon",
        "area": 356
      },
      {
        "sigunguId": "jeju-si",
        "area": 202
      },
      {
        "sigunguId": "cheongju",
        "area": 187
      },
      {
        "sigunguId": "andong",
        "area": 143
      },
      {
        "sigunguId": "namhae",
        "area": 137
      },
      {
        "sigunguId": "hampyeong",
        "area": 136
      },
      {
        "sigunguId": "hwacheon",
        "area": 133
      },
      {
        "sigunguId": "haenam",
        "area": 98
      },
      {
        "sigunguId": "gochang",
        "area": 87
      }
    ]
  },
  "cucumber": {
    "items": [
      "DT_1AG25403 오이_면적",
      "DT_1AG25407 오이_면적"
    ],
    "unit": "ha",
    "totalArea": 3224,
    "provinces": [
      {
        "provinceId": "gangwon",
        "area": 765
      },
      {
        "provinceId": "chungnam",
        "area": 521
      },
      {
        "provinceId": "gyeonggi",
        "area": 486
      },
      {
        "provinceId": "gyeongbuk",
        "area": 353
      },
      {
        "provinceId": "chungbuk",
        "area": 326
      },
      {
        "provinceId": "jeonnam",
        "area": 176
      },
      {
        "provinceId": "jeonbuk",
        "area": 140
      },
      {
        "provinceId": "gyeongnam",
        "area": 130
      },
      {
        "provinceId": "daegu",
        "area": 92
      },
      {
        "provinceId": "daejeon",
        "area": 68
      },
      {
        "provinceId": "sejong",
        "area": 37
      },
      {
        "provinceId": "jeju",
        "area": 32
      },
      {
        "provinceId": "incheon",
        "area": 31
      },
      {
        "provinceId": "gwangju",
        "area": 22
      },
      {
        "provinceId": "seoul",
        "area": 20
      },
      {
        "provinceId": "busan",
        "area": 14
      },
      {
        "provinceId": "ulsan",
        "area": 11
      }
    ],
    "top": [
      {
        "sigunguId": "hongcheon",
        "area": 321
      },
      {
        "sigunguId": "cheonan",
        "area": 259
      },
      {
        "sigunguId": "sangju",
        "area": 205
      },
      {
        "sigunguId": "chuncheon",
        "area": 148
      },
      {
        "sigunguId": "yanggu",
        "area": 130
      },
      {
        "sigunguId": "jincheon",
        "area": 111
      },
      {
        "sigunguId": "gongju",
        "area": 106
      },
      {
        "sigunguId": "jecheon",
        "area": 79
      },
      {
        "sigunguId": "suncheon",
        "area": 76
      },
      {
        "sigunguId": "changnyeong",
        "area": 73
      }
    ]
  },
  "eggplant": {
    "items": [
      "DT_1AG25403 가지_면적"
    ],
    "unit": "ha",
    "totalArea": 506,
    "provinces": [
      {
        "provinceId": "gyeonggi",
        "area": 146
      },
      {
        "provinceId": "gangwon",
        "area": 107
      },
      {
        "provinceId": "gyeongnam",
        "area": 59
      },
      {
        "provinceId": "gyeongbuk",
        "area": 53
      },
      {
        "provinceId": "chungnam",
        "area": 25
      },
      {
        "provinceId": "daegu",
        "area": 19
      },
      {
        "provinceId": "chungbuk",
        "area": 17
      },
      {
        "provinceId": "jeonbuk",
        "area": 17
      },
      {
        "provinceId": "jeonnam",
        "area": 12
      },
      {
        "provinceId": "busan",
        "area": 11
      },
      {
        "provinceId": "seoul",
        "area": 9
      },
      {
        "provinceId": "daejeon",
        "area": 7
      },
      {
        "provinceId": "gwangju",
        "area": 7
      },
      {
        "provinceId": "incheon",
        "area": 6
      },
      {
        "provinceId": "ulsan",
        "area": 6
      },
      {
        "provinceId": "jeju",
        "area": 3
      },
      {
        "provinceId": "sejong",
        "area": 2
      }
    ],
    "top": [
      {
        "sigunguId": "hongcheon",
        "area": 70
      },
      {
        "sigunguId": "yeoju",
        "area": 61
      },
      {
        "sigunguId": "chuncheon",
        "area": 26
      },
      {
        "sigunguId": "uiseong",
        "area": 21
      },
      {
        "sigunguId": "miryang",
        "area": 15
      },
      {
        "sigunguId": "gwangju-gg",
        "area": 13
      },
      {
        "sigunguId": "changnyeong",
        "area": 12
      }
    ]
  },
  "watermelon": {
    "items": [
      "DT_1AG25403 수박_면적",
      "DT_1AG25407 수박_면적"
    ],
    "unit": "ha",
    "totalArea": 7092,
    "provinces": [
      {
        "provinceId": "chungnam",
        "area": 1661
      },
      {
        "provinceId": "chungbuk",
        "area": 1464
      },
      {
        "provinceId": "jeonbuk",
        "area": 1460
      },
      {
        "provinceId": "gyeongbuk",
        "area": 888
      },
      {
        "provinceId": "gyeongnam",
        "area": 671
      },
      {
        "provinceId": "gangwon",
        "area": 235
      },
      {
        "provinceId": "daegu",
        "area": 181
      },
      {
        "provinceId": "jeonnam",
        "area": 171
      },
      {
        "provinceId": "gyeonggi",
        "area": 159
      },
      {
        "provinceId": "jeju",
        "area": 125
      },
      {
        "provinceId": "sejong",
        "area": 30
      },
      {
        "provinceId": "gwangju",
        "area": 17
      },
      {
        "provinceId": "incheon",
        "area": 9
      },
      {
        "provinceId": "daejeon",
        "area": 8
      },
      {
        "provinceId": "seoul",
        "area": 6
      },
      {
        "provinceId": "busan",
        "area": 4
      },
      {
        "provinceId": "ulsan",
        "area": 3
      }
    ],
    "top": [
      {
        "sigunguId": "buyeo",
        "area": 919
      },
      {
        "sigunguId": "gochang",
        "area": 820
      },
      {
        "sigunguId": "eumseong",
        "area": 774
      },
      {
        "sigunguId": "bonghwa",
        "area": 392
      },
      {
        "sigunguId": "nonsan",
        "area": 382
      },
      {
        "sigunguId": "haman",
        "area": 310
      },
      {
        "sigunguId": "jincheon",
        "area": 308
      },
      {
        "sigunguId": "jinan",
        "area": 207
      },
      {
        "sigunguId": "yanggu",
        "area": 205
      },
      {
        "sigunguId": "dalseong",
        "area": 167
      }
    ]
  },
  "carrot": {
    "items": [
      "DT_1AG25403 당근_면적"
    ],
    "unit": "ha",
    "totalArea": 2247,
    "provinces": [
      {
        "provinceId": "jeju",
        "area": 1538
      },
      {
        "provinceId": "gangwon",
        "area": 304
      },
      {
        "provinceId": "gyeongnam",
        "area": 174
      },
      {
        "provinceId": "gyeonggi",
        "area": 53
      },
      {
        "provinceId": "busan",
        "area": 50
      },
      {
        "provinceId": "gyeongbuk",
        "area": 43
      },
      {
        "provinceId": "jeonnam",
        "area": 29
      },
      {
        "provinceId": "chungbuk",
        "area": 13
      },
      {
        "provinceId": "jeonbuk",
        "area": 12
      },
      {
        "provinceId": "chungnam",
        "area": 10
      },
      {
        "provinceId": "seoul",
        "area": 5
      },
      {
        "provinceId": "daegu",
        "area": 4
      },
      {
        "provinceId": "ulsan",
        "area": 4
      },
      {
        "provinceId": "incheon",
        "area": 2
      },
      {
        "provinceId": "sejong",
        "area": 2
      },
      {
        "provinceId": "daejeon",
        "area": 2
      },
      {
        "provinceId": "gwangju",
        "area": 2
      }
    ],
    "top": [
      {
        "sigunguId": "jeju-si",
        "area": 1355
      },
      {
        "sigunguId": "seogwipo",
        "area": 183
      },
      {
        "sigunguId": "pyeongchang",
        "area": 149
      },
      {
        "sigunguId": "hongcheon",
        "area": 108
      }
    ]
  },
  "ginseng": {
    "items": [
      "DT_1AG25403 인삼_면적"
    ],
    "unit": "ha",
    "totalArea": 6195,
    "provinces": [
      {
        "provinceId": "gangwon",
        "area": 1266
      },
      {
        "provinceId": "chungnam",
        "area": 1125
      },
      {
        "provinceId": "gyeonggi",
        "area": 1042
      },
      {
        "provinceId": "chungbuk",
        "area": 1026
      },
      {
        "provinceId": "jeonbuk",
        "area": 804
      },
      {
        "provinceId": "gyeongbuk",
        "area": 485
      },
      {
        "provinceId": "daejeon",
        "area": 140
      },
      {
        "provinceId": "jeonnam",
        "area": 123
      },
      {
        "provinceId": "sejong",
        "area": 83
      },
      {
        "provinceId": "incheon",
        "area": 41
      },
      {
        "provinceId": "gyeongnam",
        "area": 26
      },
      {
        "provinceId": "seoul",
        "area": 25
      },
      {
        "provinceId": "daegu",
        "area": 4
      },
      {
        "provinceId": "gwangju",
        "area": 3
      },
      {
        "provinceId": "busan",
        "area": 1
      },
      {
        "provinceId": "ulsan",
        "area": 1
      },
      {
        "provinceId": "jeju",
        "area": 0
      }
    ],
    "top": [
      {
        "sigunguId": "geumsan",
        "area": 614
      },
      {
        "sigunguId": "hongcheon",
        "area": 450
      },
      {
        "sigunguId": "yeongju",
        "area": 358
      },
      {
        "sigunguId": "gochang",
        "area": 331
      },
      {
        "sigunguId": "icheon",
        "area": 293
      },
      {
        "sigunguId": "goesan",
        "area": 241
      },
      {
        "sigunguId": "cheongju",
        "area": 187
      },
      {
        "sigunguId": "eumseong",
        "area": 186
      },
      {
        "sigunguId": "hoengseong",
        "area": 157
      },
      {
        "sigunguId": "yeoju",
        "area": 149
      }
    ]
  },
  "sesame": {
    "items": [
      "DT_1AG25403 참깨_면적"
    ],
    "unit": "ha",
    "totalArea": 7723,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "area": 1880
      },
      {
        "provinceId": "jeonnam",
        "area": 1361
      },
      {
        "provinceId": "chungbuk",
        "area": 850
      },
      {
        "provinceId": "jeonbuk",
        "area": 839
      },
      {
        "provinceId": "chungnam",
        "area": 729
      },
      {
        "provinceId": "gyeonggi",
        "area": 619
      },
      {
        "provinceId": "gyeongnam",
        "area": 587
      },
      {
        "provinceId": "gangwon",
        "area": 257
      },
      {
        "provinceId": "daegu",
        "area": 229
      },
      {
        "provinceId": "gwangju",
        "area": 77
      },
      {
        "provinceId": "daejeon",
        "area": 70
      },
      {
        "provinceId": "jeju",
        "area": 54
      },
      {
        "provinceId": "sejong",
        "area": 45
      },
      {
        "provinceId": "ulsan",
        "area": 37
      },
      {
        "provinceId": "seoul",
        "area": 36
      },
      {
        "provinceId": "incheon",
        "area": 32
      },
      {
        "provinceId": "busan",
        "area": 21
      }
    ],
    "top": [
      {
        "sigunguId": "andong",
        "area": 406
      },
      {
        "sigunguId": "yecheon",
        "area": 375
      },
      {
        "sigunguId": "sinan",
        "area": 209
      },
      {
        "sigunguId": "uiseong",
        "area": 191
      },
      {
        "sigunguId": "chungju",
        "area": 177
      },
      {
        "sigunguId": "jeongeup",
        "area": 175
      },
      {
        "sigunguId": "cheongju",
        "area": 146
      },
      {
        "sigunguId": "yeongju",
        "area": 143
      },
      {
        "sigunguId": "muan",
        "area": 129
      },
      {
        "sigunguId": "gumi",
        "area": 129
      }
    ]
  },
  "perilla-seed": {
    "items": [
      "DT_1AG25403 들깨_면적"
    ],
    "unit": "ha",
    "totalArea": 23148,
    "provinces": [
      {
        "provinceId": "gyeonggi",
        "area": 4626
      },
      {
        "provinceId": "chungnam",
        "area": 3888
      },
      {
        "provinceId": "gangwon",
        "area": 3882
      },
      {
        "provinceId": "chungbuk",
        "area": 3098
      },
      {
        "provinceId": "gyeongbuk",
        "area": 2144
      },
      {
        "provinceId": "jeonbuk",
        "area": 1582
      },
      {
        "provinceId": "gyeongnam",
        "area": 1373
      },
      {
        "provinceId": "jeonnam",
        "area": 945
      },
      {
        "provinceId": "daejeon",
        "area": 445
      },
      {
        "provinceId": "daegu",
        "area": 292
      },
      {
        "provinceId": "seoul",
        "area": 225
      },
      {
        "provinceId": "incheon",
        "area": 217
      },
      {
        "provinceId": "sejong",
        "area": 217
      },
      {
        "provinceId": "ulsan",
        "area": 81
      },
      {
        "provinceId": "gwangju",
        "area": 78
      },
      {
        "provinceId": "busan",
        "area": 43
      },
      {
        "provinceId": "jeju",
        "area": 12
      }
    ],
    "top": [
      {
        "sigunguId": "cheongju",
        "area": 614
      },
      {
        "sigunguId": "hongcheon",
        "area": 502
      },
      {
        "sigunguId": "pocheon",
        "area": 497
      },
      {
        "sigunguId": "wonju",
        "area": 481
      },
      {
        "sigunguId": "jecheon",
        "area": 469
      },
      {
        "sigunguId": "geumsan",
        "area": 431
      },
      {
        "sigunguId": "hongseong",
        "area": 425
      },
      {
        "sigunguId": "chuncheon",
        "area": 422
      },
      {
        "sigunguId": "chungju",
        "area": 417
      },
      {
        "sigunguId": "paju",
        "area": 395
      }
    ]
  },
  "melon": {
    "items": [
      "DT_1AG25407 참외_면적"
    ],
    "unit": "ha",
    "totalArea": 2910,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "area": 2623
      },
      {
        "provinceId": "daegu",
        "area": 233
      },
      {
        "provinceId": "gyeonggi",
        "area": 24
      },
      {
        "provinceId": "gyeongnam",
        "area": 22
      },
      {
        "provinceId": "jeonbuk",
        "area": 2
      },
      {
        "provinceId": "jeonnam",
        "area": 2
      },
      {
        "provinceId": "incheon",
        "area": 1
      },
      {
        "provinceId": "gangwon",
        "area": 1
      },
      {
        "provinceId": "chungbuk",
        "area": 1
      },
      {
        "provinceId": "chungnam",
        "area": 1
      },
      {
        "provinceId": "seoul",
        "area": 0
      },
      {
        "provinceId": "sejong",
        "area": 0
      },
      {
        "provinceId": "daejeon",
        "area": 0
      },
      {
        "provinceId": "gwangju",
        "area": 0
      },
      {
        "provinceId": "busan",
        "area": 0
      },
      {
        "provinceId": "ulsan",
        "area": 0
      },
      {
        "provinceId": "jeju",
        "area": 0
      }
    ],
    "top": [
      {
        "sigunguId": "seongju",
        "area": 2196
      },
      {
        "sigunguId": "chilgok",
        "area": 214
      },
      {
        "sigunguId": "dalseong",
        "area": 159
      }
    ]
  },
  "tomato": {
    "items": [
      "DT_1AG25407 토마토(일반)_면적"
    ],
    "unit": "ha",
    "totalArea": 1522,
    "provinces": [
      {
        "provinceId": "gangwon",
        "area": 404
      },
      {
        "provinceId": "busan",
        "area": 259
      },
      {
        "provinceId": "gyeongnam",
        "area": 185
      },
      {
        "provinceId": "gyeongbuk",
        "area": 149
      },
      {
        "provinceId": "jeonnam",
        "area": 104
      },
      {
        "provinceId": "jeonbuk",
        "area": 102
      },
      {
        "provinceId": "gyeonggi",
        "area": 94
      },
      {
        "provinceId": "chungnam",
        "area": 81
      },
      {
        "provinceId": "daegu",
        "area": 42
      },
      {
        "provinceId": "chungbuk",
        "area": 38
      },
      {
        "provinceId": "gwangju",
        "area": 19
      },
      {
        "provinceId": "incheon",
        "area": 14
      },
      {
        "provinceId": "ulsan",
        "area": 9
      },
      {
        "provinceId": "sejong",
        "area": 8
      },
      {
        "provinceId": "seoul",
        "area": 5
      },
      {
        "provinceId": "daejeon",
        "area": 5
      },
      {
        "provinceId": "jeju",
        "area": 4
      }
    ],
    "top": [
      {
        "sigunguId": "gangseo-busan",
        "area": 228
      },
      {
        "sigunguId": "cheorwon",
        "area": 94
      },
      {
        "sigunguId": "hoengseong",
        "area": 89
      },
      {
        "sigunguId": "chuncheon",
        "area": 73
      },
      {
        "sigunguId": "gyeongju",
        "area": 53
      },
      {
        "sigunguId": "gimhae",
        "area": 52
      },
      {
        "sigunguId": "gwangju-gg",
        "area": 37
      },
      {
        "sigunguId": "yeongwol",
        "area": 35
      },
      {
        "sigunguId": "jangsu",
        "area": 35
      },
      {
        "sigunguId": "inje",
        "area": 34
      }
    ]
  },
  "cherry-tomato": {
    "items": [
      "DT_1AG25407 토마토(방울)_면적"
    ],
    "unit": "ha",
    "totalArea": 1534,
    "provinces": [
      {
        "provinceId": "chungnam",
        "area": 392
      },
      {
        "provinceId": "gangwon",
        "area": 344
      },
      {
        "provinceId": "jeonnam",
        "area": 205
      },
      {
        "provinceId": "chungbuk",
        "area": 145
      },
      {
        "provinceId": "jeonbuk",
        "area": 134
      },
      {
        "provinceId": "gyeongnam",
        "area": 99
      },
      {
        "provinceId": "gyeonggi",
        "area": 77
      },
      {
        "provinceId": "gyeongbuk",
        "area": 45
      },
      {
        "provinceId": "gwangju",
        "area": 42
      },
      {
        "provinceId": "incheon",
        "area": 12
      },
      {
        "provinceId": "jeju",
        "area": 11
      },
      {
        "provinceId": "busan",
        "area": 8
      },
      {
        "provinceId": "daegu",
        "area": 7
      },
      {
        "provinceId": "daejeon",
        "area": 6
      },
      {
        "provinceId": "sejong",
        "area": 4
      },
      {
        "provinceId": "seoul",
        "area": 2
      },
      {
        "provinceId": "ulsan",
        "area": 1
      }
    ],
    "top": [
      {
        "sigunguId": "nonsan",
        "area": 164
      },
      {
        "sigunguId": "hoengseong",
        "area": 155
      },
      {
        "sigunguId": "buyeo",
        "area": 135
      },
      {
        "sigunguId": "chuncheon",
        "area": 109
      },
      {
        "sigunguId": "damyang",
        "area": 57
      },
      {
        "sigunguId": "iksan",
        "area": 56
      },
      {
        "sigunguId": "cheongju",
        "area": 36
      },
      {
        "sigunguId": "eumseong",
        "area": 36
      },
      {
        "sigunguId": "chungju",
        "area": 34
      },
      {
        "sigunguId": "yesan",
        "area": 32
      }
    ]
  },
  "strawberry": {
    "items": [
      "DT_1AG25407 딸기_면적"
    ],
    "unit": "ha",
    "totalArea": 4070,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "area": 1855
      },
      {
        "provinceId": "chungnam",
        "area": 879
      },
      {
        "provinceId": "jeonnam",
        "area": 406
      },
      {
        "provinceId": "jeonbuk",
        "area": 329
      },
      {
        "provinceId": "gyeongbuk",
        "area": 266
      },
      {
        "provinceId": "gyeonggi",
        "area": 78
      },
      {
        "provinceId": "chungbuk",
        "area": 72
      },
      {
        "provinceId": "gangwon",
        "area": 38
      },
      {
        "provinceId": "sejong",
        "area": 34
      },
      {
        "provinceId": "gwangju",
        "area": 32
      },
      {
        "provinceId": "daejeon",
        "area": 21
      },
      {
        "provinceId": "jeju",
        "area": 17
      },
      {
        "provinceId": "daegu",
        "area": 15
      },
      {
        "provinceId": "busan",
        "area": 11
      },
      {
        "provinceId": "incheon",
        "area": 7
      },
      {
        "provinceId": "ulsan",
        "area": 7
      },
      {
        "provinceId": "seoul",
        "area": 3
      }
    ],
    "top": [
      {
        "sigunguId": "nonsan",
        "area": 598
      },
      {
        "sigunguId": "jinju",
        "area": 392
      },
      {
        "sigunguId": "miryang",
        "area": 337
      },
      {
        "sigunguId": "sancheong",
        "area": 323
      },
      {
        "sigunguId": "hadong",
        "area": 273
      },
      {
        "sigunguId": "damyang",
        "area": 211
      },
      {
        "sigunguId": "geochang",
        "area": 176
      },
      {
        "sigunguId": "goryeong",
        "area": 115
      },
      {
        "sigunguId": "iksan",
        "area": 100
      },
      {
        "sigunguId": "sacheon",
        "area": 99
      }
    ]
  },
  "paprika": {
    "items": [
      "DT_1AG25407 파프리카_면적"
    ],
    "unit": "ha",
    "totalArea": 406,
    "provinces": [
      {
        "provinceId": "gangwon",
        "area": 223
      },
      {
        "provinceId": "gyeongnam",
        "area": 128
      },
      {
        "provinceId": "jeonnam",
        "area": 26
      },
      {
        "provinceId": "jeonbuk",
        "area": 13
      },
      {
        "provinceId": "gyeonggi",
        "area": 6
      },
      {
        "provinceId": "gyeongbuk",
        "area": 4
      },
      {
        "provinceId": "gwangju",
        "area": 3
      },
      {
        "provinceId": "chungbuk",
        "area": 1
      },
      {
        "provinceId": "chungnam",
        "area": 1
      },
      {
        "provinceId": "busan",
        "area": 1
      },
      {
        "provinceId": "seoul",
        "area": 0
      },
      {
        "provinceId": "incheon",
        "area": 0
      },
      {
        "provinceId": "sejong",
        "area": 0
      },
      {
        "provinceId": "daejeon",
        "area": 0
      },
      {
        "provinceId": "daegu",
        "area": 0
      },
      {
        "provinceId": "ulsan",
        "area": 0
      },
      {
        "provinceId": "jeju",
        "area": 0
      }
    ],
    "top": [
      {
        "sigunguId": "cheorwon",
        "area": 183
      },
      {
        "sigunguId": "jinju",
        "area": 40
      },
      {
        "sigunguId": "haman",
        "area": 25
      },
      {
        "sigunguId": "changwon",
        "area": 19
      },
      {
        "sigunguId": "pyeongchang",
        "area": 16
      },
      {
        "sigunguId": "gwangyang",
        "area": 13
      },
      {
        "sigunguId": "inje",
        "area": 12
      },
      {
        "sigunguId": "goseong-gn",
        "area": 11
      }
    ]
  },
  "apple": {
    "items": [
      "DT_1AG25411 사과_면적"
    ],
    "unit": "ha",
    "totalArea": 27086,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "area": 15479
      },
      {
        "provinceId": "gyeongnam",
        "area": 2707
      },
      {
        "provinceId": "chungbuk",
        "area": 2690
      },
      {
        "provinceId": "jeonbuk",
        "area": 1565
      },
      {
        "provinceId": "chungnam",
        "area": 1261
      },
      {
        "provinceId": "gangwon",
        "area": 1234
      },
      {
        "provinceId": "gyeonggi",
        "area": 653
      },
      {
        "provinceId": "daegu",
        "area": 631
      },
      {
        "provinceId": "jeonnam",
        "area": 288
      },
      {
        "provinceId": "seoul",
        "area": 126
      },
      {
        "provinceId": "incheon",
        "area": 94
      },
      {
        "provinceId": "busan",
        "area": 94
      },
      {
        "provinceId": "ulsan",
        "area": 94
      },
      {
        "provinceId": "daejeon",
        "area": 77
      },
      {
        "provinceId": "gwangju",
        "area": 56
      },
      {
        "provinceId": "sejong",
        "area": 34
      },
      {
        "provinceId": "jeju",
        "area": 3
      }
    ],
    "top": [
      {
        "sigunguId": "cheongsong",
        "area": 3006
      },
      {
        "sigunguId": "yeongju",
        "area": 2213
      },
      {
        "sigunguId": "andong",
        "area": 2055
      },
      {
        "sigunguId": "mungyeong",
        "area": 1628
      },
      {
        "sigunguId": "uiseong",
        "area": 1426
      },
      {
        "sigunguId": "geochang",
        "area": 1375
      },
      {
        "sigunguId": "bonghwa",
        "area": 1226
      },
      {
        "sigunguId": "pohang",
        "area": 857
      },
      {
        "sigunguId": "chungju",
        "area": 837
      },
      {
        "sigunguId": "yesan",
        "area": 702
      }
    ]
  },
  "pear": {
    "items": [
      "DT_1AG25411 배_면적"
    ],
    "unit": "ha",
    "totalArea": 7423,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "area": 1682
      },
      {
        "provinceId": "chungnam",
        "area": 1677
      },
      {
        "provinceId": "gyeonggi",
        "area": 1295
      },
      {
        "provinceId": "gyeongbuk",
        "area": 726
      },
      {
        "provinceId": "gyeongnam",
        "area": 397
      },
      {
        "provinceId": "jeonbuk",
        "area": 380
      },
      {
        "provinceId": "ulsan",
        "area": 335
      },
      {
        "provinceId": "chungbuk",
        "area": 183
      },
      {
        "provinceId": "gangwon",
        "area": 181
      },
      {
        "provinceId": "sejong",
        "area": 136
      },
      {
        "provinceId": "gwangju",
        "area": 106
      },
      {
        "provinceId": "seoul",
        "area": 98
      },
      {
        "provinceId": "daejeon",
        "area": 74
      },
      {
        "provinceId": "incheon",
        "area": 59
      },
      {
        "provinceId": "busan",
        "area": 49
      },
      {
        "provinceId": "daegu",
        "area": 44
      },
      {
        "provinceId": "jeju",
        "area": 1
      }
    ],
    "top": [
      {
        "sigunguId": "naju",
        "area": 1148
      },
      {
        "sigunguId": "cheonan",
        "area": 809
      },
      {
        "sigunguId": "asan",
        "area": 475
      },
      {
        "sigunguId": "anseong",
        "area": 408
      },
      {
        "sigunguId": "sangju",
        "area": 400
      },
      {
        "sigunguId": "ulju",
        "area": 263
      },
      {
        "sigunguId": "pyeongtaek",
        "area": 252
      },
      {
        "sigunguId": "jinju",
        "area": 162
      },
      {
        "sigunguId": "sejong-si",
        "area": 136
      },
      {
        "sigunguId": "namyangju",
        "area": 134
      }
    ]
  },
  "peach": {
    "items": [
      "DT_1AG25411 복숭아_면적"
    ],
    "unit": "ha",
    "totalArea": 15912,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "area": 7299
      },
      {
        "provinceId": "chungbuk",
        "area": 3487
      },
      {
        "provinceId": "jeonbuk",
        "area": 896
      },
      {
        "provinceId": "gyeonggi",
        "area": 840
      },
      {
        "provinceId": "daegu",
        "area": 709
      },
      {
        "provinceId": "jeonnam",
        "area": 630
      },
      {
        "provinceId": "gyeongnam",
        "area": 579
      },
      {
        "provinceId": "gangwon",
        "area": 494
      },
      {
        "provinceId": "sejong",
        "area": 310
      },
      {
        "provinceId": "chungnam",
        "area": 256
      },
      {
        "provinceId": "daejeon",
        "area": 113
      },
      {
        "provinceId": "gwangju",
        "area": 89
      },
      {
        "provinceId": "seoul",
        "area": 67
      },
      {
        "provinceId": "ulsan",
        "area": 60
      },
      {
        "provinceId": "busan",
        "area": 57
      },
      {
        "provinceId": "incheon",
        "area": 20
      },
      {
        "provinceId": "jeju",
        "area": 6
      }
    ],
    "top": [
      {
        "sigunguId": "gyeongsan",
        "area": 1686
      },
      {
        "sigunguId": "yeongcheon",
        "area": 1539
      },
      {
        "sigunguId": "eumseong",
        "area": 1000
      },
      {
        "sigunguId": "chungju",
        "area": 950
      },
      {
        "sigunguId": "cheongdo",
        "area": 944
      },
      {
        "sigunguId": "gimcheon",
        "area": 750
      },
      {
        "sigunguId": "yeongdong",
        "area": 746
      },
      {
        "sigunguId": "uiseong",
        "area": 697
      },
      {
        "sigunguId": "sangju",
        "area": 577
      },
      {
        "sigunguId": "icheon",
        "area": 475
      }
    ]
  },
  "persimmon": {
    "items": [
      "DT_1AG25411 단감_면적",
      "DT_1AG25411 떫은감_면적"
    ],
    "unit": "ha",
    "totalArea": 20423,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "area": 7305
      },
      {
        "provinceId": "gyeongbuk",
        "area": 4071
      },
      {
        "provinceId": "jeonnam",
        "area": 4022
      },
      {
        "provinceId": "jeonbuk",
        "area": 1069
      },
      {
        "provinceId": "gwangju",
        "area": 674
      },
      {
        "provinceId": "daegu",
        "area": 577
      },
      {
        "provinceId": "chungbuk",
        "area": 504
      },
      {
        "provinceId": "chungnam",
        "area": 494
      },
      {
        "provinceId": "busan",
        "area": 433
      },
      {
        "provinceId": "ulsan",
        "area": 364
      },
      {
        "provinceId": "gyeonggi",
        "area": 261
      },
      {
        "provinceId": "daejeon",
        "area": 188
      },
      {
        "provinceId": "gangwon",
        "area": 173
      },
      {
        "provinceId": "seoul",
        "area": 116
      },
      {
        "provinceId": "jeju",
        "area": 68
      },
      {
        "provinceId": "incheon",
        "area": 63
      },
      {
        "provinceId": "sejong",
        "area": 41
      }
    ],
    "top": [
      {
        "sigunguId": "changwon",
        "area": 1949
      },
      {
        "sigunguId": "sangju",
        "area": 1310
      },
      {
        "sigunguId": "cheongdo",
        "area": 1269
      },
      {
        "sigunguId": "jinju",
        "area": 918
      },
      {
        "sigunguId": "gimhae",
        "area": 772
      },
      {
        "sigunguId": "sancheong",
        "area": 706
      },
      {
        "sigunguId": "hadong",
        "area": 636
      },
      {
        "sigunguId": "miryang",
        "area": 617
      },
      {
        "sigunguId": "suncheon",
        "area": 604
      },
      {
        "sigunguId": "gwangyang",
        "area": 597
      }
    ]
  },
  "grape": {
    "items": [
      "DT_1AG25411 노지 포도_면적",
      "DT_1AG25411 시설 포도_면적"
    ],
    "unit": "ha",
    "totalArea": 11411,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "area": 6286
      },
      {
        "provinceId": "chungbuk",
        "area": 1312
      },
      {
        "provinceId": "gyeonggi",
        "area": 1239
      },
      {
        "provinceId": "chungnam",
        "area": 613
      },
      {
        "provinceId": "jeonbuk",
        "area": 599
      },
      {
        "provinceId": "gyeongnam",
        "area": 339
      },
      {
        "provinceId": "daegu",
        "area": 240
      },
      {
        "provinceId": "jeonnam",
        "area": 212
      },
      {
        "provinceId": "gangwon",
        "area": 147
      },
      {
        "provinceId": "daejeon",
        "area": 138
      },
      {
        "provinceId": "incheon",
        "area": 126
      },
      {
        "provinceId": "gwangju",
        "area": 36
      },
      {
        "provinceId": "seoul",
        "area": 35
      },
      {
        "provinceId": "sejong",
        "area": 31
      },
      {
        "provinceId": "busan",
        "area": 20
      },
      {
        "provinceId": "ulsan",
        "area": 20
      },
      {
        "provinceId": "jeju",
        "area": 18
      }
    ],
    "top": [
      {
        "sigunguId": "gimcheon",
        "area": 2174
      },
      {
        "sigunguId": "sangju",
        "area": 1733
      },
      {
        "sigunguId": "yeongcheon",
        "area": 1088
      },
      {
        "sigunguId": "yeongdong",
        "area": 1013
      },
      {
        "sigunguId": "gyeongsan",
        "area": 744
      },
      {
        "sigunguId": "hwaseong",
        "area": 460
      },
      {
        "sigunguId": "cheonan",
        "area": 305
      },
      {
        "sigunguId": "namwon",
        "area": 302
      },
      {
        "sigunguId": "okcheon",
        "area": 174
      },
      {
        "sigunguId": "gumi",
        "area": 167
      }
    ]
  },
  "citrus": {
    "items": [
      "DT_1AG25411 노지 감귤_면적",
      "DT_1AG25411 시설 감귤_면적"
    ],
    "unit": "ha",
    "totalArea": 16052,
    "provinces": [
      {
        "provinceId": "jeju",
        "area": 15677
      },
      {
        "provinceId": "jeonnam",
        "area": 113
      },
      {
        "provinceId": "seoul",
        "area": 57
      },
      {
        "provinceId": "gyeonggi",
        "area": 48
      },
      {
        "provinceId": "gyeongnam",
        "area": 37
      },
      {
        "provinceId": "jeonbuk",
        "area": 26
      },
      {
        "provinceId": "gyeongbuk",
        "area": 25
      },
      {
        "provinceId": "chungnam",
        "area": 20
      },
      {
        "provinceId": "busan",
        "area": 12
      },
      {
        "provinceId": "gwangju",
        "area": 9
      },
      {
        "provinceId": "chungbuk",
        "area": 8
      },
      {
        "provinceId": "daegu",
        "area": 6
      },
      {
        "provinceId": "daejeon",
        "area": 4
      },
      {
        "provinceId": "incheon",
        "area": 3
      },
      {
        "provinceId": "sejong",
        "area": 3
      },
      {
        "provinceId": "ulsan",
        "area": 3
      },
      {
        "provinceId": "gangwon",
        "area": 1
      }
    ],
    "top": [
      {
        "sigunguId": "seogwipo",
        "area": 8911
      },
      {
        "sigunguId": "jeju-si",
        "area": 6766
      }
    ]
  },
  "plum": {
    "items": [
      "DT_1AG25411 자두_면적"
    ],
    "unit": "ha",
    "totalArea": 4475,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "area": 3005
      },
      {
        "provinceId": "daegu",
        "area": 530
      },
      {
        "provinceId": "chungbuk",
        "area": 257
      },
      {
        "provinceId": "gyeongnam",
        "area": 204
      },
      {
        "provinceId": "gyeonggi",
        "area": 92
      },
      {
        "provinceId": "gangwon",
        "area": 88
      },
      {
        "provinceId": "jeonnam",
        "area": 75
      },
      {
        "provinceId": "jeonbuk",
        "area": 46
      },
      {
        "provinceId": "chungnam",
        "area": 43
      },
      {
        "provinceId": "daejeon",
        "area": 35
      },
      {
        "provinceId": "busan",
        "area": 26
      },
      {
        "provinceId": "seoul",
        "area": 20
      },
      {
        "provinceId": "ulsan",
        "area": 18
      },
      {
        "provinceId": "sejong",
        "area": 13
      },
      {
        "provinceId": "gwangju",
        "area": 13
      },
      {
        "provinceId": "incheon",
        "area": 8
      },
      {
        "provinceId": "jeju",
        "area": 2
      }
    ],
    "top": [
      {
        "sigunguId": "uiseong",
        "area": 927
      },
      {
        "sigunguId": "gimcheon",
        "area": 832
      },
      {
        "sigunguId": "yeongcheon",
        "area": 299
      },
      {
        "sigunguId": "gunwi",
        "area": 269
      },
      {
        "sigunguId": "gyeongsan",
        "area": 256
      },
      {
        "sigunguId": "yeongdong",
        "area": 120
      },
      {
        "sigunguId": "gumi",
        "area": 102
      },
      {
        "sigunguId": "andong",
        "area": 93
      },
      {
        "sigunguId": "cheongsong",
        "area": 79
      },
      {
        "sigunguId": "dong-gu-daegu",
        "area": 64
      }
    ]
  },
  "maesil": {
    "items": [
      "DT_1AG25411 매실_면적"
    ],
    "unit": "ha",
    "totalArea": 4493,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "area": 1735
      },
      {
        "provinceId": "gyeongnam",
        "area": 973
      },
      {
        "provinceId": "gyeonggi",
        "area": 341
      },
      {
        "provinceId": "gyeongbuk",
        "area": 201
      },
      {
        "provinceId": "jeonbuk",
        "area": 178
      },
      {
        "provinceId": "chungnam",
        "area": 159
      },
      {
        "provinceId": "busan",
        "area": 147
      },
      {
        "provinceId": "chungbuk",
        "area": 113
      },
      {
        "provinceId": "daegu",
        "area": 113
      },
      {
        "provinceId": "gwangju",
        "area": 106
      },
      {
        "provinceId": "seoul",
        "area": 89
      },
      {
        "provinceId": "daejeon",
        "area": 83
      },
      {
        "provinceId": "gangwon",
        "area": 68
      },
      {
        "provinceId": "ulsan",
        "area": 63
      },
      {
        "provinceId": "jeju",
        "area": 52
      },
      {
        "provinceId": "incheon",
        "area": 45
      },
      {
        "provinceId": "sejong",
        "area": 27
      }
    ],
    "top": [
      {
        "sigunguId": "gwangyang",
        "area": 677
      },
      {
        "sigunguId": "suncheon",
        "area": 579
      },
      {
        "sigunguId": "hadong",
        "area": 314
      },
      {
        "sigunguId": "jinju",
        "area": 181
      },
      {
        "sigunguId": "changwon",
        "area": 113
      },
      {
        "sigunguId": "gurye",
        "area": 103
      },
      {
        "sigunguId": "gokseong",
        "area": 75
      },
      {
        "sigunguId": "geoje",
        "area": 64
      },
      {
        "sigunguId": "yeosu",
        "area": 61
      },
      {
        "sigunguId": "yangsan",
        "area": 56
      }
    ]
  },
  "blueberry": {
    "items": [
      "DT_1AG25411 블루베리_면적"
    ],
    "unit": "ha",
    "totalArea": 2685,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "area": 407
      },
      {
        "provinceId": "jeonbuk",
        "area": 374
      },
      {
        "provinceId": "gyeonggi",
        "area": 311
      },
      {
        "provinceId": "chungnam",
        "area": 281
      },
      {
        "provinceId": "gyeongbuk",
        "area": 275
      },
      {
        "provinceId": "jeonnam",
        "area": 265
      },
      {
        "provinceId": "chungbuk",
        "area": 262
      },
      {
        "provinceId": "gangwon",
        "area": 134
      },
      {
        "provinceId": "jeju",
        "area": 77
      },
      {
        "provinceId": "busan",
        "area": 52
      },
      {
        "provinceId": "daejeon",
        "area": 49
      },
      {
        "provinceId": "gwangju",
        "area": 49
      },
      {
        "provinceId": "daegu",
        "area": 48
      },
      {
        "provinceId": "ulsan",
        "area": 41
      },
      {
        "provinceId": "seoul",
        "area": 28
      },
      {
        "provinceId": "incheon",
        "area": 20
      },
      {
        "provinceId": "sejong",
        "area": 12
      }
    ],
    "top": [
      {
        "sigunguId": "yeongdong",
        "area": 89
      },
      {
        "sigunguId": "sunchang",
        "area": 78
      },
      {
        "sigunguId": "damyang",
        "area": 75
      },
      {
        "sigunguId": "gimhae",
        "area": 69
      },
      {
        "sigunguId": "gochang",
        "area": 62
      },
      {
        "sigunguId": "jeju-si",
        "area": 54
      },
      {
        "sigunguId": "cheongju",
        "area": 49
      },
      {
        "sigunguId": "jinju",
        "area": 49
      },
      {
        "sigunguId": "pyeongtaek",
        "area": 41
      },
      {
        "sigunguId": "cheonan",
        "area": 40
      }
    ]
  },
  "chestnut": {
    "items": [
      "DT_1AG25411 밤_면적"
    ],
    "unit": "ha",
    "totalArea": 13738,
    "provinces": [
      {
        "provinceId": "chungnam",
        "area": 7892
      },
      {
        "provinceId": "gyeongnam",
        "area": 2042
      },
      {
        "provinceId": "jeonnam",
        "area": 1229
      },
      {
        "provinceId": "chungbuk",
        "area": 974
      },
      {
        "provinceId": "jeonbuk",
        "area": 304
      },
      {
        "provinceId": "sejong",
        "area": 285
      },
      {
        "provinceId": "gyeonggi",
        "area": 278
      },
      {
        "provinceId": "gangwon",
        "area": 189
      },
      {
        "provinceId": "daejeon",
        "area": 156
      },
      {
        "provinceId": "gyeongbuk",
        "area": 137
      },
      {
        "provinceId": "seoul",
        "area": 84
      },
      {
        "provinceId": "busan",
        "area": 47
      },
      {
        "provinceId": "daegu",
        "area": 46
      },
      {
        "provinceId": "incheon",
        "area": 33
      },
      {
        "provinceId": "gwangju",
        "area": 25
      },
      {
        "provinceId": "ulsan",
        "area": 16
      },
      {
        "provinceId": "jeju",
        "area": 1
      }
    ],
    "top": [
      {
        "sigunguId": "gongju",
        "area": 3297
      },
      {
        "sigunguId": "buyeo",
        "area": 2902
      },
      {
        "sigunguId": "cheongyang",
        "area": 1302
      },
      {
        "sigunguId": "chungju",
        "area": 767
      },
      {
        "sigunguId": "hadong",
        "area": 667
      },
      {
        "sigunguId": "gwangyang",
        "area": 509
      },
      {
        "sigunguId": "hamyang",
        "area": 383
      },
      {
        "sigunguId": "gurye",
        "area": 295
      },
      {
        "sigunguId": "suncheon",
        "area": 291
      },
      {
        "sigunguId": "sejong-si",
        "area": 285
      }
    ]
  },
  "walnut": {
    "items": [
      "DT_1AG25411 호두_면적"
    ],
    "unit": "ha",
    "totalArea": 2669,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "area": 840
      },
      {
        "provinceId": "chungbuk",
        "area": 561
      },
      {
        "provinceId": "chungnam",
        "area": 220
      },
      {
        "provinceId": "gyeonggi",
        "area": 178
      },
      {
        "provinceId": "jeonbuk",
        "area": 151
      },
      {
        "provinceId": "daegu",
        "area": 140
      },
      {
        "provinceId": "gangwon",
        "area": 125
      },
      {
        "provinceId": "jeonnam",
        "area": 125
      },
      {
        "provinceId": "gyeongnam",
        "area": 125
      },
      {
        "provinceId": "daejeon",
        "area": 54
      },
      {
        "provinceId": "seoul",
        "area": 51
      },
      {
        "provinceId": "sejong",
        "area": 28
      },
      {
        "provinceId": "busan",
        "area": 21
      },
      {
        "provinceId": "gwangju",
        "area": 16
      },
      {
        "provinceId": "ulsan",
        "area": 15
      },
      {
        "provinceId": "incheon",
        "area": 14
      },
      {
        "provinceId": "jeju",
        "area": 5
      }
    ],
    "top": [
      {
        "sigunguId": "yeongdong",
        "area": 257
      },
      {
        "sigunguId": "gimcheon",
        "area": 243
      },
      {
        "sigunguId": "yecheon",
        "area": 137
      },
      {
        "sigunguId": "cheonan",
        "area": 94
      },
      {
        "sigunguId": "yeongju",
        "area": 62
      },
      {
        "sigunguId": "okcheon",
        "area": 61
      },
      {
        "sigunguId": "andong",
        "area": 60
      },
      {
        "sigunguId": "chungju",
        "area": 56
      },
      {
        "sigunguId": "cheongju",
        "area": 55
      },
      {
        "sigunguId": "gumi",
        "area": 54
      }
    ]
  }
};
