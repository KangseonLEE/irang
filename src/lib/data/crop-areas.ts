/**
 * 작물별 시·도 재배면적 — 국가데이터처 KOSIS 농작물생산조사 (scripts/collect-crop-areas.ts 가 생성, 손으로 고치지 않는다)
 *
 * 작물마다 표 하나·면적 항목 하나(crop-area-tables.ts), 수집 때 항목 이름·단위(ha)·시·도 코드↔이름·시·도 합 = 전국을 확인했다.
 * 수집일: 2026-11-05
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
    "year": 2025,
    "tblId": "DT_1ET0026",
    "tableName": "서류생산량(생서)",
    "itemName": "고구마:면적",
    "totalHa": 17434.5,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 5099.8
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 3394.6
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 2490.1
      },
      {
        "provinceId": "chungnam",
        "areaHa": 2027
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1100
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 1083.4
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 924.4
      },
      {
        "provinceId": "incheon",
        "areaHa": 478.1
      },
      {
        "provinceId": "gangwon",
        "areaHa": 405.9
      },
      {
        "provinceId": "ulsan",
        "areaHa": 113.5
      },
      {
        "provinceId": "daegu",
        "areaHa": 78.4
      },
      {
        "provinceId": "daejeon",
        "areaHa": 68.3
      },
      {
        "provinceId": "gwangju",
        "areaHa": 64.5
      },
      {
        "provinceId": "sejong",
        "areaHa": 40.3
      },
      {
        "provinceId": "busan",
        "areaHa": 30.5
      },
      {
        "provinceId": "jeju",
        "areaHa": 24.4
      },
      {
        "provinceId": "seoul",
        "areaHa": 11.3
      }
    ]
  },
  "potato": {
    "year": 2025,
    "tblId": "DT_1ET0026",
    "tableName": "서류생산량(생서)",
    "itemName": "감자:면적",
    "totalHa": 21528.4,
    "provinces": [
      {
        "provinceId": "gangwon",
        "areaHa": 5384.3
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 2796.4
      },
      {
        "provinceId": "chungnam",
        "areaHa": 2606.6
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 2265.6
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 2066.1
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 1769.1
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1425.1
      },
      {
        "provinceId": "jeju",
        "areaHa": 1364.1
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 1147.5
      },
      {
        "provinceId": "daegu",
        "areaHa": 261.8
      },
      {
        "provinceId": "incheon",
        "areaHa": 151.9
      },
      {
        "provinceId": "ulsan",
        "areaHa": 98.9
      },
      {
        "provinceId": "sejong",
        "areaHa": 70.7
      },
      {
        "provinceId": "daejeon",
        "areaHa": 47.2
      },
      {
        "provinceId": "busan",
        "areaHa": 43.7
      },
      {
        "provinceId": "gwangju",
        "areaHa": 21.4
      },
      {
        "provinceId": "seoul",
        "areaHa": 8.2
      }
    ]
  },
  "corn": {
    "year": 2025,
    "tblId": "DT_1ET0024",
    "tableName": "잡곡생산량",
    "itemName": "옥수수:면적",
    "totalHa": 15020.2,
    "provinces": [
      {
        "provinceId": "gangwon",
        "areaHa": 5171.1
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 2764.3
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 1708
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1307.2
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1184.5
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 879
      },
      {
        "provinceId": "chungnam",
        "areaHa": 683.1
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 658.6
      },
      {
        "provinceId": "jeju",
        "areaHa": 197.2
      },
      {
        "provinceId": "ulsan",
        "areaHa": 106.3
      },
      {
        "provinceId": "incheon",
        "areaHa": 98.2
      },
      {
        "provinceId": "busan",
        "areaHa": 69.7
      },
      {
        "provinceId": "daegu",
        "areaHa": 69.2
      },
      {
        "provinceId": "gwangju",
        "areaHa": 50.7
      },
      {
        "provinceId": "daejeon",
        "areaHa": 39
      },
      {
        "provinceId": "sejong",
        "areaHa": 27.8
      },
      {
        "provinceId": "seoul",
        "areaHa": 6.5
      }
    ]
  },
  "buckwheat": {
    "year": 2025,
    "tblId": "DT_1ET0024",
    "tableName": "잡곡생산량",
    "itemName": "메밀:면적",
    "totalHa": 3353.9,
    "provinces": [
      {
        "provinceId": "jeju",
        "areaHa": 2791
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 176.4
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 167.7
      },
      {
        "provinceId": "gangwon",
        "areaHa": 103.8
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 34.5
      },
      {
        "provinceId": "chungnam",
        "areaHa": 23.4
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 21.2
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 18.6
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 4.1
      },
      {
        "provinceId": "daegu",
        "areaHa": 3.7
      },
      {
        "provinceId": "daejeon",
        "areaHa": 3.6
      },
      {
        "provinceId": "gwangju",
        "areaHa": 3.1
      },
      {
        "provinceId": "ulsan",
        "areaHa": 2.4
      },
      {
        "provinceId": "incheon",
        "areaHa": 0.4
      },
      {
        "provinceId": "seoul",
        "areaHa": 0
      },
      {
        "provinceId": "sejong",
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
    "year": 2025,
    "tblId": "DT_1ET0293",
    "tableName": "특용작물생산량",
    "itemName": "들깨:면적",
    "totalHa": 35170.4,
    "provinces": [
      {
        "provinceId": "gyeonggi",
        "areaHa": 6486.7
      },
      {
        "provinceId": "chungnam",
        "areaHa": 6293.9
      },
      {
        "provinceId": "gangwon",
        "areaHa": 5101.9
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 4658.6
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 3998.9
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 2875.2
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 2348.3
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 2050.4
      },
      {
        "provinceId": "sejong",
        "areaHa": 292.4
      },
      {
        "provinceId": "incheon",
        "areaHa": 248.9
      },
      {
        "provinceId": "daejeon",
        "areaHa": 234.6
      },
      {
        "provinceId": "ulsan",
        "areaHa": 226.7
      },
      {
        "provinceId": "daegu",
        "areaHa": 221.7
      },
      {
        "provinceId": "gwangju",
        "areaHa": 96.5
      },
      {
        "provinceId": "busan",
        "areaHa": 23.3
      },
      {
        "provinceId": "seoul",
        "areaHa": 11.7
      },
      {
        "provinceId": "jeju",
        "areaHa": 0.8
      }
    ]
  },
  "chili-pepper": {
    "year": 2025,
    "tblId": "DT_1ET0291",
    "tableName": "채소생산량(조미채소)",
    "itemName": "고추:면적",
    "totalHa": 29371.8,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 7483.8
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 4318
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 3146.6
      },
      {
        "provinceId": "gangwon",
        "areaHa": 3064.4
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 2878.2
      },
      {
        "provinceId": "chungnam",
        "areaHa": 2714.3
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 2429.6
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1999.8
      },
      {
        "provinceId": "gwangju",
        "areaHa": 339.5
      },
      {
        "provinceId": "incheon",
        "areaHa": 322.6
      },
      {
        "provinceId": "daegu",
        "areaHa": 198.5
      },
      {
        "provinceId": "ulsan",
        "areaHa": 159.2
      },
      {
        "provinceId": "daejeon",
        "areaHa": 91.4
      },
      {
        "provinceId": "sejong",
        "areaHa": 91.2
      },
      {
        "provinceId": "jeju",
        "areaHa": 67.1
      },
      {
        "provinceId": "busan",
        "areaHa": 52.8
      },
      {
        "provinceId": "seoul",
        "areaHa": 14.8
      }
    ]
  },
  "green-onion": {
    "year": 2025,
    "tblId": "DT_1ET0291",
    "tableName": "채소생산량(조미채소)",
    "itemName": "대파:면적",
    "totalHa": 14366.7,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 4530.7
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 2196.2
      },
      {
        "provinceId": "gangwon",
        "areaHa": 1948.3
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 1214.6
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 1117.3
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1080.9
      },
      {
        "provinceId": "chungnam",
        "areaHa": 571.3
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 482.5
      },
      {
        "provinceId": "busan",
        "areaHa": 464.8
      },
      {
        "provinceId": "jeju",
        "areaHa": 305.3
      },
      {
        "provinceId": "daegu",
        "areaHa": 215.8
      },
      {
        "provinceId": "sejong",
        "areaHa": 119.7
      },
      {
        "provinceId": "incheon",
        "areaHa": 44.2
      },
      {
        "provinceId": "ulsan",
        "areaHa": 43
      },
      {
        "provinceId": "daejeon",
        "areaHa": 15.3
      },
      {
        "provinceId": "seoul",
        "areaHa": 11.2
      },
      {
        "provinceId": "gwangju",
        "areaHa": 5.6
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
    "year": 2025,
    "tblId": "DT_1ET0291",
    "tableName": "채소생산량(조미채소)",
    "itemName": "생강:면적",
    "totalHa": 2301.8,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1032.8
      },
      {
        "provinceId": "chungnam",
        "areaHa": 497.1
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 381.1
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 120.1
      },
      {
        "provinceId": "gangwon",
        "areaHa": 106.3
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 53.1
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 52
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 27
      },
      {
        "provinceId": "daegu",
        "areaHa": 13.3
      },
      {
        "provinceId": "sejong",
        "areaHa": 6.4
      },
      {
        "provinceId": "incheon",
        "areaHa": 5.7
      },
      {
        "provinceId": "gwangju",
        "areaHa": 2.5
      },
      {
        "provinceId": "daejeon",
        "areaHa": 1.7
      },
      {
        "provinceId": "ulsan",
        "areaHa": 1.3
      },
      {
        "provinceId": "busan",
        "areaHa": 0.6
      },
      {
        "provinceId": "jeju",
        "areaHa": 0.4
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
    "year": 2025,
    "tblId": "DT_1ET0028",
    "tableName": "채소생산량(엽채류)",
    "itemName": "배추:면적",
    "totalHa": 32622.3,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 10369
      },
      {
        "provinceId": "gangwon",
        "areaHa": 6693.2
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 4435.9
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 3099.6
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 2635.4
      },
      {
        "provinceId": "chungnam",
        "areaHa": 1777.3
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 1727.2
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 669.7
      },
      {
        "provinceId": "daegu",
        "areaHa": 523.2
      },
      {
        "provinceId": "jeju",
        "areaHa": 184.7
      },
      {
        "provinceId": "gwangju",
        "areaHa": 129.5
      },
      {
        "provinceId": "ulsan",
        "areaHa": 113
      },
      {
        "provinceId": "incheon",
        "areaHa": 95.4
      },
      {
        "provinceId": "sejong",
        "areaHa": 67.1
      },
      {
        "provinceId": "busan",
        "areaHa": 57.1
      },
      {
        "provinceId": "daejeon",
        "areaHa": 36.9
      },
      {
        "provinceId": "seoul",
        "areaHa": 8.2
      }
    ]
  },
  "spinach": {
    "year": 2025,
    "tblId": "DT_1ET0028",
    "tableName": "채소생산량(엽채류)",
    "itemName": "시금치:면적",
    "totalHa": 4852.6,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "areaHa": 1862.6
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1324.5
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 646.8
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 357.2
      },
      {
        "provinceId": "chungnam",
        "areaHa": 251.7
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 125.5
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 91.9
      },
      {
        "provinceId": "incheon",
        "areaHa": 37.5
      },
      {
        "provinceId": "gangwon",
        "areaHa": 35.7
      },
      {
        "provinceId": "daegu",
        "areaHa": 33.7
      },
      {
        "provinceId": "jeju",
        "areaHa": 27.8
      },
      {
        "provinceId": "busan",
        "areaHa": 24.9
      },
      {
        "provinceId": "ulsan",
        "areaHa": 12.9
      },
      {
        "provinceId": "seoul",
        "areaHa": 7.3
      },
      {
        "provinceId": "gwangju",
        "areaHa": 6.2
      },
      {
        "provinceId": "sejong",
        "areaHa": 3.1
      },
      {
        "provinceId": "daejeon",
        "areaHa": 3.1
      }
    ]
  },
  "lettuce": {
    "year": 2025,
    "tblId": "DT_1ET0028",
    "tableName": "채소생산량(엽채류)",
    "itemName": "상추:면적",
    "totalHa": 4164.7,
    "provinces": [
      {
        "provinceId": "jeonbuk",
        "areaHa": 1158.9
      },
      {
        "provinceId": "chungnam",
        "areaHa": 1016.8
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 767.5
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 291
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 237.7
      },
      {
        "provinceId": "gangwon",
        "areaHa": 213.3
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 139.8
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 97
      },
      {
        "provinceId": "busan",
        "areaHa": 75.9
      },
      {
        "provinceId": "incheon",
        "areaHa": 51
      },
      {
        "provinceId": "daegu",
        "areaHa": 29.2
      },
      {
        "provinceId": "ulsan",
        "areaHa": 28.3
      },
      {
        "provinceId": "daejeon",
        "areaHa": 20.7
      },
      {
        "provinceId": "jeju",
        "areaHa": 19.1
      },
      {
        "provinceId": "seoul",
        "areaHa": 11.5
      },
      {
        "provinceId": "gwangju",
        "areaHa": 3.7
      },
      {
        "provinceId": "sejong",
        "areaHa": 3.1
      }
    ]
  },
  "radish": {
    "year": 2025,
    "tblId": "DT_1ET0029",
    "tableName": "채소생산량(근채류)",
    "itemName": "무:면적",
    "totalHa": 20189,
    "provinces": [
      {
        "provinceId": "jeju",
        "areaHa": 6315.9
      },
      {
        "provinceId": "gangwon",
        "areaHa": 3377.8
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 2312.2
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 1842.5
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1741
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1393.4
      },
      {
        "provinceId": "chungnam",
        "areaHa": 1379.9
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 864
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 444.6
      },
      {
        "provinceId": "gwangju",
        "areaHa": 165.4
      },
      {
        "provinceId": "daegu",
        "areaHa": 117.1
      },
      {
        "provinceId": "incheon",
        "areaHa": 60.3
      },
      {
        "provinceId": "busan",
        "areaHa": 48
      },
      {
        "provinceId": "ulsan",
        "areaHa": 44.8
      },
      {
        "provinceId": "daejeon",
        "areaHa": 40.3
      },
      {
        "provinceId": "sejong",
        "areaHa": 37.3
      },
      {
        "provinceId": "seoul",
        "areaHa": 4.4
      }
    ]
  },
  "carrot": {
    "year": 2025,
    "tblId": "DT_1ET0029",
    "tableName": "채소생산량(근채류)",
    "itemName": "당근:면적",
    "totalHa": 3903.8,
    "provinces": [
      {
        "provinceId": "jeju",
        "areaHa": 2053.6
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 889.4
      },
      {
        "provinceId": "gangwon",
        "areaHa": 318.7
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 263.9
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 86.5
      },
      {
        "provinceId": "busan",
        "areaHa": 86.3
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 79.7
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 56.5
      },
      {
        "provinceId": "chungnam",
        "areaHa": 33.1
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 25.6
      },
      {
        "provinceId": "ulsan",
        "areaHa": 4.5
      },
      {
        "provinceId": "incheon",
        "areaHa": 1.9
      },
      {
        "provinceId": "daejeon",
        "areaHa": 1.8
      },
      {
        "provinceId": "daegu",
        "areaHa": 1.4
      },
      {
        "provinceId": "sejong",
        "areaHa": 0.7
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.2
      },
      {
        "provinceId": "gwangju",
        "areaHa": 0.2
      }
    ]
  },
  "watermelon": {
    "year": 2025,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "수박:면적",
    "totalHa": 10506.7,
    "provinces": [
      {
        "provinceId": "jeonbuk",
        "areaHa": 2193.3
      },
      {
        "provinceId": "chungnam",
        "areaHa": 2134.8
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 1938.7
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 1297.8
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1288.5
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 435.7
      },
      {
        "provinceId": "daegu",
        "areaHa": 322.1
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 297.8
      },
      {
        "provinceId": "gangwon",
        "areaHa": 271.7
      },
      {
        "provinceId": "jeju",
        "areaHa": 198.9
      },
      {
        "provinceId": "sejong",
        "areaHa": 51.9
      },
      {
        "provinceId": "gwangju",
        "areaHa": 40.2
      },
      {
        "provinceId": "ulsan",
        "areaHa": 16
      },
      {
        "provinceId": "incheon",
        "areaHa": 10.2
      },
      {
        "provinceId": "busan",
        "areaHa": 6.5
      },
      {
        "provinceId": "daejeon",
        "areaHa": 2.4
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.2
      }
    ]
  },
  "melon": {
    "year": 2025,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "참외:면적",
    "totalHa": 4664.1,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 4293.8
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 122.1
      },
      {
        "provinceId": "daegu",
        "areaHa": 67
      },
      {
        "provinceId": "chungnam",
        "areaHa": 37.7
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 28.6
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 26.5
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 25.1
      },
      {
        "provinceId": "gangwon",
        "areaHa": 24
      },
      {
        "provinceId": "incheon",
        "areaHa": 13.6
      },
      {
        "provinceId": "ulsan",
        "areaHa": 7.8
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 6
      },
      {
        "provinceId": "jeju",
        "areaHa": 3.9
      },
      {
        "provinceId": "busan",
        "areaHa": 3.2
      },
      {
        "provinceId": "daejeon",
        "areaHa": 2.1
      },
      {
        "provinceId": "sejong",
        "areaHa": 1.5
      },
      {
        "provinceId": "gwangju",
        "areaHa": 0.7
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.4
      }
    ]
  },
  "strawberry": {
    "year": 2025,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "딸기:면적",
    "totalHa": 5518.5,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "areaHa": 2604.3
      },
      {
        "provinceId": "chungnam",
        "areaHa": 957.2
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 539.4
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 488.4
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 454.2
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 173.3
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 123
      },
      {
        "provinceId": "jeju",
        "areaHa": 38.9
      },
      {
        "provinceId": "gangwon",
        "areaHa": 38.1
      },
      {
        "provinceId": "gwangju",
        "areaHa": 29.3
      },
      {
        "provinceId": "sejong",
        "areaHa": 24.1
      },
      {
        "provinceId": "daejeon",
        "areaHa": 21.4
      },
      {
        "provinceId": "daegu",
        "areaHa": 13.9
      },
      {
        "provinceId": "ulsan",
        "areaHa": 8.3
      },
      {
        "provinceId": "incheon",
        "areaHa": 4.2
      },
      {
        "provinceId": "busan",
        "areaHa": 0.5
      },
      {
        "provinceId": "seoul",
        "areaHa": 0
      }
    ]
  },
  "cucumber": {
    "year": 2025,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "오이:면적",
    "totalHa": 4648.4,
    "provinces": [
      {
        "provinceId": "chungnam",
        "areaHa": 1084.4
      },
      {
        "provinceId": "gangwon",
        "areaHa": 837.1
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 594
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 555.4
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 529.9
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 303.6
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 230.7
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 179.1
      },
      {
        "provinceId": "daegu",
        "areaHa": 107.1
      },
      {
        "provinceId": "sejong",
        "areaHa": 69
      },
      {
        "provinceId": "jeju",
        "areaHa": 55.5
      },
      {
        "provinceId": "daejeon",
        "areaHa": 33.9
      },
      {
        "provinceId": "incheon",
        "areaHa": 27
      },
      {
        "provinceId": "ulsan",
        "areaHa": 15
      },
      {
        "provinceId": "busan",
        "areaHa": 11.2
      },
      {
        "provinceId": "seoul",
        "areaHa": 8.4
      },
      {
        "provinceId": "gwangju",
        "areaHa": 7.3
      }
    ]
  },
  "zucchini": {
    "year": 2025,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "호박:면적",
    "totalHa": 10560.1,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 1682.5
      },
      {
        "provinceId": "jeju",
        "areaHa": 1577.7
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 1438.1
      },
      {
        "provinceId": "gangwon",
        "areaHa": 1327.2
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1225.2
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 1215
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 839.8
      },
      {
        "provinceId": "chungnam",
        "areaHa": 609.2
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 350.1
      },
      {
        "provinceId": "ulsan",
        "areaHa": 92.2
      },
      {
        "provinceId": "daegu",
        "areaHa": 51.8
      },
      {
        "provinceId": "busan",
        "areaHa": 31.3
      },
      {
        "provinceId": "daejeon",
        "areaHa": 31.1
      },
      {
        "provinceId": "incheon",
        "areaHa": 30.3
      },
      {
        "provinceId": "sejong",
        "areaHa": 29.3
      },
      {
        "provinceId": "gwangju",
        "areaHa": 24.8
      },
      {
        "provinceId": "seoul",
        "areaHa": 4.4
      }
    ]
  },
  "tomato": {
    "year": 2025,
    "tblId": "DT_1ET0027",
    "tableName": "채소생산량(과채류)",
    "itemName": "토마토:면적",
    "totalHa": 6193.1,
    "provinces": [
      {
        "provinceId": "gangwon",
        "areaHa": 1187.8
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 921.4
      },
      {
        "provinceId": "chungnam",
        "areaHa": 855.8
      },
      {
        "provinceId": "busan",
        "areaHa": 612.4
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 559.9
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 481.5
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 451.7
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 400.3
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 343
      },
      {
        "provinceId": "gwangju",
        "areaHa": 131.8
      },
      {
        "provinceId": "daegu",
        "areaHa": 75.1
      },
      {
        "provinceId": "incheon",
        "areaHa": 72.6
      },
      {
        "provinceId": "sejong",
        "areaHa": 32.4
      },
      {
        "provinceId": "jeju",
        "areaHa": 24
      },
      {
        "provinceId": "ulsan",
        "areaHa": 23.1
      },
      {
        "provinceId": "seoul",
        "areaHa": 11.9
      },
      {
        "provinceId": "daejeon",
        "areaHa": 8.3
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
    "year": 2025,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "복숭아:면적",
    "totalHa": 20437.4,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 10204.6
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 4510.8
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 1210.1
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 976.7
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 959.5
      },
      {
        "provinceId": "gangwon",
        "areaHa": 776.5
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 552.1
      },
      {
        "provinceId": "daegu",
        "areaHa": 438.8
      },
      {
        "provinceId": "sejong",
        "areaHa": 399.5
      },
      {
        "provinceId": "chungnam",
        "areaHa": 263.6
      },
      {
        "provinceId": "daejeon",
        "areaHa": 50.6
      },
      {
        "provinceId": "ulsan",
        "areaHa": 42.3
      },
      {
        "provinceId": "gwangju",
        "areaHa": 32.1
      },
      {
        "provinceId": "busan",
        "areaHa": 13.2
      },
      {
        "provinceId": "incheon",
        "areaHa": 5.2
      },
      {
        "provinceId": "jeju",
        "areaHa": 1.4
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.5
      }
    ]
  },
  "grape": {
    "year": 2025,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "포도:면적",
    "totalHa": 14170.9,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 8110.2
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 1822
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 1319.8
      },
      {
        "provinceId": "chungnam",
        "areaHa": 826
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 776.9
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 403.1
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 256.9
      },
      {
        "provinceId": "gangwon",
        "areaHa": 233.4
      },
      {
        "provinceId": "daegu",
        "areaHa": 128.1
      },
      {
        "provinceId": "daejeon",
        "areaHa": 108.7
      },
      {
        "provinceId": "incheon",
        "areaHa": 80.1
      },
      {
        "provinceId": "sejong",
        "areaHa": 42.8
      },
      {
        "provinceId": "jeju",
        "areaHa": 41
      },
      {
        "provinceId": "ulsan",
        "areaHa": 10.5
      },
      {
        "provinceId": "gwangju",
        "areaHa": 7.5
      },
      {
        "provinceId": "busan",
        "areaHa": 3.9
      },
      {
        "provinceId": "seoul",
        "areaHa": 0.1
      }
    ]
  },
  "citrus": {
    "year": 2025,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "감귤:면적",
    "totalHa": 22009.5,
    "provinces": [
      {
        "provinceId": "jeju",
        "areaHa": 21793.4
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 157.7
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 17.3
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 14.4
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 13.8
      },
      {
        "provinceId": "chungnam",
        "areaHa": 12.2
      },
      {
        "provinceId": "daegu",
        "areaHa": 0.7
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
        "provinceId": "ulsan",
        "areaHa": 0
      }
    ]
  },
  "persimmon": {
    "year": 2025,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "감:면적",
    "totalHa": 21805.3,
    "provinces": [
      {
        "provinceId": "gyeongnam",
        "areaHa": 8504.2
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 5168.7
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 4992
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 969.9
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 522.3
      },
      {
        "provinceId": "chungnam",
        "areaHa": 421
      },
      {
        "provinceId": "ulsan",
        "areaHa": 339.6
      },
      {
        "provinceId": "gangwon",
        "areaHa": 264.4
      },
      {
        "provinceId": "gwangju",
        "areaHa": 220.7
      },
      {
        "provinceId": "daegu",
        "areaHa": 190.4
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 62.1
      },
      {
        "provinceId": "daejeon",
        "areaHa": 38.3
      },
      {
        "provinceId": "busan",
        "areaHa": 37.5
      },
      {
        "provinceId": "incheon",
        "areaHa": 32.7
      },
      {
        "provinceId": "jeju",
        "areaHa": 23.5
      },
      {
        "provinceId": "sejong",
        "areaHa": 15.6
      },
      {
        "provinceId": "seoul",
        "areaHa": 2.5
      }
    ]
  },
  "plum": {
    "year": 2025,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "자두:면적",
    "totalHa": 6183.5,
    "provinces": [
      {
        "provinceId": "gyeongbuk",
        "areaHa": 4331.3
      },
      {
        "provinceId": "daegu",
        "areaHa": 568.9
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 457.1
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 359.9
      },
      {
        "provinceId": "gangwon",
        "areaHa": 106.2
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 91.1
      },
      {
        "provinceId": "jeonnam",
        "areaHa": 77.5
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 57.6
      },
      {
        "provinceId": "chungnam",
        "areaHa": 48.6
      },
      {
        "provinceId": "ulsan",
        "areaHa": 29.2
      },
      {
        "provinceId": "busan",
        "areaHa": 24
      },
      {
        "provinceId": "sejong",
        "areaHa": 17.8
      },
      {
        "provinceId": "daejeon",
        "areaHa": 11.8
      },
      {
        "provinceId": "gwangju",
        "areaHa": 0.9
      },
      {
        "provinceId": "incheon",
        "areaHa": 0.8
      },
      {
        "provinceId": "jeju",
        "areaHa": 0.8
      },
      {
        "provinceId": "seoul",
        "areaHa": 0
      }
    ]
  },
  "maesil": {
    "year": 2025,
    "tblId": "DT_1ET0292",
    "tableName": "과실생산량(성과수+미과수)",
    "itemName": "매실:면적",
    "totalHa": 5231.5,
    "provinces": [
      {
        "provinceId": "jeonnam",
        "areaHa": 2298.9
      },
      {
        "provinceId": "gyeongnam",
        "areaHa": 1056
      },
      {
        "provinceId": "gyeonggi",
        "areaHa": 400.5
      },
      {
        "provinceId": "gyeongbuk",
        "areaHa": 257.4
      },
      {
        "provinceId": "jeonbuk",
        "areaHa": 236
      },
      {
        "provinceId": "chungnam",
        "areaHa": 228.7
      },
      {
        "provinceId": "chungbuk",
        "areaHa": 141.6
      },
      {
        "provinceId": "ulsan",
        "areaHa": 105.2
      },
      {
        "provinceId": "gangwon",
        "areaHa": 97.7
      },
      {
        "provinceId": "incheon",
        "areaHa": 85.3
      },
      {
        "provinceId": "gwangju",
        "areaHa": 82.3
      },
      {
        "provinceId": "busan",
        "areaHa": 71.9
      },
      {
        "provinceId": "jeju",
        "areaHa": 57
      },
      {
        "provinceId": "daegu",
        "areaHa": 49.3
      },
      {
        "provinceId": "daejeon",
        "areaHa": 46.4
      },
      {
        "provinceId": "sejong",
        "areaHa": 13.2
      },
      {
        "provinceId": "seoul",
        "areaHa": 4.2
      }
    ]
  }
};
