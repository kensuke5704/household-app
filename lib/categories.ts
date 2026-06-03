export const incomeCategories = ["給与", "その他(収入)", "取崩し"] as const;

export const expenseCategories = [
  "食費",
  "住居",
  "光熱・水道",
  "生活用品",
  "被服",
  "保険医療",
  "交通・通信",
  "娯楽",
  "その他(支出)",
] as const;

export const allCategories = [...incomeCategories, ...expenseCategories] as const;

export const defaultBudgets: Record<string, number> = {
  "給与": 50000,
  "その他(収入)": 30000,
  "取崩し": 40000,
  "食費": 25000,
  "住居": 0,
  "光熱・水道": 0,
  "生活用品": 1000,
  "被服": 25000,
  "保険医療": 0,
  "交通・通信": 5000,
  "娯楽": 10000,
  "その他(支出)": 54000,
};

export const recurringTemplates = [
  { type: "expense", category: "娯楽", subcategory: "DAZN", amount: 3280 },
  { type: "expense", category: "その他(支出)", subcategory: "AMAZON PRIME", amount: 300 },
  { type: "expense", category: "その他(支出)", subcategory: "AMAZON PRIME MUSIC", amount: 580 },
  { type: "expense", category: "交通・通信", subcategory: "携帯料金", amount: 2974 },
  { type: "expense", category: "その他(支出)", subcategory: "Adobe", amount: 2780 },
  { type: "expense", category: "その他(支出)", subcategory: "Duolingo", amount: 550 },
  { type: "expense", category: "娯楽", subcategory: "nintendo", amount: 306 },
] as const;
