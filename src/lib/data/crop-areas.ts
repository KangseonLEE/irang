/**
 * 작물별 시·도 재배면적 — 국가데이터처 KOSIS 농작물생산조사 (scripts/collect-crop-areas.ts 가 생성, 손으로 고치지 않는다)
 *
 * 작물마다 표 하나·면적 항목 하나(crop-area-tables.ts), 수집 때 항목 이름·단위(ha)·시·도 코드↔이름·시·도 합 = 전국을 확인했다.
 * 수집일: 2026-10-09
 */

export interface CropAreaStat {
  /** 조사 연도 */
  year: number;
  /** KOSIS 통계표 ID (orgId 101) */
  tblId: string;
  /** KOSIS 통계표 이름 */
  tableName: string;
  /** KOSIS 항목 이름 (예: "콩:면적") */
  itemName: string;
  /** 전국 재배면적 (ha) */
  totalHa: number;
  /** 시·도별 재배면적 (ha), 큰 순 */
  provinces: { provinceId: string; areaHa: number }[];
}

export const CROP_AREAS: Record<string, CropAreaStat> = {
  "rice": {
    "year": 2025,
    "tblId": "DT_1ET0034",
    "tableName": "시군별 논벼 생산량(정곡92.9%)",
    "itemName": "논벼:재배면적",
    "totalHa": 677421.7,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 142402.2
      },
      {
        "provinceId": "chungnam",
        "areaHa": 125266.2
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 100712.4
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 86599.2
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 72288.6
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 60224.6
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 32123.5
      },
      {
        "provinceId": "gangwon",
        "areaHa": 27113.3
      },
      {
        "provinceId": "incheon",
        "areaHa": 11145.9
      },
      {
        "provinceId": "daegu",
        "areaHa": 5171.1
      },
      {
        "provinceId": "gwangju",
        "areaHa": 4772.2
      },
      {
        "provinceId": "ulsan",
        "areaHa": 3348.6
      },
      {
        "provinceId": "sejong",
        "areaHa": 3140.3
      },
      {
        "provinceId": "busan",
        "areaHa": 1874.9
      },
      {
        "provinceId": "daejeon",
        "areaHa": 1058.7
      },
      {
        "provinceId": "seoul",
        "areaHa": 175.6
      },
      {
        "provinceId": "jeju",
        "areaHa": 4.4
      }
    ]
  },
  "soybean": {
    "year": 2025,
    "tblId": "DT_1ET0025",
    "tableName": "두류생산량",
    "itemName": "콩:면적",
    "totalHa": 74014.9,
    "provinces": [
      {
        "provinceId": "jeonbuk",
        "areaHa": 21875.9
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 11009.3
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 8801.3
      },
      {
        "provinceId": "chungnam",
        "areaHa": 8708.7
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 6810.4
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 4990
      },
      {
        "provinceId": "gangwon",
        "areaHa": 4335.8
      },
      {
        "provinceId": "jeju",
        "areaHa": 3366.1
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 2966.1
      },
      {
        "provinceId": "incheon",
        "areaHa": 432.2
      },
      {
        "provinceId": "daegu",
        "areaHa": 215.2
      },
      {
        "provinceId": "sejong",
        "areaHa": 191.3
      },
      {
        "provinceId": "gwangju",
        "areaHa": 163.3
      },
      {
        "provinceId": "ulsan",
        "areaHa": 75
      },
      {
        "provinceId": "daejeon",
        "areaHa": 50.9
      },
      {
        "provinceId": "busan",
        "areaHa": 21.7
      },
      {
        "provinceId": "seoul",
        "areaHa": 1.7
      }
    ]
  },
  "sweet-potato": {
    "year": 2024,
    "tblId": "DT_1ET0026",
    "tableName": "서류생산량(생서)",
    "itemName": "고구마:면적",
    "totalHa": 17732,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 5373.8
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 3291.7
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 2279.3
      },
      {
        "provinceId": "chungnam",
        "areaHa": 2110.1
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1182.8
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 1173.6
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 896.2
      },
      {
        "provinceId": "incheon",
        "areaHa": 530.6
      },
      {
        "provinceId": "gangwon",
        "areaHa": 450.8
      },
      {
        "provinceId": "ulsan",
        "areaHa": 102.2
      },
      {
        "provinceId": "daegu",
        "areaHa": 70.9
      },
      {
        "provinceId": "daejeon",
        "areaHa": 70.3
      },
      {
        "provinceId": "gwangju",
        "areaHa": 54.4
      },
      {
        "provinceId": "sejong",
        "areaHa": 51.8
      },
      {
        "provinceId": "jeju",
        "areaHa": 45.3
      },
      {
        "provinceId": "busan",
        "areaHa": 36.2
      },
      {
        "provinceId": "seoul",
        "areaHa": 12.1
      }
    ]
  },
  "potato": {
    "year": 2024,
    "tblId": "DT_1ET0026",
    "tableName": "서류생산량(생서)",
    "itemName": "감자:면적",
    "totalHa": 23968.9,
    "provinces": [
      {
        "provinceId": "gangwon",
        "areaHa": 5709
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 3148.6
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 2909.5
      },
      {
        "provinceId": "chungnam",
        "areaHa": 2819.5
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 2198.9
      },
      {
        "provinceId": "jeju",
        "areaHa": 1802.9
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 1778.5
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1496.3
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 1335.3
      },
      {
        "provinceId": "daegu",
        "areaHa": 303.5
      },
      {
        "provinceId": "incheon",
        "areaHa": 183.6
      },
      {
        "provinceId": "ulsan",
        "areaHa": 83
      },
      {
        "provinceId": "gwangju",
        "areaHa": 59.8
      },
      {
        "provinceId": "daejeon",
        "areaHa": 47.9
      },
      {
        "provinceId": "busan",
        "areaHa": 45.8
      },
      {
        "provinceId": "sejong",
        "areaHa": 30.4
      },
      {
        "provinceId": "seoul",
        "areaHa": 16.3
      }
    ]
  },
  "corn": {
    "year": 2024,
    "tblId": "DT_1ET0024",
    "tableName": "잡곡생산량",
    "itemName": "옥수수:면적",
    "totalHa": 15566.8,
    "provinces": [
      {
        "provinceId": "gangwon",
        "areaHa": 5364.5
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 2760.2
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 1798.4
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1450.9
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1125.3
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 851.1
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 841
      },
      {
        "provinceId": "chungnam",
        "areaHa": 651.6
      },
      {
        "provinceId": "jeju",
        "areaHa": 276.4
      },
      {
        "provinceId": "ulsan",
        "areaHa": 100
      },
      {
        "provinceId": "incheon",
        "areaHa": 84.2
      },
      {
        "provinceId": "daegu",
        "areaHa": 64.9
      },
      {
        "provinceId": "busan",
        "areaHa": 64.6
      },
      {
        "provinceId": "gwangju",
        "areaHa": 48.1
      },
      {
        "provinceId": "sejong",
        "areaHa": 43.8
      },
      {
        "provinceId": "daejeon",
        "areaHa": 38.2
      },
      {
        "provinceId": "seoul",
        "areaHa": 3.7
      }
    ]
  },
  "buckwheat": {
    "year": 2024,
    "tblId": "DT_1ET0024",
    "tableName": "잡곡생산량",
    "itemName": "메밀:면적",
    "totalHa": 3721.2,
    "provinces": [
      {
        "provinceId": "jeju",
        "areaHa": 3236.3
      },
      {
        "provinceId": "gangwon",
        "areaHa": 186.5
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 173.6
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 43.3
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 25.6
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 16.8
      },
      {
        "provinceId": "chungnam",
        "areaHa": 15.8
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 10.7
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 8
      },
      {
        "provinceId": "ulsan",
        "areaHa": 3.1
      },
      {
        "provinceId": "gwangju",
        "areaHa": 1.1
      },
      {
        "provinceId": "daegu",
        "areaHa": 0.3
      },
      {
        "provinceId": "seoul",
        "areaHa": 0
      },
      {
        "provinceId": "incheon",
        "areaHa": 0
      },
      {
        "provinceId": "sejong",
        "areaHa": 0
      },
      {
        "provinceId": "daejeon",
        "areaHa": 0
      },
      {
        "provinceId": "busan",
        "areaHa": 0
      }
    ]
  },
  "sesame": {
    "year": 2025,
    "tblId": "DT_1ET0293",
    "tableName": "특용작물생산량",
    "itemName": "참깨:면적",
    "totalHa": 19298,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 4760.1
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 4348.9
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 1936
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 1808.3
      },
      {
        "provinceId": "chungnam",
        "areaHa": 1795.8
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 1590.7
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1144.3
      },
      {
        "provinceId": "gangwon",
        "areaHa": 563.7
      },
      {
        "provinceId": "daegu",
        "areaHa": 484.8
      },
      {
        "provinceId": "jeju",
        "areaHa": 411.5
      },
      {
        "provinceId": "gwangju",
        "areaHa": 126
      },
      {
        "provinceId": "incheon",
        "areaHa": 97.7
      },
      {
        "provinceId": "ulsan",
        "areaHa": 79
      },
      {
        "provinceId": "sejong",
        "areaHa": 71.2
      },
      {
        "provinceId": "daejeon",
        "areaHa": 53.8
      },
      {
        "provinceId": "busan",
        "areaHa": 22.7
      },
      {
        "provinceId": "seoul",
        "areaHa": 3.5
      }
    ]
  },
  "perilla-seed": {
    "year": 2024,
    "tblId": "DT_1ET0293",
    "tableName": "특용작물생산량",
    "itemName": "들깨:면적",
    "totalHa": 38389.6,
    "provinces": [
      {
        "provinceId": "gyeonggi",
        "areaHa": 6670.5
      },
      {
        "provinceId": "chungnam",
        "areaHa": 6614.5
      },
      {
        "provinceId": "gangwon",
        "areaHa": 5424.5
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 4896.6
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 4490.7
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 3374.4
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 2652.7
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 2598.6
      },
      {
        "provinceId": "incheon",
        "areaHa": 378.8
      },
      {
        "provinceId": "sejong",
        "areaHa": 352.4
      },
      {
        "provinceId": "daejeon",
        "areaHa": 284.8
      },
      {
        "provinceId": "daegu",
        "areaHa": 273.7
      },
      {
        "provinceId": "ulsan",
        "areaHa": 241
      },
      {
        "provinceId": "gwangju",
        "areaHa": 98.3
      },
      {
        "provinceId": "busan",
        "areaHa": 26.1
      },
      {
        "provinceId": "seoul",
        "areaHa": 10.2
      },
      {
        "provinceId": "jeju",
        "areaHa": 1.7
      }
    ]
  },
  "chili-pepper": {
    "year": 2024,
    "tblId": "DT_1ET0291",
    "tableName": "채소생산량(조미채소)",
    "itemName": "고추:면적",
    "totalHa": 30147.3,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 7431
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 4608
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 3200.2
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 3130.2
      },
      {
        "provinceId": "gangwon",
        "areaHa": 3028.6
      },
      {
        "provinceId": "chungnam",
        "areaHa": 2781.7
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 2506.1
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 2125.6
      },
      {
        "provinceId": "incheon",
        "areaHa": 358.7
      },
      {
        "provinceId": "gwangju",
        "areaHa": 290.2
      },
      {
        "provinceId": "daegu",
        "areaHa": 190.6
      },
      {
        "provinceId": "ulsan",
        "areaHa": 159.6
      },
      {
        "provinceId": "jeju",
        "areaHa": 101.4
      },
      {
        "provinceId": "sejong",
        "areaHa": 80.5
      },
      {
        "provinceId": "daejeon",
        "areaHa": 78.4
      },
      {
        "provinceId": "busan",
        "areaHa": 64.1
      },
      {
        "provinceId": "seoul",
        "areaHa": 12.1
      }
    ]
  },
  "green-onion": {
    "year": 2024,
    "tblId": "DT_1ET0291",
    "tableName": "채소생산량(조미채소)",
    "itemName": "대파:면적",
    "totalHa": 13516.8,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 4393.1
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1983.6
      },
      {
        "provinceId": "gangwon",
        "areaHa": 1569.6
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 1188.2
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1017.9
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 955.8
      },
      {
        "provinceId": "chungnam",
        "areaHa": 645.7
      },
      {
        "provinceId": "busan",
        "areaHa": 543.7
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 467.7
      },
      {
        "provinceId": "jeju",
        "areaHa": 260.5
      },
      {
        "provinceId": "daegu",
        "areaHa": 247.3
      },
      {
        "provinceId": "incheon",
        "areaHa": 77
      },
      {
        "provinceId": "sejong",
        "areaHa": 75.7
      },
      {
        "provinceId": "ulsan",
        "areaHa": 41.8
      },
      {
        "provinceId": "daejeon",
        "areaHa": 24.7
      },
      {
        "provinceId": "gwangju",
        "areaHa": 15.8
      },
      {
        "provinceId": "seoul",
        "areaHa": 8.9
      }
    ]
  },
  "onion": {
    "year": 2026,
    "tblId": "DT_1ET0291",
    "tableName": "채소생산량(조미채소)",
    "itemName": "양파:면적",
    "totalHa": 17555.8,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 6070
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 3839.3
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 2224.5
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 1975.1
      },
      {
        "provinceId": "chungnam",
        "areaHa": 1301.2
      },
      {
        "provinceId": "jeju",
        "areaHa": 954.5
      },
      {
        "provinceId": "daegu",
        "areaHa": 506.4
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 387.3
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 106
      },
      {
        "provinceId": "gangwon",
        "areaHa": 94.1
      },
      {
        "provinceId": "ulsan",
        "areaHa": 30.1
      },
      {
        "provinceId": "incheon",
        "areaHa": 18.7
      },
      {
        "provinceId": "sejong",
        "areaHa": 15.4
      },
      {
        "provinceId": "gwangju",
        "areaHa": 12.5
      },
      {
        "provinceId": "busan",
        "areaHa": 11.3
      },
      {
        "provinceId": "daejeon",
        "areaHa": 8.7
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.7
      }
    ]
  },
  "ginger": {
    "year": 2024,
    "tblId": "DT_1ET0291",
    "tableName": "채소생산량(조미채소)",
    "itemName": "생강:면적",
    "totalHa": 2491,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 975.5
      },
      {
        "provinceId": "chungnam",
        "areaHa": 716.8
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 359.2
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 139.1
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 112.6
      },
      {
        "provinceId": "gangwon",
        "areaHa": 57.1
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 47.6
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 47.2
      },
      {
        "provinceId": "daegu",
        "areaHa": 10.4
      },
      {
        "provinceId": "jeju",
        "areaHa": 10.3
      },
      {
        "provinceId": "sejong",
        "areaHa": 5
      },
      {
        "provinceId": "incheon",
        "areaHa": 3.7
      },
      {
        "provinceId": "daejeon",
        "areaHa": 2.2
      },
      {
        "provinceId": "gwangju",
        "areaHa": 2
      },
      {
        "provinceId": "ulsan",
        "areaHa": 1
      },
      {
        "provinceId": "busan",
        "areaHa": 0.9
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.3
      }
    ]
  },
  "garlic": {
    "year": 2026,
    "tblId": "DT_1ET0291",
    "tableName": "채소생산량(조미채소)",
    "itemName": "마늘:면적",
    "totalHa": 24231.9,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "areaHa": 7921
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 5273.3
      },
      {
        "provinceId": "chungnam",
        "areaHa": 3768.2
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 3021.1
      },
      {
        "provinceId": "daegu",
        "areaHa": 874.2
      },
      {
        "provinceId": "jeju",
        "areaHa": 827.8
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 754
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 693.3
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 614.6
      },
      {
        "provinceId": "gangwon",
        "areaHa": 235.8
      },
      {
        "provinceId": "incheon",
        "areaHa": 53.7
      },
      {
        "provinceId": "sejong",
        "areaHa": 49.5
      },
      {
        "provinceId": "ulsan",
        "areaHa": 49.4
      },
      {
        "provinceId": "daejeon",
        "areaHa": 41.9
      },
      {
        "provinceId": "busan",
        "areaHa": 26.6
      },
      {
        "provinceId": "gwangju",
        "areaHa": 23.7
      },
      {
        "provinceId": "seoul",
        "areaHa": 3.7
      }
    ]
  },
  "napa-cabbage": {
    "year": 2024,
    "tblId": "DT_1ET0028",
    "tableName": "채소생산량(엽채류)",
    "itemName": "배추:면적",
    "totalHa": 28637.4,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 7888.1
      },
      {
        "provinceId": "gangwon",
        "areaHa": 6555.3
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 4128.3
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 2581.8
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 2478.4
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 1735.3
      },
      {
        "provinceId": "chungnam",
        "areaHa": 1574.1
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 625.4
      },
      {
        "provinceId": "daegu",
        "areaHa": 384.3
      },
      {
        "provinceId": "gwangju",
        "areaHa": 160.6
      },
      {
        "provinceId": "jeju",
        "areaHa": 140.8
      },
      {
        "provinceId": "incheon",
        "areaHa": 121.9
      },
      {
        "provinceId": "ulsan",
        "areaHa": 100.5
      },
      {
        "provinceId": "busan",
        "areaHa": 63
      },
      {
        "provinceId": "sejong",
        "areaHa": 47.7
      },
      {
        "provinceId": "daejeon",
        "areaHa": 42.2
      },
      {
        "provinceId": "seoul",
        "areaHa": 9.6
      }
    ]
  },
  "spinach": {
    "year": 2024,
    "tblId": "DT_1ET0028",
    "tableName": "채소생산량(엽채류)",
    "itemName": "시금치:면적",
    "totalHa": 4421.3,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "areaHa": 1625.4
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1458.5
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 464
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 292.1
      },
      {
        "provinceId": "chungnam",
        "areaHa": 225.6
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 110.1
      },
      {
        "provinceId": "incheon",
        "areaHa": 61.4
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 46.5
      },
      {
        "provinceId": "jeju",
        "areaHa": 43.1
      },
      {
        "provinceId": "gangwon",
        "areaHa": 21.7
      },
      {
        "provinceId": "daegu",
        "areaHa": 20.4
      },
      {
        "provinceId": "busan",
        "areaHa": 17.1
      },
      {
        "provinceId": "ulsan",
        "areaHa": 13.7
      },
      {
        "provinceId": "gwangju",
        "areaHa": 10.8
      },
      {
        "provinceId": "sejong",
        "areaHa": 6.4
      },
      {
        "provinceId": "seoul",
        "areaHa": 2.7
      },
      {
        "provinceId": "daejeon",
        "areaHa": 1.8
      }
    ]
  },
  "lettuce": {
    "year": 2024,
    "tblId": "DT_1ET0028",
    "tableName": "채소생산량(엽채류)",
    "itemName": "상추:면적",
    "totalHa": 4458.1,
    "provinces": [
      {
        "provinceId": "jeonbuk",
        "areaHa": 1471.7
      },
      {
        "provinceId": "chungnam",
        "areaHa": 1039.2
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 750.2
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 245.2
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 213.5
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 187
      },
      {
        "provinceId": "gangwon",
        "areaHa": 172.9
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 129.5
      },
      {
        "provinceId": "busan",
        "areaHa": 109.7
      },
      {
        "provinceId": "incheon",
        "areaHa": 37.3
      },
      {
        "provinceId": "daegu",
        "areaHa": 31.8
      },
      {
        "provinceId": "ulsan",
        "areaHa": 27.8
      },
      {
        "provinceId": "jeju",
        "areaHa": 12.4
      },
      {
        "provinceId": "gwangju",
        "areaHa": 9.6
      },
      {
        "provinceId": "seoul",
        "areaHa": 8
      },
      {
        "provinceId": "daejeon",
        "areaHa": 8
      },
      {
        "provinceId": "sejong",
        "areaHa": 4.2
      }
    ]
  },
  "radish": {
    "year": 2024,
    "tblId": "DT_1ET0029",
    "tableName": "채소생산량(근채류)",
    "itemName": "무:면적",
    "totalHa": 18497.3,
    "provinces": [
      {
        "provinceId": "jeju",
        "areaHa": 5475.8
      },
      {
        "provinceId": "gangwon",
        "areaHa": 3048.3
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 2231.7
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 1791.6
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 1606.6
      },
      {
        "provinceId": "chungnam",
        "areaHa": 1420.3
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1223.2
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 619.9
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 560.2
      },
      {
        "provinceId": "daegu",
        "areaHa": 159.5
      },
      {
        "provinceId": "gwangju",
        "areaHa": 130.6
      },
      {
        "provinceId": "incheon",
        "areaHa": 79.4
      },
      {
        "provinceId": "ulsan",
        "areaHa": 46.5
      },
      {
        "provinceId": "busan",
        "areaHa": 35.2
      },
      {
        "provinceId": "sejong",
        "areaHa": 32.1
      },
      {
        "provinceId": "daejeon",
        "areaHa": 28.7
      },
      {
        "provinceId": "seoul",
        "areaHa": 7.5
      }
    ]
  },
  "carrot": {
    "year": 2024,
    "tblId": "DT_1ET0029",
    "tableName": "채소생산량(근채류)",
    "itemName": "당근:면적",
    "totalHa": 3054.1,
    "provinces": [
      {
        "provinceId": "jeju",
        "areaHa": 1284.7
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 787.1
      },
      {
        "provinceId": "gangwon",
        "areaHa": 467.3
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 190.6
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 74.6
      },
      {
        "provinceId": "busan",
        "areaHa": 73.4
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 55.8
      },
      {
        "provinceId": "chungnam",
        "areaHa": 43.3
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 41.7
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 20.1
      },
      {
        "provinceId": "ulsan",
        "areaHa": 7.3
      },
      {
        "provinceId": "incheon",
        "areaHa": 3.3
      },
      {
        "provinceId": "daejeon",
        "areaHa": 2.2
      },
      {
        "provinceId": "daegu",
        "areaHa": 1.4
      },
      {
        "provinceId": "sejong",
        "areaHa": 0.9
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.2
      },
      {
        "provinceId": "gwangju",
        "areaHa": 0.1
      }
    ]
  },
  "watermelon": {
    "year": 2024,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "수박:면적",
    "totalHa": 10673.5,
    "provinces": [
      {
        "provinceId": "chungnam",
        "areaHa": 2277.3
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 2165.4
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 1892.6
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 1412.5
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1143.3
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 481.8
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 330.5
      },
      {
        "provinceId": "daegu",
        "areaHa": 324.8
      },
      {
        "provinceId": "gangwon",
        "areaHa": 311
      },
      {
        "provinceId": "jeju",
        "areaHa": 193.3
      },
      {
        "provinceId": "sejong",
        "areaHa": 65.5
      },
      {
        "provinceId": "gwangju",
        "areaHa": 37.4
      },
      {
        "provinceId": "incheon",
        "areaHa": 19.5
      },
      {
        "provinceId": "ulsan",
        "areaHa": 10.5
      },
      {
        "provinceId": "busan",
        "areaHa": 5.1
      },
      {
        "provinceId": "daejeon",
        "areaHa": 2.4
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.5
      }
    ]
  },
  "melon": {
    "year": 2024,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "참외:면적",
    "totalHa": 4503.7,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 4118.3
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 141.1
      },
      {
        "provinceId": "daegu",
        "areaHa": 62.2
      },
      {
        "provinceId": "chungnam",
        "areaHa": 46.2
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 28.6
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 25.2
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 24.6
      },
      {
        "provinceId": "incheon",
        "areaHa": 18.3
      },
      {
        "provinceId": "gangwon",
        "areaHa": 16.5
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 8.1
      },
      {
        "provinceId": "ulsan",
        "areaHa": 4.1
      },
      {
        "provinceId": "jeju",
        "areaHa": 3.2
      },
      {
        "provinceId": "busan",
        "areaHa": 3.1
      },
      {
        "provinceId": "daejeon",
        "areaHa": 1.9
      },
      {
        "provinceId": "gwangju",
        "areaHa": 1.1
      },
      {
        "provinceId": "sejong",
        "areaHa": 0.9
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.4
      }
    ]
  },
  "strawberry": {
    "year": 2024,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "딸기:면적",
    "totalHa": 5612.1,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "areaHa": 2506.3
      },
      {
        "provinceId": "chungnam",
        "areaHa": 1019.7
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 584.9
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 504.1
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 465
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 189.6
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 158.5
      },
      {
        "provinceId": "jeju",
        "areaHa": 49.3
      },
      {
        "provinceId": "daejeon",
        "areaHa": 40.2
      },
      {
        "provinceId": "gangwon",
        "areaHa": 35.6
      },
      {
        "provinceId": "sejong",
        "areaHa": 25.2
      },
      {
        "provinceId": "gwangju",
        "areaHa": 14.1
      },
      {
        "provinceId": "ulsan",
        "areaHa": 8.7
      },
      {
        "provinceId": "daegu",
        "areaHa": 5.6
      },
      {
        "provinceId": "incheon",
        "areaHa": 4.2
      },
      {
        "provinceId": "busan",
        "areaHa": 0.8
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.2
      }
    ]
  },
  "cucumber": {
    "year": 2024,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "오이:면적",
    "totalHa": 4154.4,
    "provinces": [
      {
        "provinceId": "gangwon",
        "areaHa": 915.7
      },
      {
        "provinceId": "chungnam",
        "areaHa": 817.1
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 486.9
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 474.4
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 397.8
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 358.7
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 244.5
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 154.1
      },
      {
        "provinceId": "daegu",
        "areaHa": 73.6
      },
      {
        "provinceId": "sejong",
        "areaHa": 60.9
      },
      {
        "provinceId": "jeju",
        "areaHa": 54.1
      },
      {
        "provinceId": "incheon",
        "areaHa": 36.6
      },
      {
        "provinceId": "daejeon",
        "areaHa": 36.1
      },
      {
        "provinceId": "ulsan",
        "areaHa": 14.8
      },
      {
        "provinceId": "busan",
        "areaHa": 12
      },
      {
        "provinceId": "seoul",
        "areaHa": 8.9
      },
      {
        "provinceId": "gwangju",
        "areaHa": 8.3
      }
    ]
  },
  "zucchini": {
    "year": 2024,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "호박:면적",
    "totalHa": 10359.9,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 1817
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1328.8
      },
      {
        "provinceId": "jeju",
        "areaHa": 1304.5
      },
      {
        "provinceId": "gangwon",
        "areaHa": 1234.4
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 1179.2
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1143.6
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 769.1
      },
      {
        "provinceId": "chungnam",
        "areaHa": 691
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 451.6
      },
      {
        "provinceId": "daegu",
        "areaHa": 99.4
      },
      {
        "provinceId": "ulsan",
        "areaHa": 77.9
      },
      {
        "provinceId": "gwangju",
        "areaHa": 70.6
      },
      {
        "provinceId": "sejong",
        "areaHa": 69
      },
      {
        "provinceId": "incheon",
        "areaHa": 43
      },
      {
        "provinceId": "busan",
        "areaHa": 42.6
      },
      {
        "provinceId": "daejeon",
        "areaHa": 33.6
      },
      {
        "provinceId": "seoul",
        "areaHa": 4.7
      }
    ]
  },
  "tomato": {
    "year": 2024,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "토마토:면적",
    "totalHa": 6085.9,
    "provinces": [
      {
        "provinceId": "gangwon",
        "areaHa": 1017.2
      },
      {
        "provinceId": "chungnam",
        "areaHa": 907.3
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 852.5
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 596.1
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 537.3
      },
      {
        "provinceId": "busan",
        "areaHa": 526
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 525
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 446.2
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 356.6
      },
      {
        "provinceId": "gwangju",
        "areaHa": 79.2
      },
      {
        "provinceId": "incheon",
        "areaHa": 67.6
      },
      {
        "provinceId": "daegu",
        "areaHa": 64.9
      },
      {
        "provinceId": "sejong",
        "areaHa": 32.4
      },
      {
        "provinceId": "jeju",
        "areaHa": 31.9
      },
      {
        "provinceId": "ulsan",
        "areaHa": 23.3
      },
      {
        "provinceId": "daejeon",
        "areaHa": 11.6
      },
      {
        "provinceId": "seoul",
        "areaHa": 10.8
      }
    ]
  },
  "apple": {
    "year": 2025,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "사과:면적",
    "totalHa": 33211.6,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 19101.7
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 3756.9
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 3610.9
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 2236.1
      },
      {
        "provinceId": "gangwon",
        "areaHa": 1953
      },
      {
        "provinceId": "chungnam",
        "areaHa": 1390.8
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 464.5
      },
      {
        "provinceId": "daegu",
        "areaHa": 375.4
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 210.1
      },
      {
        "provinceId": "ulsan",
        "areaHa": 40.8
      },
      {
        "provinceId": "incheon",
        "areaHa": 24.7
      },
      {
        "provinceId": "daejeon",
        "areaHa": 20.3
      },
      {
        "provinceId": "sejong",
        "areaHa": 15.1
      },
      {
        "provinceId": "busan",
        "areaHa": 7
      },
      {
        "provinceId": "gwangju",
        "areaHa": 4
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.1
      },
      {
        "provinceId": "jeju",
        "areaHa": 0.1
      }
    ]
  },
  "pear": {
    "year": 2025,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "배:면적",
    "totalHa": 9315.7,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 2735.3
      },
      {
        "provinceId": "chungnam",
        "areaHa": 2037.5
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1362.8
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 969
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 859.6
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 469.7
      },
      {
        "provinceId": "ulsan",
        "areaHa": 398.6
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 162.2
      },
      {
        "provinceId": "gangwon",
        "areaHa": 115.3
      },
      {
        "provinceId": "sejong",
        "areaHa": 73.9
      },
      {
        "provinceId": "daejeon",
        "areaHa": 40.8
      },
      {
        "provinceId": "incheon",
        "areaHa": 31.2
      },
      {
        "provinceId": "gwangju",
        "areaHa": 24.2
      },
      {
        "provinceId": "busan",
        "areaHa": 19.5
      },
      {
        "provinceId": "daegu",
        "areaHa": 10.7
      },
      {
        "provinceId": "seoul",
        "areaHa": 5.2
      },
      {
        "provinceId": "jeju",
        "areaHa": 0.2
      }
    ]
  },
  "peach": {
    "year": 2024,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "복숭아:면적",
    "totalHa": 20294.1,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 10251.8
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 4516.5
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 1136.9
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 922.9
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 885.5
      },
      {
        "provinceId": "gangwon",
        "areaHa": 751.4
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 566.5
      },
      {
        "provinceId": "daegu",
        "areaHa": 452.5
      },
      {
        "provinceId": "sejong",
        "areaHa": 446.7
      },
      {
        "provinceId": "chungnam",
        "areaHa": 242.4
      },
      {
        "provinceId": "daejeon",
        "areaHa": 46.9
      },
      {
        "provinceId": "ulsan",
        "areaHa": 39.6
      },
      {
        "provinceId": "gwangju",
        "areaHa": 17.7
      },
      {
        "provinceId": "busan",
        "areaHa": 11.8
      },
      {
        "provinceId": "incheon",
        "areaHa": 4.1
      },
      {
        "provinceId": "jeju",
        "areaHa": 0.7
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.1
      }
    ]
  },
  "grape": {
    "year": 2024,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "포도:면적",
    "totalHa": 14648.7,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 8206.4
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 1856.1
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1406.8
      },
      {
        "provinceId": "chungnam",
        "areaHa": 950.4
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 832.1
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 418.1
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 304.2
      },
      {
        "provinceId": "gangwon",
        "areaHa": 226.8
      },
      {
        "provinceId": "daegu",
        "areaHa": 134.7
      },
      {
        "provinceId": "daejeon",
        "areaHa": 97.7
      },
      {
        "provinceId": "incheon",
        "areaHa": 79.5
      },
      {
        "provinceId": "jeju",
        "areaHa": 58.7
      },
      {
        "provinceId": "sejong",
        "areaHa": 47
      },
      {
        "provinceId": "busan",
        "areaHa": 16.4
      },
      {
        "provinceId": "ulsan",
        "areaHa": 8.4
      },
      {
        "provinceId": "gwangju",
        "areaHa": 5.4
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.1
      }
    ]
  },
  "citrus": {
    "year": 2024,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "감귤:면적",
    "totalHa": 21950.9,
    "provinces": [
      {
        "provinceId": "jeju",
        "areaHa": 21775.7
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 120.1
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 17.3
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 13.9
      },
      {
        "provinceId": "chungnam",
        "areaHa": 12.4
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 11.5
      },
      {
        "provinceId": "seoul",
        "areaHa": 0
      },
      {
        "provinceId": "incheon",
        "areaHa": 0
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 0
      },
      {
        "provinceId": "gangwon",
        "areaHa": 0
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 0
      },
      {
        "provinceId": "sejong",
        "areaHa": 0
      },
      {
        "provinceId": "daejeon",
        "areaHa": 0
      },
      {
        "provinceId": "gwangju",
        "areaHa": 0
      },
      {
        "provinceId": "busan",
        "areaHa": 0
      },
      {
        "provinceId": "daegu",
        "areaHa": 0
      },
      {
        "provinceId": "ulsan",
        "areaHa": 0
      }
    ]
  },
  "persimmon": {
    "year": 2024,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "감:면적",
    "totalHa": 21961.8,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "areaHa": 8682.3
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 5159
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 4989.3
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 1040.4
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 521.3
      },
      {
        "provinceId": "chungnam",
        "areaHa": 411.5
      },
      {
        "provinceId": "ulsan",
        "areaHa": 296.7
      },
      {
        "provinceId": "gangwon",
        "areaHa": 270.8
      },
      {
        "provinceId": "gwangju",
        "areaHa": 211
      },
      {
        "provinceId": "daegu",
        "areaHa": 177.5
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 57.5
      },
      {
        "provinceId": "daejeon",
        "areaHa": 42.9
      },
      {
        "provinceId": "busan",
        "areaHa": 35.9
      },
      {
        "provinceId": "incheon",
        "areaHa": 26.4
      },
      {
        "provinceId": "jeju",
        "areaHa": 24.5
      },
      {
        "provinceId": "sejong",
        "areaHa": 12.7
      },
      {
        "provinceId": "seoul",
        "areaHa": 2
      }
    ]
  },
  "plum": {
    "year": 2024,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "자두:면적",
    "totalHa": 6220.5,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 4362.5
      },
      {
        "provinceId": "daegu",
        "areaHa": 555.6
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 461
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 368.9
      },
      {
        "provinceId": "gangwon",
        "areaHa": 109.8
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 89
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 85.4
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 75.4
      },
      {
        "provinceId": "chungnam",
        "areaHa": 46.1
      },
      {
        "provinceId": "sejong",
        "areaHa": 25.4
      },
      {
        "provinceId": "ulsan",
        "areaHa": 16.5
      },
      {
        "provinceId": "daejeon",
        "areaHa": 13.4
      },
      {
        "provinceId": "busan",
        "areaHa": 9.3
      },
      {
        "provinceId": "gwangju",
        "areaHa": 0.8
      },
      {
        "provinceId": "jeju",
        "areaHa": 0.8
      },
      {
        "provinceId": "incheon",
        "areaHa": 0.6
      },
      {
        "provinceId": "seoul",
        "areaHa": 0
      }
    ]
  },
  "maesil": {
    "year": 2024,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "매실:면적",
    "totalHa": 5566.4,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 2416.3
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 1096.7
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 409.2
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 292
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 248.4
      },
      {
        "provinceId": "chungnam",
        "areaHa": 245.4
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 163.8
      },
      {
        "provinceId": "gangwon",
        "areaHa": 115.5
      },
      {
        "provinceId": "ulsan",
        "areaHa": 113.1
      },
      {
        "provinceId": "incheon",
        "areaHa": 96.2
      },
      {
        "provinceId": "gwangju",
        "areaHa": 95.4
      },
      {
        "provinceId": "busan",
        "areaHa": 68.9
      },
      {
        "provinceId": "daegu",
        "areaHa": 68.4
      },
      {
        "provinceId": "daejeon",
        "areaHa": 62.1
      },
      {
        "provinceId": "jeju",
        "areaHa": 55.2
      },
      {
        "provinceId": "sejong",
        "areaHa": 14.3
      },
      {
        "provinceId": "seoul",
        "areaHa": 5.5
      }
    ]
  }
};
