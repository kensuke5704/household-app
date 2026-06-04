"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Home,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  expenseCategories,
  incomeCategories,
  recurringTemplates,
} from "@/lib/categories";
import {
  addTransaction,
  deleteTransaction,
  getBudgets,
  getTransactions,
  saveBudgets,
  updateTransaction,
} from "@/lib/householdStore";
import {
  currentMonthString,
  makeSummaryRows,
  todayString,
  totalByType,
  yen,
} from "@/lib/utils";
import type {
  HouseholdBudget,
  HouseholdTransaction,
  SummaryRow,
  TransactionType,
} from "@/types/household";
import LoginGate from "@/components/LoginGate";

type AppTab = "home" | "input" | "budget" | "history";

type TemplateDraft = {
  id: string;
  type: TransactionType;
  category: string;
  subcategory: string;
  amount: string;
  enabled: boolean;
};

type CategoryOverview = {
  type: TransactionType;
  category: string;
  budget: number;
  actual: number;
  diff: number;
};

type MonthOverview = {
  month: string;
  incomeBudget: number;
  expenseBudget: number;
  incomeActual: number;
  expenseActual: number;
  balance: number;
  categoryRows: CategoryOverview[];
};

const TEMPLATE_STORAGE_KEY = "household.recurringTemplates.v2";
const LEGACY_TEMPLATE_STORAGE_KEY = "household.recurringTemplates.v1";
const TEMPLATE_GLOBAL_ENABLED_KEY =
  "household.recurringTemplates.globalEnabled.v1";
const QUICK_SUBCATEGORY_STORAGE_KEY = "household.quickSubcategories.v1";

const frequentSubcategories: Record<TransactionType, string[]> = {
  expense: [
    "スーパー",
    "コンビニ",
    "外食",
    "カフェ",
    "交通費",
    "日用品",
    "携帯料金",
    "サブスク",
  ],
  income: ["給与", "副収入", "立替返金", "取崩し"],
};

const tabs: Array<{ key: AppTab; label: string; icon: LucideIcon }> = [
  { key: "home", label: "ホーム", icon: Home },
  { key: "input", label: "入力", icon: Plus },
  { key: "budget", label: "予算", icon: WalletCards },
  { key: "history", label: "履歴", icon: CalendarDays },
];

function formatNumber(value: number | string) {
  const digits = String(value).replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ja-JP");
}

function toDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function readGlobalTemplateEnabled() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(TEMPLATE_GLOBAL_ENABLED_KEY) !== "false";
}

function writeGlobalTemplateEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TEMPLATE_GLOBAL_ENABLED_KEY, String(enabled));
}

function readQuickSubcategories(): Record<TransactionType, string[]> {
  if (typeof window === "undefined") return frequentSubcategories;
  try {
    const raw = window.localStorage.getItem(QUICK_SUBCATEGORY_STORAGE_KEY);
    if (!raw) return frequentSubcategories;
    const parsed = JSON.parse(raw) as Partial<Record<TransactionType, string[]>>;
    return {
      expense: Array.isArray(parsed.expense) ? parsed.expense : frequentSubcategories.expense,
      income: Array.isArray(parsed.income) ? parsed.income : frequentSubcategories.income,
    };
  } catch {
    return frequentSubcategories;
  }
}

function writeQuickSubcategories(items: Record<TransactionType, string[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUICK_SUBCATEGORY_STORAGE_KEY, JSON.stringify(items));
}

function signedYen(value: number) {
  return `${value >= 0 ? "+" : ""}${yen(value)}`;
}

function readTemplateDrafts(): TemplateDraft[] {
  if (typeof window === "undefined") return makeDefaultTemplates();

  const raw =
    window.localStorage.getItem(TEMPLATE_STORAGE_KEY) ||
    window.localStorage.getItem(LEGACY_TEMPLATE_STORAGE_KEY);
  if (!raw) return makeDefaultTemplates();

  try {
    const parsed = JSON.parse(raw) as Partial<TemplateDraft>[];
    if (!Array.isArray(parsed)) return makeDefaultTemplates();
    return parsed.map((item, index) => ({
      id: item.id || `template-${index}`,
      type: item.type === "income" ? "income" : "expense",
      category: item.category || "その他(支出)",
      subcategory: item.subcategory || "",
      amount: toDigits(item.amount || ""),
      enabled: item.enabled ?? true,
    }));
  } catch {
    return makeDefaultTemplates();
  }
}

