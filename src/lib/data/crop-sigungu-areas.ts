/**
 * 작물별 재배면적 상위 시·군·구 — 2025 농림어업총조사 (scripts/collect-crop-sigungu-areas.ts 가 생성, 손으로 고치지 않는다)
 *
 * 항목: crop-sigungu-tables.ts. 수집 때 항목 이름·단위·시·군·구 짝·원천 시·도 = 시·군·구 합을 확인했다.
 * 작물 상세 '주요 산지 (시·군·구)' 칩이 이 순서를 쓴다. 수집일: 2026-10-10
 */

export interface CropSigunguArea {
  /** 더한 원천 항목 (표 ID + 항목 이름) */
  items: string[];
  /** 원천 단위 */
  unit: string;
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
      },
      {
        "sigunguId": "paju",
        "area": 9
      },
      {
        "sigunguId": "asan",
        "area": 8
      },
      {
        "sigunguId": "goyang",
        "area": 7
      }
    ]
  },
  "watermelon": {
    "items": [
      "DT_1AG25403 수박_면적",
      "DT_1AG25407 수박_면적"
    ],
    "unit": "ha",
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
      },
      {
        "sigunguId": "yangsan",
        "area": 52
      },
      {
        "sigunguId": "miryang",
        "area": 50
      },
      {
        "sigunguId": "changwon",
        "area": 42
      },
      {
        "sigunguId": "gangneung",
        "area": 36
      },
      {
        "sigunguId": "gimhae",
        "area": 22
      },
      {
        "sigunguId": "yongin",
        "area": 19
      }
    ]
  },
  "ginseng": {
    "items": [
      "DT_1AG25403 인삼_면적"
    ],
    "unit": "ha",
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
      },
      {
        "sigunguId": "goryeong",
        "area": 99
      },
      {
        "sigunguId": "gimcheon",
        "area": 53
      },
      {
        "sigunguId": "dalseo",
        "area": 46
      },
      {
        "sigunguId": "gyeongsan",
        "area": 24
      },
      {
        "sigunguId": "yeoju",
        "area": 18
      },
      {
        "sigunguId": "gumi",
        "area": 16
      },
      {
        "sigunguId": "buk-gu-daegu",
        "area": 13
      }
    ]
  },
  "tomato": {
    "items": [
      "DT_1AG25407 토마토(일반)_면적"
    ],
    "unit": "ha",
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
      },
      {
        "sigunguId": "miryang",
        "area": 9
      },
      {
        "sigunguId": "namwon",
        "area": 7
      }
    ]
  },
  "apple": {
    "items": [
      "DT_1AG25411 사과_면적"
    ],
    "unit": "ha",
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
    "top": [
      {
        "sigunguId": "seogwipo",
        "area": 8911
      },
      {
        "sigunguId": "jeju-si",
        "area": 6766
      },
      {
        "sigunguId": "naju",
        "area": 27
      },
      {
        "sigunguId": "wando",
        "area": 22
      },
      {
        "sigunguId": "goheung",
        "area": 14
      },
      {
        "sigunguId": "jeongeup",
        "area": 12
      },
      {
        "sigunguId": "tongyeong",
        "area": 10
      },
      {
        "sigunguId": "goryeong",
        "area": 9
      },
      {
        "sigunguId": "changwon",
        "area": 9
      },
      {
        "sigunguId": "gwangjin",
        "area": 8
      }
    ]
  },
  "plum": {
    "items": [
      "DT_1AG25411 자두_면적"
    ],
    "unit": "ha",
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
