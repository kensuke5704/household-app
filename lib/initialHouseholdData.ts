import type { HouseholdBudget, HouseholdTransaction } from "@/types/household";

export const initialHouseholdTransactions: Array<Omit<HouseholdTransaction, "id" | "created_at">> = [
  {
    "date": "2026-01-01",
    "type": "income",
    "category": "取崩し",
    "subcategory": "取崩し",
    "amount": 40000,
    "memo": "summary-adjustment"
  },
  {
    "date": "2026-02-01",
    "type": "income",
    "category": "取崩し",
    "subcategory": "取崩し",
    "amount": 40000,
    "memo": "summary-adjustment"
  },
  {
    "date": "2026-03-01",
    "type": "income",
    "category": "取崩し",
    "subcategory": "取崩し",
    "amount": 40000,
    "memo": "summary-adjustment"
  },
  {
    "date": "2026-04-01",
    "type": "income",
    "category": "取崩し",
    "subcategory": "取崩し",
    "amount": 40000,
    "memo": "summary-adjustment"
  },
  {
    "date": "2026-05-01",
    "type": "income",
    "category": "取崩し",
    "subcategory": "取崩し",
    "amount": 40000,
    "memo": "summary-adjustment"
  },
  {
    "date": "2026-06-01",
    "type": "income",
    "category": "取崩し",
    "subcategory": "取崩し",
    "amount": 40000,
    "memo": "summary-adjustment"
  },
  {
    "date": "2026-01-01",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "Nintendo",
    "amount": 306,
    "memo": ""
  },
  {
    "date": "2026-01-01",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "DAZN",
    "amount": 3280,
    "memo": ""
  },
  {
    "date": "2026-01-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "AMAZON PRIME MUSIC",
    "amount": 580,
    "memo": ""
  },
  {
    "date": "2026-01-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "携帯料金ケイタイリョウク",
    "amount": 2974,
    "memo": ""
  },
  {
    "date": "2026-01-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Adobe",
    "amount": 2780,
    "memo": ""
  },
  {
    "date": "2026-01-01",
    "type": "income",
    "category": "その他(収入)",
    "subcategory": "お年玉",
    "amount": 10000,
    "memo": ""
  },
  {
    "date": "2026-01-01",
    "type": "income",
    "category": "その他(収入)",
    "subcategory": "小遣いコヅカイ",
    "amount": 30000,
    "memo": ""
  },
  {
    "date": "2026-01-02",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "香りの蒸留所カオリ",
    "amount": 10900,
    "memo": ""
  },
  {
    "date": "2026-01-02",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "那須サファリパークナスサファリパーク",
    "amount": 10200,
    "memo": ""
  },
  {
    "date": "2026-01-02",
    "type": "income",
    "category": "その他(収入)",
    "subcategory": "cake.jp",
    "amount": 9760,
    "memo": ""
  },
  {
    "date": "2026-01-03",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 261,
    "memo": ""
  },
  {
    "date": "2026-01-03",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 483,
    "memo": ""
  },
  {
    "date": "2026-01-03",
    "type": "expense",
    "category": "食費",
    "subcategory": "Grand Escape",
    "amount": 1650,
    "memo": ""
  },
  {
    "date": "2026-01-03",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 571,
    "memo": ""
  },
  {
    "date": "2026-01-03",
    "type": "expense",
    "category": "被服",
    "subcategory": "むげん堂",
    "amount": 3800,
    "memo": ""
  },
  {
    "date": "2026-01-03",
    "type": "expense",
    "category": "食費",
    "subcategory": "鳥貴族トリキゾク",
    "amount": 2340,
    "memo": ""
  },
  {
    "date": "2026-01-03",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "上島珈琲店ウエ",
    "amount": 820,
    "memo": ""
  },
  {
    "date": "2026-01-03",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 146,
    "memo": ""
  },
  {
    "date": "2026-01-03",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 438,
    "memo": ""
  },
  {
    "date": "2026-01-03",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ホテルスマイル",
    "amount": 3450,
    "memo": ""
  },
  {
    "date": "2026-01-04",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 736,
    "memo": ""
  },
  {
    "date": "2026-01-04",
    "type": "expense",
    "category": "食費",
    "subcategory": "はま紅葉",
    "amount": 1070,
    "memo": ""
  },
  {
    "date": "2026-01-04",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Uni Coffee Roastery",
    "amount": 570,
    "memo": ""
  },
  {
    "date": "2026-01-04",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "サンマルクカフェ",
    "amount": 510,
    "memo": ""
  },
  {
    "date": "2026-01-04",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 474,
    "memo": ""
  },
  {
    "date": "2026-01-04",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-01-04",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-01-05",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-01-05",
    "type": "expense",
    "category": "食費",
    "subcategory": "バーガーキング",
    "amount": 600,
    "memo": ""
  },
  {
    "date": "2026-01-05",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-05",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-01-06",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-01-06",
    "type": "expense",
    "category": "食費",
    "subcategory": "バーガーキング",
    "amount": 600,
    "memo": ""
  },
  {
    "date": "2026-01-06",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-06",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-01-06",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "定期テイキ",
    "amount": 10900,
    "memo": ""
  },
  {
    "date": "2026-01-07",
    "type": "expense",
    "category": "食費",
    "subcategory": "山下本気うどんヤマシタホンキ",
    "amount": 1290,
    "memo": ""
  },
  {
    "date": "2026-01-07",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 208,
    "memo": ""
  },
  {
    "date": "2026-01-07",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 208,
    "memo": ""
  },
  {
    "date": "2026-01-07",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-01-08",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 572,
    "memo": ""
  },
  {
    "date": "2026-01-08",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-09",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 397,
    "memo": ""
  },
  {
    "date": "2026-01-11",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 140,
    "memo": ""
  },
  {
    "date": "2026-01-11",
    "type": "expense",
    "category": "食費",
    "subcategory": "チョップス",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-01-11",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 227,
    "memo": ""
  },
  {
    "date": "2026-01-11",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 140,
    "memo": ""
  },
  {
    "date": "2026-01-11",
    "type": "expense",
    "category": "被服",
    "subcategory": "オカダヤオカダヤ",
    "amount": 1870,
    "memo": ""
  },
  {
    "date": "2026-01-11",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-01-11",
    "type": "expense",
    "category": "食費",
    "subcategory": "同窓会ドウソウカイ",
    "amount": 6306,
    "memo": ""
  },
  {
    "date": "2026-01-12",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "noi",
    "amount": 12500,
    "memo": ""
  },
  {
    "date": "2026-01-12",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-13",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 464,
    "memo": ""
  },
  {
    "date": "2026-01-13",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-14",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 594,
    "memo": ""
  },
  {
    "date": "2026-01-14",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "出産祝いシュッサn",
    "amount": 15840,
    "memo": ""
  },
  {
    "date": "2026-01-14",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-15",
    "type": "income",
    "category": "給与",
    "subcategory": "個別指導学院トウキョウガク",
    "amount": 88650,
    "memo": ""
  },
  {
    "date": "2026-01-15",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 798,
    "memo": ""
  },
  {
    "date": "2026-01-15",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-16",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 537,
    "memo": ""
  },
  {
    "date": "2026-01-16",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-17",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 2720,
    "memo": ""
  },
  {
    "date": "2026-01-17",
    "type": "expense",
    "category": "食費",
    "subcategory": "共栄ラーメンキョウエイ",
    "amount": 1440,
    "memo": ""
  },
  {
    "date": "2026-01-17",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "チーズガーデン",
    "amount": 1230,
    "memo": ""
  },
  {
    "date": "2026-01-17",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "チーズガーデン",
    "amount": 600,
    "memo": ""
  },
  {
    "date": "2026-01-17",
    "type": "expense",
    "category": "食費",
    "subcategory": "ガスト",
    "amount": 999,
    "memo": ""
  },
  {
    "date": "2026-01-18",
    "type": "expense",
    "category": "食費",
    "subcategory": "油組アブラ",
    "amount": 880,
    "memo": ""
  },
  {
    "date": "2026-01-18",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "アットコンタクト",
    "amount": 13596,
    "memo": ""
  },
  {
    "date": "2026-01-19",
    "type": "expense",
    "category": "食費",
    "subcategory": "学食ガクショク",
    "amount": 500,
    "memo": ""
  },
  {
    "date": "2026-01-19",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-20",
    "type": "expense",
    "category": "食費",
    "subcategory": "学食ガクショク",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-01-20",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-21",
    "type": "expense",
    "category": "食費",
    "subcategory": "油堂アブラ",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-01-21",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-22",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 537,
    "memo": ""
  },
  {
    "date": "2026-01-22",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-23",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 594,
    "memo": ""
  },
  {
    "date": "2026-01-23",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-24",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 580,
    "memo": ""
  },
  {
    "date": "2026-01-24",
    "type": "expense",
    "category": "食費",
    "subcategory": "鶏ヤロートリ",
    "amount": 1200,
    "memo": ""
  },
  {
    "date": "2026-01-24",
    "type": "expense",
    "category": "食費",
    "subcategory": "ちばチャン",
    "amount": 2000,
    "memo": ""
  },
  {
    "date": "2026-01-24",
    "type": "expense",
    "category": "食費",
    "subcategory": "めだか",
    "amount": 1200,
    "memo": ""
  },
  {
    "date": "2026-01-25",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "K.Base Coffee",
    "amount": 450,
    "memo": ""
  },
  {
    "date": "2026-01-25",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 140,
    "memo": ""
  },
  {
    "date": "2026-01-25",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "上島珈琲店ウエ",
    "amount": 900,
    "memo": ""
  },
  {
    "date": "2026-01-25",
    "type": "expense",
    "category": "食費",
    "subcategory": "燻し屋もっくんイブシヤ ヤ",
    "amount": 2684,
    "memo": ""
  },
  {
    "date": "2026-01-25",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 167,
    "memo": ""
  },
  {
    "date": "2026-01-26",
    "type": "expense",
    "category": "食費",
    "subcategory": "コメダ珈琲店",
    "amount": 1010,
    "memo": ""
  },
  {
    "date": "2026-01-26",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-27",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 941,
    "memo": ""
  },
  {
    "date": "2026-01-27",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-28",
    "type": "expense",
    "category": "食費",
    "subcategory": "鳳仙花ホウセンカ",
    "amount": 900,
    "memo": ""
  },
  {
    "date": "2026-01-28",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-01-29",
    "type": "expense",
    "category": "食費",
    "subcategory": "みつぼし",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-01-29",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ガウディ展テン",
    "amount": 1210,
    "memo": ""
  },
  {
    "date": "2026-01-29",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-30",
    "type": "expense",
    "category": "食費",
    "subcategory": "バーミヤン",
    "amount": 1200,
    "memo": ""
  },
  {
    "date": "2026-01-30",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Maison Margiera",
    "amount": 79200,
    "memo": ""
  },
  {
    "date": "2026-01-30",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-01-31",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 2720,
    "memo": ""
  },
  {
    "date": "2026-01-31",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "自動販売機ジドウ",
    "amount": 130,
    "memo": ""
  },
  {
    "date": "2026-01-31",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 1500,
    "memo": ""
  },
  {
    "date": "2026-01-31",
    "type": "expense",
    "category": "食費",
    "subcategory": "KANEL BREAD",
    "amount": 1777,
    "memo": ""
  },
  {
    "date": "2026-01-31",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "バス",
    "amount": 780,
    "memo": ""
  },
  {
    "date": "2026-01-31",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "那須サファリパークナスサファリプ",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-01-31",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "SHOZO CAFE",
    "amount": 1130,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "Nintendo",
    "amount": 306,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "DAZN",
    "amount": 3280,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "AMAZON PRIME MUSIC",
    "amount": 580,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "携帯料金ケイタイリョウク",
    "amount": 2974,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Adobe",
    "amount": 2780,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "バス",
    "amount": 230,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "食費",
    "subcategory": "卯三郎ウサブロウ",
    "amount": 1200,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "バス",
    "amount": 700,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 990,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "スターバックス",
    "amount": 800,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "食費",
    "subcategory": "宇味屋ウツノミヤ👅ヤ",
    "amount": 955,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "来らっせクル",
    "amount": 600,
    "memo": ""
  },
  {
    "date": "2026-02-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 1980,
    "memo": ""
  },
  {
    "date": "2026-02-02",
    "type": "expense",
    "category": "食費",
    "subcategory": "学食ガクショク",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-02-02",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 300,
    "memo": ""
  },
  {
    "date": "2026-02-03",
    "type": "expense",
    "category": "食費",
    "subcategory": "山下本気うどんヤマシタ",
    "amount": 1680,
    "memo": ""
  },
  {
    "date": "2026-02-04",
    "type": "expense",
    "category": "食費",
    "subcategory": "三田製麺所ミタセイ",
    "amount": 1200,
    "memo": ""
  },
  {
    "date": "2026-02-05",
    "type": "expense",
    "category": "食費",
    "subcategory": "スシロー",
    "amount": 3000,
    "memo": ""
  },
  {
    "date": "2026-02-05",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-02-06",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "上島珈琲店ウエ",
    "amount": 710,
    "memo": ""
  },
  {
    "date": "2026-02-08",
    "type": "expense",
    "category": "食費",
    "subcategory": "流川ルカワ",
    "amount": 1250,
    "memo": ""
  },
  {
    "date": "2026-02-08",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-02-09",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-09",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 208,
    "memo": ""
  },
  {
    "date": "2026-02-09",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 208,
    "memo": ""
  },
  {
    "date": "2026-02-09",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-10",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-10",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 208,
    "memo": ""
  },
  {
    "date": "2026-02-10",
    "type": "expense",
    "category": "食費",
    "subcategory": "すき家",
    "amount": 700,
    "memo": ""
  },
  {
    "date": "2026-02-10",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-10",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 208,
    "memo": ""
  },
  {
    "date": "2026-02-11",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "スターバックス",
    "amount": 570,
    "memo": ""
  },
  {
    "date": "2026-02-12",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-12",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 208,
    "memo": ""
  },
  {
    "date": "2026-02-12",
    "type": "expense",
    "category": "食費",
    "subcategory": "すき家",
    "amount": 710,
    "memo": ""
  },
  {
    "date": "2026-02-12",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-12",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 208,
    "memo": ""
  },
  {
    "date": "2026-02-12",
    "type": "income",
    "category": "給与",
    "subcategory": "三洋警備保障サンヨ",
    "amount": 15460,
    "memo": ""
  },
  {
    "date": "2026-02-13",
    "type": "income",
    "category": "給与",
    "subcategory": "個別指導学院コベテゥシドウ",
    "amount": 92252,
    "memo": ""
  },
  {
    "date": "2026-02-13",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-13",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 208,
    "memo": ""
  },
  {
    "date": "2026-02-13",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 572,
    "memo": ""
  },
  {
    "date": "2026-02-13",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "自動販売機ジドウ",
    "amount": 110,
    "memo": ""
  },
  {
    "date": "2026-02-13",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-13",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 208,
    "memo": ""
  },
  {
    "date": "2026-02-14",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 483,
    "memo": ""
  },
  {
    "date": "2026-02-14",
    "type": "expense",
    "category": "食費",
    "subcategory": "豚山ブタ",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-02-14",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 350,
    "memo": ""
  },
  {
    "date": "2026-02-14",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "まねきねこ",
    "amount": 2208,
    "memo": ""
  },
  {
    "date": "2026-02-14",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "スターバックス",
    "amount": 520,
    "memo": ""
  },
  {
    "date": "2026-02-14",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-14",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ニュー埼玉",
    "amount": 6500,
    "memo": ""
  },
  {
    "date": "2026-02-14",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 369,
    "memo": ""
  },
  {
    "date": "2026-02-15",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 318,
    "memo": ""
  },
  {
    "date": "2026-02-15",
    "type": "expense",
    "category": "食費",
    "subcategory": "ブルックリンパーラー",
    "amount": 2860,
    "memo": ""
  },
  {
    "date": "2026-02-16",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-16",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 321,
    "memo": ""
  },
  {
    "date": "2026-02-16",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-16",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "OPEN AI",
    "amount": 876,
    "memo": ""
  },
  {
    "date": "2026-02-17",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-17",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-18",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-18",
    "type": "expense",
    "category": "食費",
    "subcategory": "ケバブ",
    "amount": 950,
    "memo": ""
  },
  {
    "date": "2026-02-18",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-19",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-19",
    "type": "expense",
    "category": "食費",
    "subcategory": "MOM'S TOUCH",
    "amount": 950,
    "memo": ""
  },
  {
    "date": "2026-02-19",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "差し入れサシイレ",
    "amount": 300,
    "memo": ""
  },
  {
    "date": "2026-02-19",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-02-20",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 796,
    "memo": ""
  },
  {
    "date": "2026-02-20",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-02-22",
    "type": "expense",
    "category": "食費",
    "subcategory": "油党アブラトウ",
    "amount": 2130,
    "memo": ""
  },
  {
    "date": "2026-02-22",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "1日乗車券ニティ",
    "amount": 2000,
    "memo": ""
  },
  {
    "date": "2026-02-22",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-02-22",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-02-22",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 318,
    "memo": ""
  },
  {
    "date": "2026-02-22",
    "type": "expense",
    "category": "食費",
    "subcategory": "ステーキくに",
    "amount": 3170,
    "memo": ""
  },
  {
    "date": "2026-02-22",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-02-22",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 318,
    "memo": ""
  },
  {
    "date": "2026-02-23",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-02-24",
    "type": "expense",
    "category": "食費",
    "subcategory": "銀だこギンダ",
    "amount": 1250,
    "memo": ""
  },
  {
    "date": "2026-02-24",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-02-25",
    "type": "expense",
    "category": "食費",
    "subcategory": "くろ渦ウズ",
    "amount": 950,
    "memo": ""
  },
  {
    "date": "2026-02-26",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-02-26",
    "type": "expense",
    "category": "食費",
    "subcategory": "焼肉ライクヤキニク",
    "amount": 890,
    "memo": ""
  },
  {
    "date": "2026-02-26",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 300,
    "memo": ""
  },
  {
    "date": "2026-02-27",
    "type": "expense",
    "category": "食費",
    "subcategory": "ゼッテリア",
    "amount": 690,
    "memo": ""
  },
  {
    "date": "2026-02-27",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "DAZN",
    "amount": 3280,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "AMAZON PRIME",
    "amount": 300,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "AMAZON PRIME MUSIC",
    "amount": 580,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "携帯料金ケイタイリョウク",
    "amount": 2974,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Adobe",
    "amount": 2780,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Chat GPT",
    "amount": 3000,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Duolingo",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "income",
    "category": "その他(収入)",
    "subcategory": "小遣いコヅカイ",
    "amount": 30000,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 167,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 167,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "食費",
    "subcategory": "シェイキーズ",
    "amount": 2400,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 167,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "suzu cafe jinnan",
    "amount": 1300,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "サンマルクカフェ",
    "amount": 320,
    "memo": ""
  },
  {
    "date": "2026-03-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 167,
    "memo": ""
  },
  {
    "date": "2026-03-02",
    "type": "expense",
    "category": "食費",
    "subcategory": "カプリチョーザ",
    "amount": 1430,
    "memo": ""
  },
  {
    "date": "2026-03-02",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "上島珈琲店ウエシム",
    "amount": 680,
    "memo": ""
  },
  {
    "date": "2026-03-03",
    "type": "expense",
    "category": "食費",
    "subcategory": "日高屋ヒダカ",
    "amount": 810,
    "memo": ""
  },
  {
    "date": "2026-03-03",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-03-03",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 227,
    "memo": ""
  },
  {
    "date": "2026-03-03",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "LINE",
    "amount": 150,
    "memo": ""
  },
  {
    "date": "2026-03-04",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 117,
    "memo": ""
  },
  {
    "date": "2026-03-05",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 708,
    "memo": ""
  },
  {
    "date": "2026-03-05",
    "type": "expense",
    "category": "食費",
    "subcategory": "御殿場アウトレット",
    "amount": 500,
    "memo": ""
  },
  {
    "date": "2026-03-05",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ゴンチャ",
    "amount": 760,
    "memo": ""
  },
  {
    "date": "2026-03-05",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "アルル",
    "amount": 450,
    "memo": ""
  },
  {
    "date": "2026-03-05",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "マクドナルド",
    "amount": 390,
    "memo": ""
  },
  {
    "date": "2026-03-05",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "とりいちず",
    "amount": 1519,
    "memo": ""
  },
  {
    "date": "2026-03-05",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "めだか",
    "amount": 1340,
    "memo": ""
  },
  {
    "date": "2026-03-07",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 140,
    "memo": ""
  },
  {
    "date": "2026-03-07",
    "type": "expense",
    "category": "被服",
    "subcategory": "オカダヤ",
    "amount": 4092,
    "memo": ""
  },
  {
    "date": "2026-03-07",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 167,
    "memo": ""
  },
  {
    "date": "2026-03-08",
    "type": "expense",
    "category": "食費",
    "subcategory": "五神製作所5️⃣",
    "amount": 1300,
    "memo": ""
  },
  {
    "date": "2026-03-08",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "サンマルクカフェ",
    "amount": 590,
    "memo": ""
  },
  {
    "date": "2026-03-08",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-03-08",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "スターバックス",
    "amount": 460,
    "memo": ""
  },
  {
    "date": "2026-03-08",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-03-08",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "自動販売機ジドウ",
    "amount": 130,
    "memo": ""
  },
  {
    "date": "2026-03-08",
    "type": "expense",
    "category": "食費",
    "subcategory": "晩杯屋バンパイヤ",
    "amount": 1300,
    "memo": ""
  },
  {
    "date": "2026-03-08",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 216,
    "memo": ""
  },
  {
    "date": "2026-03-08",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "まねきねこ",
    "amount": 2640,
    "memo": ""
  },
  {
    "date": "2026-03-11",
    "type": "income",
    "category": "給与",
    "subcategory": "個別指導学院コベテゥ",
    "amount": 31931,
    "memo": ""
  },
  {
    "date": "2026-03-11",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "スターバックス",
    "amount": 510,
    "memo": ""
  },
  {
    "date": "2026-03-11",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-03-11",
    "type": "expense",
    "category": "食費",
    "subcategory": "鳥貴族トリキゾク",
    "amount": 5000,
    "memo": ""
  },
  {
    "date": "2026-03-11",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-03-11",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Anker",
    "amount": 6990,
    "memo": ""
  },
  {
    "date": "2026-03-12",
    "type": "expense",
    "category": "食費",
    "subcategory": "ゆず庵",
    "amount": 5000,
    "memo": ""
  },
  {
    "date": "2026-03-14",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "DAISO",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-03-15",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 209,
    "memo": ""
  },
  {
    "date": "2026-03-15",
    "type": "expense",
    "category": "食費",
    "subcategory": "幸楽苑コウラクエn",
    "amount": 1105,
    "memo": ""
  },
  {
    "date": "2026-03-15",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 209,
    "memo": ""
  },
  {
    "date": "2026-03-15",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "タリーズ",
    "amount": 595,
    "memo": ""
  },
  {
    "date": "2026-03-15",
    "type": "expense",
    "category": "食費",
    "subcategory": "テング酒場",
    "amount": 1969,
    "memo": ""
  },
  {
    "date": "2026-03-15",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "材料費ZAIRYO",
    "amount": 1603,
    "memo": ""
  },
  {
    "date": "2026-03-17",
    "type": "expense",
    "category": "食費",
    "subcategory": "三和サンワ",
    "amount": 600,
    "memo": ""
  },
  {
    "date": "2026-03-17",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-03-18",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-03-18",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 209,
    "memo": ""
  },
  {
    "date": "2026-03-18",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 199,
    "memo": ""
  },
  {
    "date": "2026-03-18",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-03-20",
    "type": "expense",
    "category": "食費",
    "subcategory": "麺屋 翔メンヤ ショウ",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-03-20",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-03-21",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 322,
    "memo": ""
  },
  {
    "date": "2026-03-21",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドンキホーテ",
    "amount": 322,
    "memo": ""
  },
  {
    "date": "2026-03-21",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "成銀丸ナリ ギnマル",
    "amount": 10500,
    "memo": ""
  },
  {
    "date": "2026-03-21",
    "type": "expense",
    "category": "食費",
    "subcategory": "はな",
    "amount": 2200,
    "memo": ""
  },
  {
    "date": "2026-03-21",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "車クルマ",
    "amount": 795,
    "memo": ""
  },
  {
    "date": "2026-03-23",
    "type": "expense",
    "category": "食費",
    "subcategory": "松尾精麦マテゥセイ",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-03-23",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-03-24",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 253,
    "memo": ""
  },
  {
    "date": "2026-03-24",
    "type": "expense",
    "category": "食費",
    "subcategory": "ちばチャン",
    "amount": 3800,
    "memo": ""
  },
  {
    "date": "2026-03-24",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "まねきねこ",
    "amount": 1930,
    "memo": ""
  },
  {
    "date": "2026-03-24",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 252,
    "memo": ""
  },
  {
    "date": "2026-03-25",
    "type": "expense",
    "category": "食費",
    "subcategory": "くらむ",
    "amount": 1200,
    "memo": ""
  },
  {
    "date": "2026-03-25",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-03-25",
    "type": "expense",
    "category": "被服",
    "subcategory": "オカダヤ",
    "amount": 668,
    "memo": ""
  },
  {
    "date": "2026-03-26",
    "type": "expense",
    "category": "食費",
    "subcategory": "バーガーキング",
    "amount": 700,
    "memo": ""
  },
  {
    "date": "2026-03-26",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "アットコンタクト",
    "amount": 13800,
    "memo": ""
  },
  {
    "date": "2026-03-27",
    "type": "expense",
    "category": "食費",
    "subcategory": "バーガーキング",
    "amount": 700,
    "memo": ""
  },
  {
    "date": "2026-03-27",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-03-28",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 1408,
    "memo": ""
  },
  {
    "date": "2026-03-28",
    "type": "expense",
    "category": "食費",
    "subcategory": "ラーメン祭",
    "amount": 1750,
    "memo": ""
  },
  {
    "date": "2026-03-28",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 171,
    "memo": ""
  },
  {
    "date": "2026-03-28",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "いちご狩りガリ",
    "amount": 2400,
    "memo": ""
  },
  {
    "date": "2026-03-28",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "自動販売機ジドウ",
    "amount": 120,
    "memo": ""
  },
  {
    "date": "2026-03-28",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "まねきねこ",
    "amount": 1950,
    "memo": ""
  },
  {
    "date": "2026-03-28",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 1408,
    "memo": ""
  },
  {
    "date": "2026-03-30",
    "type": "expense",
    "category": "食費",
    "subcategory": "バーガーキング",
    "amount": 700,
    "memo": ""
  },
  {
    "date": "2026-03-30",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-03-31",
    "type": "income",
    "category": "給与",
    "subcategory": "河合塾カワイジュク",
    "amount": 19237,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "DAZN",
    "amount": 3280,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "AMAZON PRIME",
    "amount": 300,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "AMAZON PRIME MUSIC",
    "amount": 580,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "携帯料金ケイタイリョウク",
    "amount": 2974,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Adobe",
    "amount": 2780,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Duolingo",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "income",
    "category": "その他(収入)",
    "subcategory": "小遣いコヅカイ",
    "amount": 30000,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 140,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "expense",
    "category": "食費",
    "subcategory": "兆楽チョウラク",
    "amount": 1030,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "excelsior café",
    "amount": 490,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンセィア",
    "amount": 140,
    "memo": ""
  },
  {
    "date": "2026-04-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "カルディ",
    "amount": 498,
    "memo": ""
  },
  {
    "date": "2026-04-02",
    "type": "expense",
    "category": "食費",
    "subcategory": "バーガーキング",
    "amount": 700,
    "memo": ""
  },
  {
    "date": "2026-04-02",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-04-03",
    "type": "expense",
    "category": "食費",
    "subcategory": "辺見ヘンム",
    "amount": 1130,
    "memo": ""
  },
  {
    "date": "2026-04-03",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-04-03",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "定期券テイキ",
    "amount": 20150,
    "memo": ""
  },
  {
    "date": "2026-04-04",
    "type": "expense",
    "category": "食費",
    "subcategory": "上島珈琲店ウエ",
    "amount": 1650,
    "memo": ""
  },
  {
    "date": "2026-04-07",
    "type": "expense",
    "category": "食費",
    "subcategory": "満来マンライ",
    "amount": 1300,
    "memo": ""
  },
  {
    "date": "2026-04-08",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-04-08",
    "type": "expense",
    "category": "食費",
    "subcategory": "ドトール",
    "amount": 720,
    "memo": ""
  },
  {
    "date": "2026-04-08",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 1026,
    "memo": ""
  },
  {
    "date": "2026-04-08",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Amazon",
    "amount": 1700,
    "memo": ""
  },
  {
    "date": "2026-04-09",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 518,
    "memo": ""
  },
  {
    "date": "2026-04-09",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-04-10",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-04-11",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 528,
    "memo": ""
  },
  {
    "date": "2026-04-11",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-04-11",
    "type": "expense",
    "category": "食費",
    "subcategory": "牛繁ギュウシゲ",
    "amount": 4378,
    "memo": ""
  },
  {
    "date": "2026-04-11",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "カフェ",
    "amount": 650,
    "memo": ""
  },
  {
    "date": "2026-04-11",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 110,
    "memo": ""
  },
  {
    "date": "2026-04-11",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ホテル",
    "amount": 7000,
    "memo": ""
  },
  {
    "date": "2026-04-12",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ビアードパパ",
    "amount": 200,
    "memo": ""
  },
  {
    "date": "2026-04-12",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 528,
    "memo": ""
  },
  {
    "date": "2026-04-12",
    "type": "expense",
    "category": "食費",
    "subcategory": "みた葉🦷",
    "amount": 1150,
    "memo": ""
  },
  {
    "date": "2026-04-12",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-04-12",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Chat GPT",
    "amount": 3000,
    "memo": ""
  },
  {
    "date": "2026-04-12",
    "type": "income",
    "category": "給与",
    "subcategory": "三洋警備保障サンヨウケイビホショウ",
    "amount": 12000,
    "memo": ""
  },
  {
    "date": "2026-04-13",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 594,
    "memo": ""
  },
  {
    "date": "2026-04-13",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 670,
    "memo": ""
  },
  {
    "date": "2026-04-14",
    "type": "expense",
    "category": "食費",
    "subcategory": "しんぱち食堂ショクドウ",
    "amount": 1078,
    "memo": ""
  },
  {
    "date": "2026-04-14",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-04-15",
    "type": "income",
    "category": "給与",
    "subcategory": "個別指導学院コベツ",
    "amount": 48024,
    "memo": ""
  },
  {
    "date": "2026-04-15",
    "type": "expense",
    "category": "食費",
    "subcategory": "バーミヤン",
    "amount": 1200,
    "memo": ""
  },
  {
    "date": "2026-04-15",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-04-15",
    "type": "expense",
    "category": "食費",
    "subcategory": "土間土間ドマドマ",
    "amount": 3000,
    "memo": ""
  },
  {
    "date": "2026-04-15",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車",
    "amount": 136,
    "memo": ""
  },
  {
    "date": "2026-04-16",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 397,
    "memo": ""
  },
  {
    "date": "2026-04-16",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-04-16",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車",
    "amount": 209,
    "memo": ""
  },
  {
    "date": "2026-04-16",
    "type": "expense",
    "category": "食費",
    "subcategory": "鯖匠サバ タクミ",
    "amount": 2000,
    "memo": ""
  },
  {
    "date": "2026-04-16",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車",
    "amount": 209,
    "memo": ""
  },
  {
    "date": "2026-04-16",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-04-17",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 397,
    "memo": ""
  },
  {
    "date": "2026-04-17",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-04-19",
    "type": "expense",
    "category": "食費",
    "subcategory": "ラーメンイエロー",
    "amount": 1100,
    "memo": ""
  },
  {
    "date": "2026-04-19",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "上島珈琲店ウエシマコ",
    "amount": 680,
    "memo": ""
  },
  {
    "date": "2026-04-20",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 1040,
    "memo": ""
  },
  {
    "date": "2026-04-20",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-04-20",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 110,
    "memo": ""
  },
  {
    "date": "2026-04-20",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 140,
    "memo": ""
  },
  {
    "date": "2026-04-21",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 170,
    "memo": ""
  },
  {
    "date": "2026-04-21",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-04-22",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-04-23",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 598,
    "memo": ""
  },
  {
    "date": "2026-04-23",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-04-24",
    "type": "expense",
    "category": "食費",
    "subcategory": "ドトール",
    "amount": 840,
    "memo": ""
  },
  {
    "date": "2026-04-25",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "noi",
    "amount": 12800,
    "memo": ""
  },
  {
    "date": "2026-04-25",
    "type": "expense",
    "category": "食費",
    "subcategory": "時は麺なりトキハ メン",
    "amount": 1070,
    "memo": ""
  },
  {
    "date": "2026-04-25",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "DAISO",
    "amount": 110,
    "memo": ""
  },
  {
    "date": "2026-04-25",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "スターバックス",
    "amount": 510,
    "memo": ""
  },
  {
    "date": "2026-04-26",
    "type": "expense",
    "category": "食費",
    "subcategory": "そると",
    "amount": 1280,
    "memo": ""
  },
  {
    "date": "2026-04-27",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 594,
    "memo": ""
  },
  {
    "date": "2026-04-27",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-04-28",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 397,
    "memo": ""
  },
  {
    "date": "2026-04-28",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 590,
    "memo": ""
  },
  {
    "date": "2026-04-29",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 572,
    "memo": ""
  },
  {
    "date": "2026-04-29",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-05-01",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "DAZN",
    "amount": 3280,
    "memo": ""
  },
  {
    "date": "2026-05-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "AMAZON PRIME",
    "amount": 300,
    "memo": ""
  },
  {
    "date": "2026-05-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "AMAZON PRIME MUSIC",
    "amount": 580,
    "memo": ""
  },
  {
    "date": "2026-05-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "携帯料金ケイタイリョウク",
    "amount": 2974,
    "memo": ""
  },
  {
    "date": "2026-05-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Adobe",
    "amount": 2780,
    "memo": ""
  },
  {
    "date": "2026-05-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Chat GPT",
    "amount": 3000,
    "memo": ""
  },
  {
    "date": "2026-05-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Duolingo",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-05-01",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "nintendo",
    "amount": 306,
    "memo": ""
  },
  {
    "date": "2026-05-02",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 365,
    "memo": ""
  },
  {
    "date": "2026-05-02",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 1595,
    "memo": ""
  },
  {
    "date": "2026-05-02",
    "type": "expense",
    "category": "食費",
    "subcategory": "井岡屋イオカヤ",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-05-03",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 1408,
    "memo": ""
  },
  {
    "date": "2026-05-03",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 1595,
    "memo": ""
  },
  {
    "date": "2026-05-03",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 972,
    "memo": ""
  },
  {
    "date": "2026-05-03",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 1408,
    "memo": ""
  },
  {
    "date": "2026-05-06",
    "type": "income",
    "category": "その他(収入)",
    "subcategory": "交通費コウツウヒ",
    "amount": 4000,
    "memo": ""
  },
  {
    "date": "2026-05-06",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 528,
    "memo": ""
  },
  {
    "date": "2026-05-06",
    "type": "expense",
    "category": "食費",
    "subcategory": "ビーチストーリー",
    "amount": 2400,
    "memo": ""
  },
  {
    "date": "2026-05-06",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 700,
    "memo": ""
  },
  {
    "date": "2026-05-06",
    "type": "expense",
    "category": "食費",
    "subcategory": "サイゼリヤ",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-05-06",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "ガチャガチャ",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-05-07",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 528,
    "memo": ""
  },
  {
    "date": "2026-05-07",
    "type": "expense",
    "category": "食費",
    "subcategory": "学食ガクショク",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-05-07",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Gong cha",
    "amount": 760,
    "memo": ""
  },
  {
    "date": "2026-05-08",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "docomo",
    "amount": 67629,
    "memo": ""
  },
  {
    "date": "2026-05-08",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 356,
    "memo": ""
  },
  {
    "date": "2026-05-09",
    "type": "income",
    "category": "その他(収入)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-05-09",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 528,
    "memo": ""
  },
  {
    "date": "2026-05-09",
    "type": "expense",
    "category": "食費",
    "subcategory": "蒙古タンメン中本モウコナカモト",
    "amount": 1150,
    "memo": ""
  },
  {
    "date": "2026-05-09",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "カラオケマック",
    "amount": 1060,
    "memo": ""
  },
  {
    "date": "2026-05-09",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "VELOCE",
    "amount": 330,
    "memo": ""
  },
  {
    "date": "2026-05-09",
    "type": "expense",
    "category": "食費",
    "subcategory": "鳥貴族トリキゾク",
    "amount": 1560,
    "memo": ""
  },
  {
    "date": "2026-05-10",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 528,
    "memo": ""
  },
  {
    "date": "2026-05-11",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Amazon",
    "amount": 2323,
    "memo": ""
  },
  {
    "date": "2026-05-11",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Amazon",
    "amount": 452,
    "memo": ""
  },
  {
    "date": "2026-05-11",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 572,
    "memo": ""
  },
  {
    "date": "2026-05-11",
    "type": "expense",
    "category": "食費",
    "subcategory": "ゼッテリア",
    "amount": 230,
    "memo": ""
  },
  {
    "date": "2026-05-12",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 227,
    "memo": ""
  },
  {
    "date": "2026-05-12",
    "type": "expense",
    "category": "食費",
    "subcategory": "学食ガクショク",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-05-13",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 483,
    "memo": ""
  },
  {
    "date": "2026-05-13",
    "type": "expense",
    "category": "食費",
    "subcategory": "油党アブラトウ トウイン",
    "amount": 1000,
    "memo": ""
  },
  {
    "date": "2026-05-14",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-05-14",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 578,
    "memo": ""
  },
  {
    "date": "2026-05-15",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "上島珈琲店ウエシマコ",
    "amount": 680,
    "memo": ""
  },
  {
    "date": "2026-05-15",
    "type": "income",
    "category": "給与",
    "subcategory": "個別指導学院コベツシドウガクイン",
    "amount": 93970,
    "memo": ""
  },
  {
    "date": "2026-05-15",
    "type": "income",
    "category": "給与",
    "subcategory": "年末調整ネンマツチョウセイ",
    "amount": 10191,
    "memo": ""
  },
  {
    "date": "2026-05-15",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 594,
    "memo": ""
  },
  {
    "date": "2026-05-16",
    "type": "expense",
    "category": "食費",
    "subcategory": "上島珈琲店ウエシマコ",
    "amount": 1540,
    "memo": ""
  },
  {
    "date": "2026-05-16",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "自動販売機ジドウハンバイキ",
    "amount": 130,
    "memo": ""
  },
  {
    "date": "2026-05-16",
    "type": "expense",
    "category": "食費",
    "subcategory": "すさび湯",
    "amount": 3200,
    "memo": ""
  },
  {
    "date": "2026-05-16",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "まねきねこ",
    "amount": 2000,
    "memo": ""
  },
  {
    "date": "2026-05-17",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 252,
    "memo": ""
  },
  {
    "date": "2026-05-17",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "自動販売機ジドウハンバイキ",
    "amount": 110,
    "memo": ""
  },
  {
    "date": "2026-05-17",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 194,
    "memo": ""
  },
  {
    "date": "2026-05-17",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "文化祭ブンカサイ",
    "amount": 500,
    "memo": ""
  },
  {
    "date": "2026-05-17",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 252,
    "memo": ""
  },
  {
    "date": "2026-05-17",
    "type": "expense",
    "category": "食費",
    "subcategory": "ドトール",
    "amount": 670,
    "memo": ""
  },
  {
    "date": "2026-05-18",
    "type": "expense",
    "category": "食費",
    "subcategory": "学食ガクショク",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-05-18",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-05-19",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "Face to face",
    "amount": 1300,
    "memo": ""
  },
  {
    "date": "2026-05-19",
    "type": "expense",
    "category": "食費",
    "subcategory": "学食ガクショク",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-05-19",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-05-20",
    "type": "expense",
    "category": "食費",
    "subcategory": "油党アブラトウ トウ",
    "amount": 1050,
    "memo": ""
  },
  {
    "date": "2026-05-20",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-05-21",
    "type": "expense",
    "category": "食費",
    "subcategory": "学食ガクショク",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-05-21",
    "type": "expense",
    "category": "食費",
    "subcategory": "マクドナルド",
    "amount": 830,
    "memo": ""
  },
  {
    "date": "2026-05-22",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 626,
    "memo": ""
  },
  {
    "date": "2026-05-22",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-05-23",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-05-23",
    "type": "expense",
    "category": "食費",
    "subcategory": "俺流ラーメンオレリュウ",
    "amount": 1100,
    "memo": ""
  },
  {
    "date": "2026-05-23",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "アイランドヴィンテージコーヒー",
    "amount": 870,
    "memo": ""
  },
  {
    "date": "2026-05-23",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "猿田彦コーヒーサルタヒコ",
    "amount": 680,
    "memo": ""
  },
  {
    "date": "2026-05-23",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 155,
    "memo": ""
  },
  {
    "date": "2026-05-23",
    "type": "expense",
    "category": "被服",
    "subcategory": "コムデギャルソン",
    "amount": 42900,
    "memo": ""
  },
  {
    "date": "2026-05-24",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 209,
    "memo": ""
  },
  {
    "date": "2026-05-24",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 178,
    "memo": ""
  },
  {
    "date": "2026-05-24",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 209,
    "memo": ""
  },
  {
    "date": "2026-05-25",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Amazon",
    "amount": 519,
    "memo": ""
  },
  {
    "date": "2026-05-26",
    "type": "expense",
    "category": "食費",
    "subcategory": "コンビニ",
    "amount": 365,
    "memo": ""
  },
  {
    "date": "2026-05-26",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-05-26",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "コンビニ",
    "amount": 1025,
    "memo": ""
  },
  {
    "date": "2026-05-27",
    "type": "expense",
    "category": "食費",
    "subcategory": "油党アブラトウ トウ",
    "amount": 880,
    "memo": ""
  },
  {
    "date": "2026-05-27",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-05-27",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "自動販売機ジドウハンバイキ",
    "amount": 170,
    "memo": ""
  },
  {
    "date": "2026-05-28",
    "type": "expense",
    "category": "食費",
    "subcategory": "学食ガクショク",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-05-28",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 155,
    "memo": ""
  },
  {
    "date": "2026-05-28",
    "type": "expense",
    "category": "被服",
    "subcategory": "セール",
    "amount": 66720,
    "memo": ""
  },
  {
    "date": "2026-05-28",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 253,
    "memo": ""
  },
  {
    "date": "2026-05-28",
    "type": "expense",
    "category": "食費",
    "subcategory": "ESOLA",
    "amount": 3898,
    "memo": ""
  },
  {
    "date": "2026-05-28",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "電車デンシャ",
    "amount": 253,
    "memo": ""
  },
  {
    "date": "2026-05-28",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "自動販売機ジドウハンバイキ",
    "amount": 110,
    "memo": ""
  },
  {
    "date": "2026-05-29",
    "type": "expense",
    "category": "食費",
    "subcategory": "学食ガクショク",
    "amount": 500,
    "memo": ""
  },
  {
    "date": "2026-05-29",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-05-30",
    "type": "expense",
    "category": "食費",
    "subcategory": "上島珈琲店ウエシマコーヒーテン",
    "amount": 1530,
    "memo": ""
  },
  {
    "date": "2026-05-31",
    "type": "expense",
    "category": "食費",
    "subcategory": "ラーメンイエロー",
    "amount": 1300,
    "memo": ""
  },
  {
    "date": "2026-05-31",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 460,
    "memo": ""
  },
  {
    "date": "2026-06-01",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "DAZN",
    "amount": 3280,
    "memo": ""
  },
  {
    "date": "2026-06-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "AMAZON PRIME",
    "amount": 300,
    "memo": ""
  },
  {
    "date": "2026-06-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "AMAZON PRIME MUSIC",
    "amount": 580,
    "memo": ""
  },
  {
    "date": "2026-06-01",
    "type": "expense",
    "category": "交通・通信",
    "subcategory": "携帯料金ケイタイリョウク",
    "amount": 2974,
    "memo": ""
  },
  {
    "date": "2026-06-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Adobe",
    "amount": 2780,
    "memo": ""
  },
  {
    "date": "2026-06-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "Duolingo",
    "amount": 550,
    "memo": ""
  },
  {
    "date": "2026-06-01",
    "type": "expense",
    "category": "娯楽",
    "subcategory": "nintendo",
    "amount": 306,
    "memo": ""
  },
  {
    "date": "2026-06-01",
    "type": "expense",
    "category": "食費",
    "subcategory": "学食ガクショク",
    "amount": 1100,
    "memo": ""
  },
  {
    "date": "2026-06-01",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "ドトール",
    "amount": 280,
    "memo": ""
  },
  {
    "date": "2026-06-02",
    "type": "expense",
    "category": "食費",
    "subcategory": "自動販売機ジドウハンバイキ",
    "amount": 440,
    "memo": ""
  },
  {
    "date": "2026-06-02",
    "type": "expense",
    "category": "その他(支出)",
    "subcategory": "イヤホン",
    "amount": 7640,
    "memo": ""
  }
];