function writeTemplateDrafts(templates: TemplateDraft[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
}

function makeDefaultTemplates(): TemplateDraft[] {
  return recurringTemplates.map((item, index) => ({
    id: `template-${index}-${item.category}-${item.subcategory}`,
    type: item.type as TransactionType,
    category: item.category,
    subcategory: item.subcategory,
    amount: String(item.amount),
    enabled: true,
  }));
}

function getMonthLabel(month: string) {
  const [year, m] = month.split("-");
  return `${year}年${Number(m)}月`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatLocalMonth(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

function shiftMonth(month: string, offset: number) {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1 + offset, 1);
  return formatLocalMonth(date);
}

function shiftDate(date: string, offset: number) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(year, month - 1, day + offset);
  return formatLocalDate(next);
}

function getMonthsFromJan2026() {
  const start = new Date(2026, 0, 1);
  const [endYear, endMonth] = currentMonthString().split("-").map(Number);
  const end = new Date(endYear, endMonth - 1, 1);
  const months: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    months.push(formatLocalMonth(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months.reverse();
}

function getMonthsFromSelectedToCurrent(selectedMonth: string) {
  const [startYear, startMonth] = selectedMonth.split("-").map(Number);
  const [currentYear, currentMonth] = currentMonthString().split("-").map(Number);
  const start = new Date(startYear, startMonth - 1, 1);
  const end = new Date(currentYear, currentMonth - 1, 1);
  if (start > end) return [selectedMonth];

  const months: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    months.push(formatLocalMonth(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

function getMonthsFromSelectedForward(selectedMonth: string, count = 120) {
  const [startYear, startMonth] = selectedMonth.split("-").map(Number);
  const cursor = new Date(startYear, startMonth - 1, 1);
  const months: string[] = [];
  for (let i = 0; i < count; i += 1) {
    months.push(formatLocalMonth(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

function getTemplateTransactions(
  templates: TemplateDraft[],
  globalEnabled: boolean,
): HouseholdTransaction[] {
  if (!globalEnabled) return [];
  return templates
    .filter(
      (item) =>
        item.enabled && item.category && Number(toDigits(item.amount)) > 0,
    )
    .map((item) => ({
      id: `fixed-${item.id}`,
      date: "",
      type: item.type,
      category: item.category,
      subcategory: item.subcategory || "固定費",
      amount: Number(toDigits(item.amount)),
      memo: "fixed-template",
    }));
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [month, setMonth] = useState(currentMonthString());
  const [transactions, setTransactions] = useState<HouseholdTransaction[]>([]);
  const [budgets, setBudgets] = useState<HouseholdBudget[]>([]);
  const [templates, setTemplates] =
    useState<TemplateDraft[]>(makeDefaultTemplates);
  const [templatesEnabled, setTemplatesEnabled] = useState(true);
  const [monthOverviews, setMonthOverviews] = useState<MonthOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const touchStartY = useRef<number | null>(null);

  async function reload(options?: {
    showLoading?: boolean;
    keepScroll?: boolean;
  }) {
    const showLoading = options?.showLoading ?? true;
    const keepScroll = options?.keepScroll ?? false;
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;

    if (showLoading) setLoading(true);

    try {
      const [transactionRows, budgetRows] = await Promise.all([
        getTransactions(month),
        getBudgets(month),
      ]);
      setTransactions(transactionRows);
      setBudgets(budgetRows);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "データ取得に失敗しました",
      );
    } finally {
      if (showLoading) setLoading(false);
      if (keepScroll && typeof window !== "undefined") {
        requestAnimationFrame(() => window.scrollTo({ top: scrollY }));
      }
    }
  }

  async function loadMonthOverviews() {
    try {
      const rows = await Promise.all(
        getMonthsFromJan2026().map(async (targetMonth) => {
          const [monthTransactions, monthBudgets] = await Promise.all([
            getTransactions(targetMonth),
            getBudgets(targetMonth),
          ]);
          const incomeBudget = monthBudgets
            .filter((b) => incomeCategories.includes(b.category as any))
            .reduce((sum, b) => sum + b.budget, 0);
          const expenseBudget = monthBudgets
            .filter((b) => expenseCategories.includes(b.category as any))
            .reduce((sum, b) => sum + b.budget, 0);
          const actualTransactions = monthTransactions;
          const incomeActual = totalByType(actualTransactions, "income");
          const expenseActual = totalByType(actualTransactions, "expense");
          const finalIncomeBudget = incomeBudget;
          const finalExpenseBudget = expenseBudget;
          const categoryRows: CategoryOverview[] = [
            ...makeSummaryRows(actualTransactions, monthBudgets, "income").map((row) => ({
              type: "income" as TransactionType,
              category: row.category,
              budget: row.budget,
              actual: row.actual,
              diff: row.diff,
            })),
            ...makeSummaryRows(actualTransactions, monthBudgets, "expense").map((row) => ({
              type: "expense" as TransactionType,
              category: row.category,
              budget: row.budget,
              actual: row.actual,
              diff: row.diff,
            })),
          ];
          return {
            month: targetMonth,
            incomeBudget: finalIncomeBudget,
            expenseBudget: finalExpenseBudget,
            incomeActual,
            expenseActual,
            balance: incomeActual - expenseActual,
            categoryRows,
          };
        }),
      );
      setMonthOverviews(rows);
    } catch {
      // 月別履歴は補助表示のため、失敗しても入力画面を止めない。
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  useEffect(() => {
    setTemplates(readTemplateDrafts());
    setTemplatesEnabled(readGlobalTemplateEnabled());
  }, []);

  useEffect(() => {
    writeTemplateDrafts(templates);
  }, [templates]);

  useEffect(() => {
    writeGlobalTemplateEnabled(templatesEnabled);
  }, [templatesEnabled]);

  useEffect(() => {
    void loadMonthOverviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, transactions, budgets]);

  async function refreshWithoutJump() {
    await reload({ showLoading: false, keepScroll: true });
  }

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (touchStartY.current === null) return;
    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
    const diff = endY - touchStartY.current;
    touchStartY.current = null;

    if (window.scrollY <= 8 && diff < -80) {
      void refreshWithoutJump();
    }
  }

  const homeTransactions = transactions;
  const income = useMemo(
    () => totalByType(transactions, "income"),
    [transactions],
  );
  const expense = useMemo(
    () => totalByType(transactions, "expense"),
    [transactions],
  );
  const homeIncome = useMemo(
    () => totalByType(homeTransactions, "income"),
    [homeTransactions],
  );
  const homeExpense = useMemo(
    () => totalByType(homeTransactions, "expense"),
    [homeTransactions],
  );
  const incomeRows = useMemo(
    () => makeSummaryRows(homeTransactions, budgets, "income"),
    [homeTransactions, budgets],
  );
  const expenseRows = useMemo(
    () => makeSummaryRows(homeTransactions, budgets, "expense"),
    [homeTransactions, budgets],
  );

  return (
    <LoginGate>
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="min-h-screen bg-[#f7f3eb] px-3 pb-24 pt-4 sm:px-6 lg:px-8 lg:py-8"
      >
        <div className="mx-auto w-full max-w-7xl">
          {activeTab !== "history" && (
            <header className="mb-4 rounded-[24px] border border-[#e6dcc8] bg-white p-3 shadow-sm sm:mb-6 sm:rounded-[28px] sm:p-4">
              <MonthHeader month={month} setMonth={setMonth} />
            </header>
          )}

          {message && (
            <div className="mb-4 rounded-2xl border border-[#e6dcc8] bg-white px-4 py-3 text-sm font-bold text-[#5b4630] shadow-sm">
              {message}
            </div>
          )}

          <TabNav activeTab={activeTab} onChange={setActiveTab} />

          {loading ? (
            <div className="rounded-2xl border border-[#e6dcc8] bg-white px-4 py-10 text-center text-sm font-bold text-[#6b7280]">
              読み込み中...
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === "home" && (
                <HomeTab
                  income={homeIncome}
                  expense={homeExpense}
                  budgets={budgets}
                  incomeRows={incomeRows}
                  expenseRows={expenseRows}
                />
              )}

              {activeTab === "input" && (
                <InputTab
                  transactions={transactions}
                  templates={templates}
                  templatesEnabled={templatesEnabled}
                  setTemplates={setTemplates}
                  setTemplatesEnabled={setTemplatesEnabled}
                  onChanged={refreshWithoutJump}
                  setMessage={setMessage}
                />
              )}

              {activeTab === "budget" && (
                <BudgetTab
                  month={month}
                  budgets={budgets}
                  incomeRows={incomeRows}
                  expenseRows={expenseRows}
                  onSaved={refreshWithoutJump}
                  setMessage={setMessage}
                />
              )}

              {activeTab === "history" && (
                <HistoryTab overviews={monthOverviews} />
              )}
            </div>
          )}
        </div>
      </main>
    </LoginGate>
  );
}

function MonthHeader({
  month,
  setMonth,
}: {
  month: string;
  setMonth: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
      <button type="button" onClick={() => setMonth((current) => shiftMonth(current, -1))} className="h-11 rounded-xl border border-[#d7c7aa] bg-white text-lg font-black text-[#5b4630] active:bg-[#f3eadb]" aria-label="前の月">‹</button>
      <button
        type="button"
        onDoubleClick={() => setMonth(currentMonthString())}
        onTouchEnd={(e) => {
          e.stopPropagation();
          const now = Date.now();
          const last = Number(e.currentTarget.dataset.lastTap || 0);
          e.currentTarget.dataset.lastTap = String(now);
          if (now - last < 320) setMonth(currentMonthString());
        }}
        className="h-11 rounded-xl border border-[#d7c7aa] bg-white px-3 text-center text-lg font-black text-[#24190f] active:bg-[#f3eadb]"
      >
        {getMonthLabel(month)}
      </button>
      <button type="button" onClick={() => setMonth((current) => shiftMonth(current, 1))} className="h-11 rounded-xl border border-[#d7c7aa] bg-white text-lg font-black text-[#5b4630] active:bg-[#f3eadb]" aria-label="次の月">›</button>
    </div>
  );
}

function DateNavigator({
  date,
  setDate,
}: {
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
      <button type="button" onTouchEnd={(e) => e.stopPropagation()} onClick={() => setDate((current) => shiftDate(current, -1))} className="h-11 rounded-xl border border-[#d7c7aa] bg-white text-lg font-black text-[#5b4630] active:bg-[#f3eadb]" aria-label="前の日">‹</button>
      <button
        type="button"
        onDoubleClick={() => setDate(todayString())}
        onTouchEnd={(e) => {
          e.stopPropagation();
          const now = Date.now();
          const last = Number(e.currentTarget.dataset.lastTap || 0);
          e.currentTarget.dataset.lastTap = String(now);
          if (now - last < 320) setDate(todayString());
        }}
        className="h-11 rounded-xl border border-[#d7c7aa] bg-white px-3 text-center text-sm font-black text-[#24190f] active:bg-[#f3eadb]"
      >
        {date}
      </button>
      <button type="button" onTouchEnd={(e) => e.stopPropagation()} onClick={() => setDate((current) => shiftDate(current, 1))} className="h-11 rounded-xl border border-[#d7c7aa] bg-white text-lg font-black text-[#5b4630] active:bg-[#f3eadb]" aria-label="次の日">›</button>
    </div>
  );
}

function TabNav({
  activeTab,
  onChange,
}: {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}) {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 mx-auto grid max-w-md grid-cols-4 gap-1 rounded-2xl border border-[#e6dcc8] bg-white/95 p-1 shadow-lg backdrop-blur lg:bottom-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-black sm:text-xs ${
              active
                ? "bg-[#5b4630] text-white"
                : "text-[#6b7280] active:bg-[#f3eadb]"
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function HomeTab({
  income,
  expense,
  budgets,
  incomeRows,
  expenseRows,
}: {
  income: number;
  expense: number;
  budgets: HouseholdBudget[];
  incomeRows: SummaryRow[];
  expenseRows: SummaryRow[];
}) {
  const incomeBudget = budgets
    .filter((b) => incomeCategories.includes(b.category as any))
    .reduce((sum, b) => sum + b.budget, 0);
  const expenseBudget = budgets
    .filter((b) => expenseCategories.includes(b.category as any))
    .reduce((sum, b) => sum + b.budget, 0);

  return (
    <div className="space-y-4">
      <BudgetActualGraphCard
        title="収支"
        incomeBudget={incomeBudget}
        incomeActual={income}
        expenseBudget={expenseBudget}
        expenseActual={expense}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SummaryTable title="収入の予算比較" rows={incomeRows} type="income" />
        <SummaryTable
          title="支出の予算比較"
          rows={expenseRows}
          type="expense"
        />
      </div>

    </div>
  );
}

function InputTab({
  transactions,
  templates,
  templatesEnabled,
  setTemplates,
  setTemplatesEnabled,
  onChanged,
  setMessage,
}: {
  transactions: HouseholdTransaction[];
  templates: TemplateDraft[];
  templatesEnabled: boolean;
  setTemplates: React.Dispatch<React.SetStateAction<TemplateDraft[]>>;
  setTemplatesEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onChanged: () => Promise<void>;
  setMessage: (value: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(todayString());

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <div className="space-y-4">
        <InputPanel date={selectedDate} setDate={setSelectedDate} onAdded={onChanged} setMessage={setMessage} />
        <FixedTemplatePanel
          date={selectedDate}
          templates={templates}
          templatesEnabled={templatesEnabled}
          setTemplates={setTemplates}
          setTemplatesEnabled={setTemplatesEnabled}
          onAdded={onChanged}
          setMessage={setMessage}
        />
      </div>
      <HistoryTable
        transactions={transactions}
        onChanged={onChanged}
        setMessage={setMessage}
      />
    </div>
  );
}

function BudgetTab({
  month,
  budgets,
  incomeRows,
  expenseRows,
  onSaved,
  setMessage,
}: {
  month: string;
  budgets: HouseholdBudget[];
  incomeRows: SummaryRow[];
  expenseRows: SummaryRow[];
  onSaved: () => Promise<void>;
  setMessage: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <BudgetBreakdownPieCard incomeRows={incomeRows} expenseRows={expenseRows} />
      <BudgetPanel
        month={month}
        budgets={budgets}
        onSaved={onSaved}
        setMessage={setMessage}
      />
    </div>
  );
}

function BudgetBreakdownPieCard({
  incomeRows,
  expenseRows,
}: {
  incomeRows: SummaryRow[];
  expenseRows: SummaryRow[];
}) {
  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <WalletCards size={18} className="text-[#8a6a3f]" />
        <h2 className="text-lg font-black text-[#24190f]">予算内訳</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <BudgetCategoryDonut label="収入" rows={incomeRows} tone="green" />
        <BudgetCategoryDonut label="支出" rows={expenseRows} tone="red" />
      </div>
    </div>
  );
}

function BudgetCategoryDonut({
  label,
  rows,
  tone,
}: {
  label: string;
  rows: SummaryRow[];
  tone: "green" | "red";
}) {
  const palette =
    tone === "green"
      ? [
          "#2f6f4e",
          "#4f8f67",
          "#6fa981",
          "#8fbf9a",
          "#a9d0b0",
          "#3f766f",
          "#5e9488",
          "#7fb0a4",
          "#9bc8bb",
          "#bdddd4",
          "#6b7f3f",
          "#899c5a",
        ]
      : [
          "#9f4f45",
          "#b9665b",
          "#cf7f72",
          "#df9a8f",
          "#e9b4aa",
          "#8f5f3c",
          "#a8774d",
          "#bf9364",
          "#d2aa7d",
          "#e2c29c",
          "#8f4f6f",
          "#ad6f8d",
        ];
  const budgetRows = rows.filter((row) => row.budget > 0);
  const total = budgetRows.reduce((sum, row) => sum + row.budget, 0);
  let cursor = 0;
  const segments = budgetRows.map((row, index) => {
    const start = cursor;
    const end = start + (row.budget / Math.max(total, 1)) * 100;
    cursor = end;
    return `${palette[index % palette.length]} ${start}% ${end}%`;
  });
  const background =
    total > 0 ? `conic-gradient(${segments.join(", ")})` : "#eee4d2";

  return (
    <div className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full" style={{ background }}>
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-xs font-black text-[#6b7280]">{label}</span>
          <span className="text-sm font-black text-[#24190f]">{yen(total)}</span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {budgetRows.map((row, index) => (
          <div key={row.category} className="flex items-center justify-between gap-2 text-[11px] font-bold">
            <span className="min-w-0 truncate text-[#5b4630]">
              <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
              {row.category}
            </span>
            <span className="shrink-0 text-[#24190f]">{yen(row.budget)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab({ overviews }: { overviews: MonthOverview[] }) {
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({});
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    return overviews.reduce<Record<string, MonthOverview[]>>((acc, row) => {
      const year = row.month.slice(0, 4);
      acc[year] = [...(acc[year] || []), row];
      return acc;
    }, {});
  }, [overviews]);

  function toggleYear(year: string) {
    setOpenYears((current) => ({ ...current, [year]: !(current[year] ?? year === currentMonthString().slice(0, 4)) }));
  }

  function toggleMonth(month: string) {
    setOpenMonths((current) => ({ ...current, [month]: !current[month] }));
  }

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#eee4d2] px-4 py-3 sm:px-5 sm:py-4">
        <ListChecks size={18} className="text-[#8a6a3f]" />
        <h2 className="text-lg font-black text-[#24190f]">月別履歴</h2>
      </div>

      <div className="space-y-3 p-3">
        {(Object.entries(grouped) as Array<[string, MonthOverview[]]>)
          .filter(([year]) => Number(year) >= 2026)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([year, rows]) => {
            const yearOpen = openYears[year] ?? year === currentMonthString().slice(0, 4);
            const yearIncome = rows.reduce((sum, row) => sum + row.incomeActual, 0);
            const yearExpense = rows.reduce((sum, row) => sum + row.expenseActual, 0);
            const yearBalance = yearIncome - yearExpense;
            return (
              <section key={year} className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7]">
                <button
                  type="button"
                  onClick={() => toggleYear(year)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                >
                  <div>
                    <p className="text-base font-black text-[#24190f]">{year}年</p>
                    <p className="mt-1 text-xs font-bold text-[#6b7280]">
                      収入 {yen(yearIncome)} / 支出 {yen(yearExpense)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${yearBalance < 0 ? "text-[#b42318]" : "text-[#047857]"}`}>
                      {signedYen(yearBalance)}
                    </p>
                    <p className="text-[11px] font-black text-[#6b7280]">{yearOpen ? "閉じる" : "開く"}</p>
                  </div>
                </button>

                {yearOpen && (
                  <div className="space-y-2 border-t border-[#eee4d2] p-2">
                    {rows.map((row) => {
                      const open = openMonths[row.month] ?? row.month === currentMonthString();
                      const incomeRows = row.categoryRows.filter((item) => item.type === "income" && (item.actual > 0 || item.budget > 0));
                      const expenseRows = row.categoryRows.filter((item) => item.type === "expense" && (item.actual > 0 || item.budget > 0));
                      return (
                        <div key={row.month} className="rounded-xl border border-[#f0e7d8] bg-white p-3">
                          <button type="button" onClick={() => toggleMonth(row.month)} className="mb-3 flex w-full items-center justify-between gap-3 text-left">
                            <p className="font-black text-[#24190f]">{getMonthLabel(row.month)}</p>
                            <div className="text-right">
                              <p className={`text-lg font-black ${row.balance < 0 ? "text-[#b42318]" : "text-[#047857]"}`}>
                                {signedYen(row.balance)}
                              </p>
                              <p className="text-[11px] font-black text-[#6b7280]">{open ? "閉じる" : "内訳"}</p>
                            </div>
                          </button>
                          {open && (
                            <div className="mt-3 space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <MiniStat label="収入予算" value={row.incomeBudget} />
                                <MiniStat label="収入実績" value={row.incomeActual} tone="green" />
                                <MiniStat label="支出予算" value={row.expenseBudget} />
                                <MiniStat label="支出実績" value={row.expenseActual} tone="red" />
                              </div>
                              <HistoryCategorySection title="収入内訳" rows={incomeRows} />
                              <HistoryCategorySection title="支出内訳" rows={expenseRows} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
      </div>
    </div>
  );
}


function HistoryCategorySection({
  title,
  rows,
}: {
  title: string;
  rows: CategoryOverview[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
        <p className="text-sm font-black text-[#24190f]">{title}</p>
        <p className="mt-2 text-xs font-bold text-[#8a7a68]">内訳はありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
      <p className="mb-2 text-sm font-black text-[#24190f]">{title}</p>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={`${row.type}-${row.category}`} className="rounded-lg bg-white p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-black text-[#24190f]">{row.category}</p>
              <p className={`shrink-0 text-sm font-black ${row.diff < 0 ? "text-[#b42318]" : "text-[#047857]"}`}>
                {signedYen(row.diff)}
              </p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <MiniStat label="予算" value={row.budget} />
              <MiniStat label="実績" value={row.actual} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthPicker({
  month,
  setMonth,
}: {
  month: string;
  setMonth: (month: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm">
      <label className="block">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="h-12 w-full rounded-xl border border-[#d7c7aa] bg-white px-3 text-base font-bold text-[#24190f]"
        />
      </label>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "green" | "red" | "dark";
}) {
  const textClass =
    tone === "green"
      ? "text-[#047857]"
      : tone === "red"
        ? "text-[#b42318]"
        : "text-[#24190f]";

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm">
      <p className="text-xs font-black text-[#6b7280]">{label}</p>
      <p className={`kpi-value mt-2 text-2xl font-black ${textClass}`}>
        {typeof value === "number" ? yen(value) : value}
      </p>
    </div>
  );
}

function BudgetActualGraphCard({
  title,
  incomeBudget,
  incomeActual,
  expenseBudget,
  expenseActual,
}: {
  title: string;
  incomeBudget: number;
  incomeActual: number;
  expenseBudget: number;
  expenseActual: number;
}) {
  const maxValue = Math.max(
    incomeBudget,
    incomeActual,
    expenseBudget,
    expenseActual,
    1,
  );
  const actualBalance = (incomeActual - incomeBudget) - (expenseActual - expenseBudget);

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-[#8a6a3f]" />
          <h2 className="text-lg font-black text-[#24190f]">{title}</h2>
        </div>
        <div className="hidden rounded-full bg-[#f3eadb] px-3 py-1 text-xs font-black text-[#5b4630] sm:block">
          中央が0円
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
        <p className="text-xs font-black text-[#6b7280]">対予算</p>
        <p className={`mt-1 text-2xl font-black ${actualBalance < 0 ? "text-[#b42318]" : "text-[#047857]"}`}>
          {signedYen(actualBalance)}
        </p>
      </div>

      <div className="space-y-5">
        <CenterBarRow
          label="予算"
          leftLabel="収入予算"
          rightLabel="支出予算"
          leftValue={incomeBudget}
          rightValue={expenseBudget}
          maxValue={maxValue}
        />
        <CenterBarRow
          label="実費"
          leftLabel="収入実績"
          rightLabel="支出実績"
          leftValue={incomeActual}
          rightValue={expenseActual}
          maxValue={maxValue}
        />
      </div>
    </div>
  );
}

function CenterBarRow({
  label,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  maxValue,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  rightValue: number;
  maxValue: number;
}) {
  const leftWidth = Math.min(100, (leftValue / maxValue) * 100);
  const rightWidth = Math.min(100, (rightValue / maxValue) * 100);

  return (
    <div className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
      <div className="mb-2 flex items-center justify-center">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#5b4630] shadow-sm">
          {label}
        </span>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-3 text-xs font-black text-[#6b7280]">
        <span className="text-left">
          {leftLabel}
          <br />
          <span className="text-[#047857]">{yen(leftValue)}</span>
        </span>
        <span className="text-right">
          {rightLabel}
          <br />
          <span className="text-[#b42318]">{yen(rightValue)}</span>
        </span>
      </div>

      <div className="relative grid h-10 grid-cols-2 overflow-hidden rounded-full bg-[#eee4d2]">
        <div className="relative flex justify-end border-r border-white/90">
          <div
            className="h-full rounded-l-full bg-[#a7c4ad]"
            style={{ width: `${leftWidth}%` }}
          />
        </div>
        <div className="relative flex justify-start">
          <div
            className="h-full rounded-r-full bg-[#d7a19a]"
            style={{ width: `${rightWidth}%` }}
          />
        </div>
        <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-white" />
        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#5b4630]" />
      </div>
    </div>
  );
}

function InputPanel({
  date,
  setDate,
  onAdded,
  setMessage,
}: {
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  onAdded: () => Promise<void>;
  setMessage: (value: string) => void;
}) {
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("食費");
  const [subcategory, setSubcategory] = useState("");
  const [amount, setAmount] = useState("");
  const [quickItems, setQuickItems] = useState<Record<TransactionType, string[]>>(frequentSubcategories);
  const [quickEditText, setQuickEditText] = useState("");
  const [editingQuickItems, setEditingQuickItems] = useState(false);

  const categories = type === "income" ? incomeCategories : expenseCategories;

  useEffect(() => {
    setQuickItems(readQuickSubcategories());
  }, []);

  useEffect(() => {
    setCategory(type === "income" ? "給与" : "食費");
    setSubcategory("");
    setEditingQuickItems(false);
  }, [type]);

  function addQuickItem() {
    const value = quickEditText.trim();
    if (!value) return;
    const currentItems = quickItems[type] || [];
    const nextItems = Array.from(new Set([...currentItems, value])).slice(0, 20);
    const next = { ...quickItems, [type]: nextItems };
    setQuickItems(next);
    writeQuickSubcategories(next);
    setQuickEditText("");
  }

  function deleteQuickItem(item: string) {
    const nextItems = (quickItems[type] || []).filter((value) => value !== item);
    const next = { ...quickItems, [type]: nextItems };
    setQuickItems(next);
    writeQuickSubcategories(next);
    if (subcategory === item) setSubcategory("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(toDigits(amount));

    if (!date || !category || !numericAmount || numericAmount <= 0) {
      setMessage("日付・分類・金額を確認してください");
      return;
    }

    try {
      await addTransaction({
        date,
        type,
        category,
        subcategory,
        amount: numericAmount,
        memo: "",
      });
      setSubcategory("");
      setAmount("");
      setMessage("保存しました");
      await onAdded();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存に失敗しました");
    }
  }

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Plus size={18} className="text-[#8a6a3f]" />
        <h2 className="text-lg font-black text-[#24190f]">支出・収入の入力</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f3eadb] p-1">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`rounded-lg py-2 text-sm font-black ${type === "expense" ? "bg-white text-[#b42318] shadow-sm" : "text-[#6b7280]"}`}
          >
            支出
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`rounded-lg py-2 text-sm font-black ${type === "income" ? "bg-white text-[#047857] shadow-sm" : "text-[#6b7280]"}`}
          >
            収入
          </button>
        </div>

        <Field label="日付">
          <DateNavigator date={date} setDate={setDate} />
        </Field>

        <Field label="金額">
          <input
            inputMode="numeric"
            value={formatNumber(amount)}
            onChange={(e) => setAmount(toDigits(e.target.value))}
            placeholder="金額を入力"
            className="input-desktop text-right"
          />
        </Field>

        <Field label="大分類">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory("");
            }}
            className="input-desktop"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="小分類">
          <input
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="小分類を入力"
            className="input-desktop"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {(quickItems[type] || []).map((item) => (
              <span key={item} className="relative inline-flex">
                <button
                  type="button"
                  onClick={() => setSubcategory((current) => (current === item ? "" : item))}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${subcategory === item ? "border-[#5b4630] bg-[#5b4630] text-white" : "border-[#e6dcc8] bg-[#fbfaf7] text-[#5b4630] active:bg-[#f3eadb]"}`}
                >
                  {item}
                </button>
                {editingQuickItems && (
                  <button
                    type="button"
                    onClick={() => deleteQuickItem(item)}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#b42318] text-[9px] font-black leading-none text-white shadow-sm"
                    aria-label={`${item}を削除`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            <button
              type="button"
              onClick={() => setEditingQuickItems((value) => !value)}
              className="rounded-full border border-[#d7c7aa] bg-white px-3 py-1.5 text-xs font-black text-[#5b4630]"
            >
              {editingQuickItems ? "完了" : "編集"}
            </button>
          </div>
          {editingQuickItems && (
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_80px] gap-2 rounded-xl border border-[#e6dcc8] bg-[#fbfaf7] p-2">
              <input
                value={quickEditText}
                onChange={(e) => setQuickEditText(e.target.value)}
                placeholder="新しい小分類"
                className="h-10 rounded-lg border border-[#d7c7aa] bg-white px-3 text-sm font-bold text-[#24190f]"
              />
              <button
                type="button"
                onClick={addQuickItem}
                className="rounded-lg bg-[#5b4630] text-xs font-black text-white"
              >
                登録
              </button>
            </div>
          )}
        </Field>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#5b4630] py-3 text-sm font-black text-white active:scale-[0.99]"
        >
          保存
        </button>
      </form>
    </div>
  );
}

function FixedTemplatePanel({
  date,
  templates,
  templatesEnabled,
  setTemplates,
  setTemplatesEnabled,
  onAdded,
  setMessage,
}: {
  date: string;
  templates: TemplateDraft[];
  templatesEnabled: boolean;
  setTemplates: React.Dispatch<React.SetStateAction<TemplateDraft[]>>;
  setTemplatesEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onAdded: () => Promise<void>;
  setMessage: (value: string) => void;
}) {
  const enabledTemplates = templates.filter((item) => item.enabled);
  const activeExpenseTotal = enabledTemplates
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(toDigits(item.amount)), 0);
  const activeIncomeTotal = enabledTemplates
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(toDigits(item.amount)), 0);
  const [open, setOpen] = useState(false);

  function updateTemplate(id: string, patch: Partial<TemplateDraft>) {
    setTemplates((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addTemplateRow() {
    setTemplates((current) => [
      ...current,
      {
        id: `template-${Date.now()}`,
        type: "expense",
        category: "その他(支出)",
        subcategory: "",
        amount: "",
        enabled: true,
      },
    ]);
  }

  function deleteTemplateRow(id: string) {
    const target = templates.find((item) => item.id === id);
    const label = target?.subcategory || target?.category || "この固定費";
    if (!window.confirm(`${label}を削除しますか？`)) return;
    setTemplates((current) => current.filter((item) => item.id !== id));
  }

  function moveTemplateRow(index: number, direction: -1 | 1) {
    setTemplates((current) => {
      const next = [...current];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return current;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  async function applyTemplates() {
    const targetTemplates = templatesEnabled
      ? templates.filter((item) => item.enabled && Number(toDigits(item.amount)) > 0)
      : [];

    if (targetTemplates.length === 0) {
      setMessage("入力できる固定費がありません");
      return;
    }

    try {
      await Promise.all(
        targetTemplates.map((item) =>
          addTransaction({
            date,
            type: item.type,
            category: item.category,
            subcategory: item.subcategory || "固定費",
            amount: Number(toDigits(item.amount)),
            memo: "fixed-template",
          }),
        ),
      );
      setMessage("固定費を入力しました");
      await onAdded();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "固定費の入力に失敗しました");
    }
  }

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <button type="button" onClick={() => setOpen((v) => !v)} className="min-w-0 text-left">
          <h2 className="text-lg font-black text-[#24190f]">固定費入力</h2>
          <p className="mt-1 text-xs font-bold text-[#6b7280]">
            {open ? "閉じる" : "開く"}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setTemplatesEnabled((v) => !v)}
            className={`rounded-full px-3 py-2 text-xs font-black ${templatesEnabled ? "bg-[#5b4630] text-white" : "bg-[#e5ded1] text-[#6b7280]"}`}
          >
            全体 {templatesEnabled ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            onClick={applyTemplates}
            className="rounded-full bg-[#5b4630] px-3 py-2 text-xs font-black text-white active:scale-[0.99]"
          >
            入力
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
        <MiniStat
          label="ONの固定収入"
          value={templatesEnabled ? activeIncomeTotal : 0}
          tone="green"
        />
        <MiniStat
          label="ONの固定支出"
          value={templatesEnabled ? activeExpenseTotal : 0}
          tone="red"
        />
      </div>

      {open && (
        <>
      <div className="space-y-3">
        {templates.map((template, index) => {
          const templateCategories =
            template.type === "income" ? incomeCategories : expenseCategories;
          return (
            <div
              key={template.id}
              className={`rounded-xl border p-3 ${template.enabled && templatesEnabled ? "border-[#e6dcc8] bg-[#fbfaf7]" : "border-[#e5ded1] bg-[#f8f6f1] opacity-70"}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateTemplate(template.id, { enabled: !template.enabled })
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${template.enabled ? "bg-[#5b4630] text-white" : "bg-[#e5ded1] text-[#6b7280]"}`}
                >
                  {template.enabled ? "ON" : "OFF"}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveTemplateRow(index, -1)}
                    disabled={index === 0}
                    className="rounded-md border border-[#d7c7aa] bg-white px-2 py-1.5 text-xs font-black text-[#5b4630] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTemplateRow(index, 1)}
                    disabled={index === templates.length - 1}
                    className="rounded-md border border-[#d7c7aa] bg-white px-2 py-1.5 text-xs font-black text-[#5b4630] disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTemplateRow(template.id)}
                    className="rounded-md border border-[#ead8d4] bg-white px-3 py-1.5 text-xs font-black text-[#b42318]"
                  >
                    削除
                  </button>
                </div>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <select
                  value={template.type}
                  onChange={(e) => {
                    const nextType = e.target.value as TransactionType;
                    updateTemplate(template.id, {
                      type: nextType,
                      category: nextType === "income" ? "給与" : "その他(支出)",
                    });
                  }}
                  className="input-desktop h-10 py-1 text-sm"
                >
                  <option value="expense">支出</option>
                  <option value="income">収入</option>
                </select>
                <select
                  value={template.category}
                  onChange={(e) =>
                    updateTemplate(template.id, { category: e.target.value })
                  }
                  className="input-desktop h-10 py-1 text-sm"
                >
                  {templateCategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                <input
                  value={template.subcategory}
                  onChange={(e) =>
                    updateTemplate(template.id, { subcategory: e.target.value })
                  }
                  placeholder="項目名"
                  className="input-desktop h-10 py-1 text-sm"
                />
                <input
                  inputMode="numeric"
                  value={formatNumber(template.amount)}
                  onChange={(e) =>
                    updateTemplate(template.id, {
                      amount: toDigits(e.target.value),
                    })
                  }
                  placeholder="金額"
                  className="input-desktop h-10 py-1 text-right text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>


      <button
        type="button"
        onClick={addTemplateRow}
        className="mt-2 w-full rounded-xl border border-[#d7c7aa] bg-white py-3 text-sm font-black text-[#5b4630] active:bg-[#f3eadb]"
      >
        固定費を追加
      </button>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-1 block text-xs font-bold text-[#6b7280]">
        {label}
      </span>
      {children}
    </div>
  );
}

function HistoryTable({
  transactions,
  onChanged,
  setMessage,
}: {
  transactions: HouseholdTransaction[];
  onChanged: () => Promise<void>;
  setMessage: (value: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    date: "",
    type: "expense" as TransactionType,
    category: "食費",
    subcategory: "",
    amount: "",
  });

  function startEdit(t: HouseholdTransaction) {
    setEditingId(t.id);
    setDraft({
      date: t.date,
      type: t.type,
      category: t.category,
      subcategory: t.subcategory || "",
      amount: String(t.amount),
    });
  }

  async function handleSaveEdit(id: string) {
    const numericAmount = Number(toDigits(draft.amount));
    if (!draft.date || !draft.category || numericAmount <= 0) {
      setMessage("編集内容を確認してください");
      return;
    }
    try {
      await updateTransaction(id, {
        date: draft.date,
        type: draft.type,
        category: draft.category,
        subcategory: draft.subcategory,
        amount: numericAmount,
        memo: "",
      });
      setEditingId(null);
      setMessage("履歴を更新しました");
      await onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新に失敗しました");
    }
  }

  async function handleDelete(id: string) {
    const scrollY = window.scrollY;
    try {
      await deleteTransaction(id);
      setMessage("削除しました");
      await onChanged();
      requestAnimationFrame(() => window.scrollTo({ top: scrollY }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "削除に失敗しました");
    }
  }

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#eee4d2] px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-[#8a6a3f]" />
          <h2 className="text-lg font-black text-[#24190f]">入力履歴</h2>
        </div>
        <p className="text-sm font-black text-[#6b7280]">
          {transactions.length}件
        </p>
      </div>

      <div className="space-y-2 p-3">
        {transactions.length === 0 ? (
          <div className="rounded-xl bg-[#fbfaf7] px-4 py-8 text-center text-sm font-bold text-[#6b7280]">
            この月の記録はまだありません。
          </div>
        ) : (
          transactions.map((t) => {
            const isEditing = editingId === t.id;
            const categories =
              draft.type === "income" ? incomeCategories : expenseCategories;
            return (
              <div
                key={t.id}
                className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(e) =>
                        setDraft({ ...draft, date: e.target.value })
                      }
                      className="input-desktop h-10"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={draft.type}
                        onChange={(e) => {
                          const nextType = e.target.value as TransactionType;
                          setDraft({
                            ...draft,
                            type: nextType,
                            category: nextType === "income" ? "給与" : "食費",
                          });
                        }}
                        className="input-desktop h-10 py-1 text-sm"
                      >
                        <option value="expense">支出</option>
                        <option value="income">収入</option>
                      </select>
                      <select
                        value={draft.category}
                        onChange={(e) =>
                          setDraft({ ...draft, category: e.target.value })
                        }
                        className="input-desktop h-10 py-1 text-sm"
                      >
                        {categories.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
                      <input
                        value={draft.subcategory}
                        onChange={(e) =>
                          setDraft({ ...draft, subcategory: e.target.value })
                        }
                        className="input-desktop h-10 py-1 text-sm"
                      />
                      <input
                        inputMode="numeric"
                        value={formatNumber(draft.amount)}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            amount: toDigits(e.target.value),
                          })
                        }
                        className="input-desktop h-10 py-1 text-right text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-[#d7c7aa] bg-white py-2 text-xs font-black text-[#5b4630]"
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(t.id)}
                        className="rounded-lg bg-[#5b4630] py-2 text-xs font-black text-white"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#6b7280]">
                          {t.date}
                        </p>
                        <p className="mt-1 text-sm font-black text-[#24190f]">
                          {t.subcategory || t.category}
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#6b7280]">
                          {t.category}
                        </p>
                      </div>
                      <div
                        className={`text-right text-base font-black ${t.type === "income" ? "text-[#047857]" : "text-[#b42318]"}`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {yen(t.amount)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${t.type === "income" ? "bg-[#e8f7ef] text-[#047857]" : "bg-[#fff0ed] text-[#b42318]"}`}
                      >
                        {t.type === "income" ? "収入" : "支出"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(t)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#d7c7aa] bg-white px-3 py-2 text-xs font-black text-[#5b4630] active:bg-[#f3eadb]"
                        >
                          <Pencil size={14} />
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#ead8d4] bg-white px-3 py-2 text-xs font-black text-[#b42318] active:bg-[#fff0ed]"
                        >
                          <Trash2 size={14} />
                          削除
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SummaryTable({
  title,
  rows,
  type,
}: {
  title: string;
  rows: SummaryRow[];
  type: TransactionType;
}) {
  const [open, setOpen] = useState(false);
  const totalBudget = rows.reduce((sum, r) => sum + r.budget, 0);
  const totalActual = rows.reduce((sum, r) => sum + r.actual, 0);
  const totalDiff =
    type === "income" ? totalActual - totalBudget : totalBudget - totalActual;
  const diffLabel = type === "expense" ? "残り" : "差額";
  const totalLabel = type === "expense" ? "合計残り" : "合計差額";

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 border-b border-[#eee4d2] px-4 py-3 text-left sm:px-5 sm:py-4"
      >
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-[#8a6a3f]" />
          <h2 className="text-lg font-black text-[#24190f]">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={
              totalDiff < 0
                ? "text-sm font-black text-[#b42318]"
                : "text-sm font-black text-[#047857]"
            }
          >
            {signedYen(totalDiff)}
          </span>
          <span className="rounded-full bg-[#f3eadb] px-2 py-1 text-xs font-black text-[#5b4630]">
            {open ? "閉じる" : "開く"}
          </span>
        </div>
      </button>
      {open && (
        <div className="space-y-2 p-3">
          {rows.map((row) => (
            <div
              key={row.category}
              className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-black text-[#24190f]">{row.category}</p>
                <div className="text-right">
                  <p className="text-[11px] font-black text-[#6b7280]">
                    {diffLabel}
                  </p>
                  <p
                    className={`font-black ${row.diff < 0 ? "text-[#b42318]" : "text-[#047857]"}`}
                  >
                    {signedYen(row.diff)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm min-[380px]:grid-cols-2">
                <MiniStat label="予算" value={row.budget} />
                <MiniStat label="実績" value={row.actual} />
              </div>
            </div>
          ))}
          <div className="rounded-xl border-2 border-[#e6dcc8] bg-white p-4">
            <div className="flex items-center justify-between font-black">
              <span>{totalLabel}</span>
              <span
                className={totalDiff < 0 ? "text-[#b42318]" : "text-[#047857]"}
              >
                {signedYen(totalDiff)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "green" | "red";
}) {
  const color =
    tone === "green"
      ? "text-[#047857]"
      : tone === "red"
        ? "text-[#b42318]"
        : "text-[#24190f]";
  return (
    <div className="rounded-lg bg-white p-2">
      <p className="text-xs font-bold text-[#6b7280]">{label}</p>
      <p className={`font-bold ${color}`}>{yen(value)}</p>
    </div>
  );
}

function BudgetPanel({
  month,
  budgets,
  onSaved,
  setMessage,
}: {
  month: string;
  budgets: HouseholdBudget[];
  onSaved: () => Promise<void>;
  setMessage: (value: string) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const incomeBudgets = budgets.filter((b) =>
    incomeCategories.includes(b.category as any),
  );
  const expenseBudgets = budgets.filter((b) =>
    expenseCategories.includes(b.category as any),
  );

  useEffect(() => {
    setDrafts(
      Object.fromEntries(budgets.map((b) => [b.category, String(b.budget)])),
    );
  }, [budgets]);

  function handleChangeBudget(category: string, value: string) {
    setDrafts((current) => ({ ...current, [category]: value }));
  }

  async function handleConfirmBudget() {
    const applyFollowing = window.confirm(
      `${getMonthLabel(month)}以降の予算にも同じ変更を反映しますか？`,
    );
    const targetMonths = applyFollowing
      ? getMonthsFromSelectedForward(month)
      : [month];
    const nextBudgets = budgets.map((b) => ({
      ...b,
      budget: Number(toDigits(drafts[b.category] || "0")),
    }));

    try {
      setSaving(true);
      await Promise.all(
        targetMonths.map((targetMonth) =>
          saveBudgets(
            targetMonth,
            nextBudgets.map((budget) => ({ ...budget, month: targetMonth })),
          ),
        ),
      );
      setMessage(
        applyFollowing
          ? `${getMonthLabel(month)}以降の予算を確定しました`
          : `${getMonthLabel(month)}の予算を確定しました`,
      );
      await onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "予算保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <WalletCards size={18} className="shrink-0 text-[#8a6a3f]" />
            <h2 className="truncate text-lg font-black text-[#24190f]">月別予算</h2>
          </div>
          <button
            type="button"
            onClick={handleConfirmBudget}
            disabled={saving}
            className="shrink-0 rounded-xl bg-[#5b4630] px-3 py-2 text-xs font-black text-white shadow-sm disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            {saving ? "確定中..." : "予算を確定"}
          </button>
        </div>
        <BudgetGroup
          title="収入"
          rows={incomeBudgets}
          drafts={drafts}
          onChangeBudget={handleChangeBudget}
        />
        <BudgetGroup
          title="支出"
          rows={expenseBudgets}
          drafts={drafts}
          onChangeBudget={handleChangeBudget}
        />
      </div>
    </div>
  );
}

function BudgetGroup({
  title,
  rows,
  drafts,
  onChangeBudget,
}: {
  title: string;
  rows: HouseholdBudget[];
  drafts: Record<string, string>;
  onChangeBudget: (category: string, value: string) => void;
}) {
  const budgetOptions = Array.from({ length: 501 }, (_, index) => index * 1000);

  return (
    <section className="mb-4 last:mb-0">
      <h3 className="mb-2 text-sm font-black text-[#5b4630]">{title}</h3>
      <div className="space-y-2">
        {rows.map((budget) => (
          <label
            key={budget.category}
            className="grid grid-cols-1 items-center gap-2 rounded-lg border border-[#f0e7d8] bg-[#fbfaf7] px-3 py-2 min-[380px]:grid-cols-[minmax(0,1fr)_118px] sm:grid-cols-[minmax(0,1fr)_140px]"
          >
            <span className="text-sm font-bold text-[#24190f]">
              {budget.category}
            </span>
            <select
              value={toDigits(drafts[budget.category] ?? "0")}
              onChange={(e) => onChangeBudget(budget.category, e.target.value)}
              className="h-10 rounded-md border border-[#d7c7aa] bg-white px-2 text-right text-sm font-bold text-[#24190f]"
            >
              {budgetOptions.map((value) => (
                <option key={value} value={String(value)}>
                  {yen(value)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