export const initialHouseholdBudgets: HouseholdBudget[] = [
  {
    "month": "2026-01",
    "category": "給与",
    "budget": 50000
  },
  {
    "month": "2026-01",
    "category": "その他(収入)",
    "budget": 30000
  },
  {
    "month": "2026-01",
    "category": "取崩し",
    "budget": 40000
  },
  {
    "month": "2026-01",
    "category": "食費",
    "budget": 25000
  },
  {
    "month": "2026-01",
    "category": "住居",
    "budget": 0
  },
  {
    "month": "2026-01",
    "category": "光熱・水道",
    "budget": 0
  },
  {
    "month": "2026-01",
    "category": "生活用品",
    "budget": 1000
  },
  {
    "month": "2026-01",
    "category": "被服",
    "budget": 25000
  },
  {
    "month": "2026-01",
    "category": "保険医療",
    "budget": 0
  },
  {
    "month": "2026-01",
    "category": "交通・通信",
    "budget": 5000
  },
  {
    "month": "2026-01",
    "category": "娯楽",
    "budget": 10000
  },
  {
    "month": "2026-01",
    "category": "その他(支出)",
    "budget": 54000
  },
  {
    "month": "2026-02",
    "category": "給与",
    "budget": 50000
  },
  {
    "month": "2026-02",
    "category": "その他(収入)",
    "budget": 30000
  },
  {
    "month": "2026-02",
    "category": "取崩し",
    "budget": 40000
  },
  {
    "month": "2026-02",
    "category": "食費",
    "budget": 25000
  },
  {
    "month": "2026-02",
    "category": "住居",
    "budget": 0
  },
  {
    "month": "2026-02",
    "category": "光熱・水道",
    "budget": 0
  },
  {
    "month": "2026-02",
    "category": "生活用品",
    "budget": 1000
  },
  {
    "month": "2026-02",
    "category": "被服",
    "budget": 25000
  },
  {
    "month": "2026-02",
    "category": "保険医療",
    "budget": 0
  },
  {
    "month": "2026-02",
    "category": "交通・通信",
    "budget": 5000
  },
  {
    "month": "2026-02",
    "category": "娯楽",
    "budget": 10000
  },
  {
    "month": "2026-02",
    "category": "その他(支出)",
    "budget": 54000
  },
  {
    "month": "2026-03",
    "category": "給与",
    "budget": 50000
  },
  {
    "month": "2026-03",
    "category": "その他(収入)",
    "budget": 30000
  },
  {
    "month": "2026-03",
    "category": "取崩し",
    "budget": 40000
  },
  {
    "month": "2026-03",
    "category": "食費",
    "budget": 25000
  },
  {
    "month": "2026-03",
    "category": "住居",
    "budget": 0
  },
  {
    "month": "2026-03",
    "category": "光熱・水道",
    "budget": 0
  },
  {
    "month": "2026-03",
    "category": "生活用品",
    "budget": 1000
  },
  {
    "month": "2026-03",
    "category": "被服",
    "budget": 25000
  },
  {
    "month": "2026-03",
    "category": "保険医療",
    "budget": 0
  },
  {
    "month": "2026-03",
    "category": "交通・通信",
    "budget": 5000
  },
  {
    "month": "2026-03",
    "category": "娯楽",
    "budget": 10000
  },
  {
    "month": "2026-03",
    "category": "その他(支出)",
    "budget": 54000
  },
  {
    "month": "2026-04",
    "category": "給与",
    "budget": 50000
  },
  {
    "month": "2026-04",
    "category": "その他(収入)",
    "budget": 30000
  },
  {
    "month": "2026-04",
    "category": "取崩し",
    "budget": 40000
  },
  {
    "month": "2026-04",
    "category": "食費",
    "budget": 25000
  },
  {
    "month": "2026-04",
    "category": "住居",
    "budget": 0
  },
  {
    "month": "2026-04",
    "category": "光熱・水道",
    "budget": 0
  },
  {
    "month": "2026-04",
    "category": "生活用品",
    "budget": 1000
  },
  {
    "month": "2026-04",
    "category": "被服",
    "budget": 25000
  },
  {
    "month": "2026-04",
    "category": "保険医療",
    "budget": 0
  },
  {
    "month": "2026-04",
    "category": "交通・通信",
    "budget": 5000
  },
  {
    "month": "2026-04",
    "category": "娯楽",
    "budget": 10000
  },
  {
    "month": "2026-04",
    "category": "その他(支出)",
    "budget": 54000
  },
  {
    "month": "2026-05",
    "category": "給与",
    "budget": 50000
  },
  {
    "month": "2026-05",
    "category": "その他(収入)",
    "budget": 30000
  },
  {
    "month": "2026-05",
    "category": "取崩し",
    "budget": 40000
  },
  {
    "month": "2026-05",
    "category": "食費",
    "budget": 25000
  },
  {
    "month": "2026-05",
    "category": "住居",
    "budget": 0
  },
  {
    "month": "2026-05",
    "category": "光熱・水道",
    "budget": 0
  },
  {
    "month": "2026-05",
    "category": "生活用品",
    "budget": 1000
  },
  {
    "month": "2026-05",
    "category": "被服",
    "budget": 25000
  },
  {
    "month": "2026-05",
    "category": "保険医療",
    "budget": 0
  },
  {
    "month": "2026-05",
    "category": "交通・通信",
    "budget": 5000
  },
  {
    "month": "2026-05",
    "category": "娯楽",
    "budget": 10000
  },
  {
    "month": "2026-05",
    "category": "その他(支出)",
    "budget": 54000
  },
  {
    "month": "2026-06",
    "category": "給与",
    "budget": 50000
  },
  {
    "month": "2026-06",
    "category": "その他(収入)",
    "budget": 30000
  },
  {
    "month": "2026-06",
    "category": "取崩し",
    "budget": 40000
  },
  {
    "month": "2026-06",
    "category": "食費",
    "budget": 25000
  },
  {
    "month": "2026-06",
    "category": "住居",
    "budget": 0
  },
  {
    "month": "2026-06",
    "category": "光熱・水道",
    "budget": 0
  },
  {
    "month": "2026-06",
    "category": "生活用品",
    "budget": 1000
  },
  {
    "month": "2026-06",
    "category": "被服",
    "budget": 25000
  },
  {
    "month": "2026-06",
    "category": "保険医療",
    "budget": 0
  },
  {
    "month": "2026-06",
    "category": "交通・通信",
    "budget": 5000
  },
  {
    "month": "2026-06",
    "category": "娯楽",
    "budget": 10000
  },
  {
    "month": "2026-06",
    "category": "その他(支出)",
    "budget": 54000
  }
];
