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

type MonthOverview = {
  month: string;
  incomeBudget: number;
  expenseBudget: number;
  incomeActual: number;
  expenseActual: number;
  balance: number;
};

const TEMPLATE_STORAGE_KEY = "household.recurringTemplates.v2";
const LEGACY_TEMPLATE_STORAGE_KEY = "household.recurringTemplates.v1";
const TEMPLATE_GLOBAL_ENABLED_KEY = "household.recurringTemplates.globalEnabled.v1";

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

function getRecentMonths(count = 12) {
  const base = new Date(`${currentMonthString()}-01T00:00:00`);
  return Array.from({ length: count }, (_, index) => {
    const d = new Date(base);
    d.setMonth(base.getMonth() - index);
    return d.toISOString().slice(0, 7);
  });
}

function getTemplateTransactions(templates: TemplateDraft[], globalEnabled: boolean): HouseholdTransaction[] {
  if (!globalEnabled) return [];
  return templates
    .filter((item) => item.enabled && item.category && Number(toDigits(item.amount)) > 0)
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
  const [templates, setTemplates] = useState<TemplateDraft[]>(makeDefaultTemplates);
  const [templatesEnabled, setTemplatesEnabled] = useState(true);
  const [monthOverviews, setMonthOverviews] = useState<MonthOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const touchStartY = useRef<number | null>(null);

  async function reload(options?: { showLoading?: boolean; keepScroll?: boolean }) {
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
      setMessage(error instanceof Error ? error.message : "データ取得に失敗しました");
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
        getRecentMonths().map(async (targetMonth) => {
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
          const incomeActual = totalByType(monthTransactions, "income");
          const expenseActual = totalByType(monthTransactions, "expense");
          return {
            month: targetMonth,
            incomeBudget,
            expenseBudget,
            incomeActual,
            expenseActual,
            balance: incomeActual - expenseActual,
          };
        })
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

  const fixedTemplateTransactions = useMemo(
    () => getTemplateTransactions(templates, templatesEnabled),
    [templates, templatesEnabled]
  );
  const homeTransactions = useMemo(
    () => [...transactions, ...fixedTemplateTransactions],
    [transactions, fixedTemplateTransactions]
  );
  const income = useMemo(() => totalByType(transactions, "income"), [transactions]);
  const expense = useMemo(() => totalByType(transactions, "expense"), [transactions]);
  const homeIncome = useMemo(() => totalByType(homeTransactions, "income"), [homeTransactions]);
  const homeExpense = useMemo(() => totalByType(homeTransactions, "expense"), [homeTransactions]);
  const incomeRows = useMemo(
    () => makeSummaryRows(homeTransactions, budgets, "income"),
    [homeTransactions, budgets]
  );
  const expenseRows = useMemo(
    () => makeSummaryRows(homeTransactions, budgets, "expense"),
    [homeTransactions, budgets]
  );

  return (
    <LoginGate>
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="min-h-screen bg-[#f7f3eb] px-3 pb-24 pt-4 sm:px-6 lg:px-8 lg:py-8"
      >
        <div className="mx-auto w-full max-w-7xl">
          <header className="mb-4 rounded-[24px] border border-[#e6dcc8] bg-white p-4 shadow-sm sm:mb-6 sm:rounded-[28px] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black tracking-[0.28em] text-[#8a6a3f]">
                  HOUSEHOLD BOOK
                </p>
                <h1 className="mt-2 text-2xl font-black text-[#24190f] sm:text-4xl">
                  家計簿
                </h1>
                <p className="mt-2 text-sm font-bold leading-relaxed text-[#6b7280]">
                  ホーム・入力・予算・履歴に分けて、スマホで使いやすく整理しています。
                </p>
              </div>

              <label className="block w-full lg:w-auto">
                <span className="mb-1 block text-xs font-bold text-[#6b7280]">表示月</span>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#d7c7aa] bg-white px-3 text-base font-bold text-[#24190f] lg:w-auto"
                />
              </label>
            </div>
          </header>

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
                  month={month}
                  income={homeIncome}
                  expense={homeExpense}
                  budgets={budgets}
                  incomeRows={incomeRows}
                  expenseRows={expenseRows}
                  templates={templates}
                  templatesEnabled={templatesEnabled}
                  setTemplates={setTemplates}
                  setTemplatesEnabled={setTemplatesEnabled}
                />
              )}

              {activeTab === "input" && (
                <InputTab
                  month={month}
                  setMonth={setMonth}
                  transactions={transactions}
                  income={income}
                  expense={expense}
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

              {activeTab === "history" && <HistoryTab overviews={monthOverviews} />}
            </div>
          )}
        </div>
      </main>
    </LoginGate>
  );
}

function TabNav({ activeTab, onChange }: { activeTab: AppTab; onChange: (tab: AppTab) => void }) {
  return (
    <nav className="sticky top-2 z-20 mb-4 grid grid-cols-4 gap-1 rounded-2xl border border-[#e6dcc8] bg-white/95 p-1 shadow-sm backdrop-blur lg:static lg:max-w-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-black sm:text-xs ${
              active ? "bg-[#5b4630] text-white" : "text-[#6b7280] active:bg-[#f3eadb]"
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
  month,
  income,
  expense,
  budgets,
  incomeRows,
  expenseRows,
  templates,
  templatesEnabled,
  setTemplates,
  setTemplatesEnabled,
}: {
  month: string;
  income: number;
  expense: number;
  budgets: HouseholdBudget[];
  incomeRows: SummaryRow[];
  expenseRows: SummaryRow[];
  templates: TemplateDraft[];
  templatesEnabled: boolean;
  setTemplates: React.Dispatch<React.SetStateAction<TemplateDraft[]>>;
  setTemplatesEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const incomeBudget = budgets
    .filter((b) => incomeCategories.includes(b.category as any))
    .reduce((sum, b) => sum + b.budget, 0);
  const expenseBudget = budgets
    .filter((b) => expenseCategories.includes(b.category as any))
    .reduce((sum, b) => sum + b.budget, 0);

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiCard label="収入" value={income} tone="green" />
        <KpiCard label="支出" value={expense} tone="red" />
        <KpiCard label="残り" value={income - expense} tone="dark" />
      </section>

      <BudgetActualGraphCard
        title={`${getMonthLabel(month)}の収支`}
        incomeBudget={incomeBudget}
        incomeActual={income}
        expenseBudget={expenseBudget}
        expenseActual={expense}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SummaryTable title="収入の予算比較" rows={incomeRows} type="income" />
        <SummaryTable title="支出の予算比較" rows={expenseRows} type="expense" />
      </div>

      <FixedTemplatePanel
        templates={templates}
        templatesEnabled={templatesEnabled}
        setTemplates={setTemplates}
        setTemplatesEnabled={setTemplatesEnabled}
      />
    </div>
  );
}

function InputTab({
  month,
  setMonth,
  transactions,
  income,
  expense,
  onChanged,
  setMessage,
}: {
  month: string;
  setMonth: (month: string) => void;
  transactions: HouseholdTransaction[];
  income: number;
  expense: number;
  onChanged: () => Promise<void>;
  setMessage: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <div className="space-y-4">
        <MonthPicker month={month} setMonth={setMonth} />
        <InputPanel onAdded={onChanged} setMessage={setMessage} />
      </div>
      <div className="space-y-4">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard label="履歴の収入" value={income} tone="green" />
          <KpiCard label="履歴の支出" value={expense} tone="red" />
          <KpiCard label="履歴の残り" value={income - expense} tone="dark" />
        </section>
        <HistoryTable transactions={transactions} onChanged={onChanged} setMessage={setMessage} />
      </div>
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
  const incomeBudget = incomeRows.reduce((sum, r) => sum + r.budget, 0);
  const incomeActual = incomeRows.reduce((sum, r) => sum + r.actual, 0);
  const expenseBudget = expenseRows.reduce((sum, r) => sum + r.budget, 0);
  const expenseActual = expenseRows.reduce((sum, r) => sum + r.actual, 0);

  return (
    <div className="space-y-4">
      <BudgetActualGraphCard
        title={`${getMonthLabel(month)}の予算`}
        incomeBudget={incomeBudget}
        incomeActual={incomeActual}
        expenseBudget={expenseBudget}
        expenseActual={expenseActual}
      />
      <BudgetPanel month={month} budgets={budgets} onSaved={onSaved} setMessage={setMessage} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SummaryTable title="収入予算" rows={incomeRows} type="income" />
        <SummaryTable title="支出予算" rows={expenseRows} type="expense" />
      </div>
    </div>
  );
}

function HistoryTab({ overviews }: { overviews: MonthOverview[] }) {
  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#eee4d2] px-4 py-3 sm:px-5 sm:py-4">
        <ListChecks size={18} className="text-[#8a6a3f]" />
        <div>
          <h2 className="text-lg font-black text-[#24190f]">月別履歴</h2>
          <p className="mt-1 text-xs font-bold text-[#6b7280]">固定費テンプレートは含めず、実際に入力した履歴だけを集計します。</p>
        </div>
      </div>

      <div className="hidden overflow-auto lg:block">
        <table className="w-full text-sm">
          <thead className="bg-[#fbfaf7] text-left text-xs font-bold text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">月</th>
              <th className="px-4 py-3 text-right">収入予算</th>
              <th className="px-4 py-3 text-right">収入実績</th>
              <th className="px-4 py-3 text-right">支出予算</th>
              <th className="px-4 py-3 text-right">支出実績</th>
              <th className="px-4 py-3 text-right">収支</th>
            </tr>
          </thead>
          <tbody>
            {overviews.map((row) => (
              <tr key={row.month} className="border-t border-[#f0e7d8]">
                <td className="px-4 py-3 font-bold text-[#24190f]">{getMonthLabel(row.month)}</td>
                <td className="px-4 py-3 text-right">{yen(row.incomeBudget)}</td>
                <td className="px-4 py-3 text-right font-bold text-[#047857]">{yen(row.incomeActual)}</td>
                <td className="px-4 py-3 text-right">{yen(row.expenseBudget)}</td>
                <td className="px-4 py-3 text-right font-bold text-[#b42318]">{yen(row.expenseActual)}</td>
                <td className={`px-4 py-3 text-right font-black ${row.balance < 0 ? "text-[#b42318]" : "text-[#047857]"}`}>{yen(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-3 lg:hidden">
        {overviews.map((row) => (
          <div key={row.month} className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-black text-[#24190f]">{getMonthLabel(row.month)}</p>
              <p className={`text-lg font-black ${row.balance < 0 ? "text-[#b42318]" : "text-[#047857]"}`}>{yen(row.balance)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <MiniStat label="収入予算" value={row.incomeBudget} />
              <MiniStat label="収入実績" value={row.incomeActual} tone="green" />
              <MiniStat label="支出予算" value={row.expenseBudget} />
              <MiniStat label="支出実績" value={row.expenseActual} tone="red" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthPicker({ month, setMonth }: { month: string; setMonth: (month: string) => void }) {
  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm">
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-[#6b7280]">表示月</span>
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
    tone === "green" ? "text-[#047857]" : tone === "red" ? "text-[#b42318]" : "text-[#24190f]";

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
  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-[#8a6a3f]" />
        <h2 className="text-lg font-black text-[#24190f]">{title}</h2>
      </div>
      <div className="space-y-5">
        <CenterBarRow label="予算" leftLabel="収入予算" rightLabel="支出予算" leftValue={incomeBudget} rightValue={expenseBudget} />
        <CenterBarRow label="実費" leftLabel="収入実績" rightLabel="支出実績" leftValue={incomeActual} rightValue={expenseActual} />
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
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  rightValue: number;
}) {
  const maxValue = Math.max(leftValue, rightValue, 1);
  const leftWidth = Math.min(100, (leftValue / maxValue) * 100);
  const rightWidth = Math.min(100, (rightValue / maxValue) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-black text-[#6b7280]">
        <span>{leftLabel}: {yen(leftValue)}</span>
        <span className="rounded-full bg-[#f3eadb] px-2 py-1 text-[#5b4630]">{label}</span>
        <span>{rightLabel}: {yen(rightValue)}</span>
      </div>
      <div className="relative grid h-9 grid-cols-2 overflow-hidden rounded-full bg-[#f3eadb]">
        <div className="relative flex justify-end border-r border-white/90">
          <div className="h-full rounded-l-full bg-[#a7c4ad]" style={{ width: `${leftWidth}%` }} />
        </div>
        <div className="relative flex justify-start">
          <div className="h-full rounded-r-full bg-[#d7a19a]" style={{ width: `${rightWidth}%` }} />
        </div>
        <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white" />
      </div>
      <div className="mt-1 grid grid-cols-2 text-[11px] font-bold text-[#8a6a3f]">
        <span>← 収入</span>
        <span className="text-right">支出 →</span>
      </div>
    </div>
  );
}

function InputPanel({
  onAdded,
  setMessage,
}: {
  onAdded: () => Promise<void>;
  setMessage: (value: string) => void;
}) {
  const [type, setType] = useState<TransactionType>("expense");
  const [date, setDate] = useState(todayString());
  const [category, setCategory] = useState("食費");
  const [subcategory, setSubcategory] = useState("");
  const [amount, setAmount] = useState("");

  const categories = type === "income" ? incomeCategories : expenseCategories;

  useEffect(() => {
    setCategory(type === "income" ? "給与" : "食費");
    setSubcategory("");
  }, [type]);

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
          <button type="button" onClick={() => setType("expense")} className={`rounded-lg py-2 text-sm font-black ${type === "expense" ? "bg-white text-[#b42318] shadow-sm" : "text-[#6b7280]"}`}>支出</button>
          <button type="button" onClick={() => setType("income")} className={`rounded-lg py-2 text-sm font-black ${type === "income" ? "bg-white text-[#047857] shadow-sm" : "text-[#6b7280]"}`}>収入</button>
        </div>

        <Field label="日付">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-desktop" />
        </Field>

        <Field label="金額">
          <input inputMode="numeric" value={formatNumber(amount)} onChange={(e) => setAmount(toDigits(e.target.value))} placeholder="金額を入力" className="input-desktop text-right" />
        </Field>

        <Field label="大分類">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }} className="input-desktop">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="小分類">
          <input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="小分類を入力" className="input-desktop" />
          <div className="mt-2 flex flex-wrap gap-2">
            {frequentSubcategories[type].map((item) => (
              <button key={item} type="button" onClick={() => setSubcategory(item)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${subcategory === item ? "border-[#5b4630] bg-[#5b4630] text-white" : "border-[#e6dcc8] bg-[#fbfaf7] text-[#5b4630] active:bg-[#f3eadb]"}`}>{item}</button>
            ))}
          </div>
        </Field>

        <button type="submit" className="w-full rounded-xl bg-[#5b4630] py-3 text-sm font-black text-white active:scale-[0.99]">保存</button>
      </form>
    </div>
  );
}

function FixedTemplatePanel({
  templates,
  templatesEnabled,
  setTemplates,
  setTemplatesEnabled,
}: {
  templates: TemplateDraft[];
  templatesEnabled: boolean;
  setTemplates: React.Dispatch<React.SetStateAction<TemplateDraft[]>>;
  setTemplatesEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const activeTotal = templates
    .filter((item) => item.enabled && item.type === "expense")
    .reduce((sum, item) => sum + Number(toDigits(item.amount)), 0);

  function updateTemplate(id: string, patch: Partial<TemplateDraft>) {
    setTemplates((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addTemplateRow() {
    setTemplates((current) => [
      ...current,
      { id: `template-${Date.now()}`, type: "expense", category: "その他(支出)", subcategory: "", amount: "", enabled: true },
    ]);
  }

  function deleteTemplateRow(id: string) {
    setTemplates((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#24190f]">固定費テンプレート</h2>
          <p className="mt-1 text-xs font-bold text-[#6b7280]">ホームの収支に反映します。入力履歴には含めません。</p>
        </div>
        <button type="button" onClick={() => setTemplatesEnabled((v) => !v)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${templatesEnabled ? "bg-[#5b4630] text-white" : "bg-[#e5ded1] text-[#6b7280]"}`}>全体 {templatesEnabled ? "ON" : "OFF"}</button>
      </div>

      <div className="mb-3 rounded-xl bg-[#fbfaf7] p-3 text-sm font-black text-[#5b4630]">ONの固定費合計: {yen(templatesEnabled ? activeTotal : 0)}</div>

      <div className="space-y-3">
        {templates.map((template) => {
          const templateCategories = template.type === "income" ? incomeCategories : expenseCategories;
          return (
            <div key={template.id} className={`rounded-xl border p-3 ${template.enabled && templatesEnabled ? "border-[#e6dcc8] bg-[#fbfaf7]" : "border-[#e5ded1] bg-[#f8f6f1] opacity-70"}`}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <button type="button" onClick={() => updateTemplate(template.id, { enabled: !template.enabled })} className={`rounded-full px-3 py-1.5 text-xs font-black ${template.enabled ? "bg-[#5b4630] text-white" : "bg-[#e5ded1] text-[#6b7280]"}`}>{template.enabled ? "ON" : "OFF"}</button>
                <button type="button" onClick={() => deleteTemplateRow(template.id)} className="rounded-md border border-[#ead8d4] bg-white px-3 py-1.5 text-xs font-black text-[#b42318]">削除</button>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <select value={template.type} onChange={(e) => { const nextType = e.target.value as TransactionType; updateTemplate(template.id, { type: nextType, category: nextType === "income" ? "給与" : "その他(支出)" }); }} className="input-desktop h-10 py-1 text-sm">
                  <option value="expense">支出</option>
                  <option value="income">収入</option>
                </select>
                <select value={template.category} onChange={(e) => updateTemplate(template.id, { category: e.target.value })} className="input-desktop h-10 py-1 text-sm">
                  {templateCategories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                <input value={template.subcategory} onChange={(e) => updateTemplate(template.id, { subcategory: e.target.value })} placeholder="項目名" className="input-desktop h-10 py-1 text-sm" />
                <input inputMode="numeric" value={formatNumber(template.amount)} onChange={(e) => updateTemplate(template.id, { amount: toDigits(e.target.value) })} placeholder="金額" className="input-desktop h-10 py-1 text-right text-sm" />
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" onClick={addTemplateRow} className="mt-3 w-full rounded-xl border border-[#d7c7aa] bg-white py-3 text-sm font-black text-[#5b4630] active:bg-[#f3eadb]">固定費を追加</button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-[#6b7280]">{label}</span>
      {children}
    </label>
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
  const [draft, setDraft] = useState({ date: "", type: "expense" as TransactionType, category: "食費", subcategory: "", amount: "" });

  function startEdit(t: HouseholdTransaction) {
    setEditingId(t.id);
    setDraft({ date: t.date, type: t.type, category: t.category, subcategory: t.subcategory || "", amount: String(t.amount) });
  }

  async function handleSaveEdit(id: string) {
    const numericAmount = Number(toDigits(draft.amount));
    if (!draft.date || !draft.category || numericAmount <= 0) {
      setMessage("編集内容を確認してください");
      return;
    }
    try {
      await updateTransaction(id, { date: draft.date, type: draft.type, category: draft.category, subcategory: draft.subcategory, amount: numericAmount, memo: "" });
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
        <p className="text-sm font-black text-[#6b7280]">{transactions.length}件</p>
      </div>

      <div className="space-y-2 p-3">
        {transactions.length === 0 ? (
          <div className="rounded-xl bg-[#fbfaf7] px-4 py-8 text-center text-sm font-bold text-[#6b7280]">この月の記録はまだありません。</div>
        ) : (
          transactions.map((t) => {
            const isEditing = editingId === t.id;
            const categories = draft.type === "income" ? incomeCategories : expenseCategories;
            return (
              <div key={t.id} className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="input-desktop h-10" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={draft.type} onChange={(e) => { const nextType = e.target.value as TransactionType; setDraft({ ...draft, type: nextType, category: nextType === "income" ? "給与" : "食費" }); }} className="input-desktop h-10 py-1 text-sm">
                        <option value="expense">支出</option>
                        <option value="income">収入</option>
                      </select>
                      <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="input-desktop h-10 py-1 text-sm">
                        {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
                      <input value={draft.subcategory} onChange={(e) => setDraft({ ...draft, subcategory: e.target.value })} className="input-desktop h-10 py-1 text-sm" />
                      <input inputMode="numeric" value={formatNumber(draft.amount)} onChange={(e) => setDraft({ ...draft, amount: toDigits(e.target.value) })} className="input-desktop h-10 py-1 text-right text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-[#d7c7aa] bg-white py-2 text-xs font-black text-[#5b4630]">キャンセル</button>
                      <button type="button" onClick={() => handleSaveEdit(t.id)} className="rounded-lg bg-[#5b4630] py-2 text-xs font-black text-white">保存</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#6b7280]">{t.date}</p>
                        <p className="mt-1 text-sm font-black text-[#24190f]">{t.subcategory || t.category}</p>
                        <p className="mt-1 text-xs font-bold text-[#6b7280]">{t.category}</p>
                      </div>
                      <div className={`text-right text-base font-black ${t.type === "income" ? "text-[#047857]" : "text-[#b42318]"}`}>{t.type === "income" ? "+" : "-"}{yen(t.amount)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${t.type === "income" ? "bg-[#e8f7ef] text-[#047857]" : "bg-[#fff0ed] text-[#b42318]"}`}>{t.type === "income" ? "収入" : "支出"}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(t)} className="inline-flex items-center gap-1 rounded-md border border-[#d7c7aa] bg-white px-3 py-2 text-xs font-black text-[#5b4630] active:bg-[#f3eadb]"><Pencil size={14} />編集</button>
                        <button type="button" onClick={() => handleDelete(t.id)} className="inline-flex items-center gap-1 rounded-md border border-[#ead8d4] bg-white px-3 py-2 text-xs font-black text-[#b42318] active:bg-[#fff0ed]"><Trash2 size={14} />削除</button>
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

function SummaryTable({ title, rows, type }: { title: string; rows: SummaryRow[]; type: TransactionType }) {
  const totalBudget = rows.reduce((sum, r) => sum + r.budget, 0);
  const totalActual = rows.reduce((sum, r) => sum + r.actual, 0);
  const totalDiff = type === "income" ? totalActual - totalBudget : totalBudget - totalActual;
  const diffLabel = type === "expense" ? "残り" : "差額";
  const totalLabel = type === "expense" ? "合計残り" : "合計差額";

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#eee4d2] px-4 py-3 sm:px-5 sm:py-4">
        <BarChart3 size={18} className="text-[#8a6a3f]" />
        <h2 className="text-lg font-black text-[#24190f]">{title}</h2>
      </div>
      <div className="space-y-2 p-3">
        {rows.map((row) => (
          <div key={row.category} className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-black text-[#24190f]">{row.category}</p>
              <div className="text-right">
                <p className="text-[11px] font-black text-[#6b7280]">{diffLabel}</p>
                <p className={`font-black ${row.diff < 0 ? "text-[#b42318]" : "text-[#047857]"}`}>{yen(row.diff)}</p>
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
            <span className={totalDiff < 0 ? "text-[#b42318]" : "text-[#047857]"}>{yen(totalDiff)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone?: "green" | "red" }) {
  const color = tone === "green" ? "text-[#047857]" : tone === "red" ? "text-[#b42318]" : "text-[#24190f]";
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
  const incomeBudgets = budgets.filter((b) => incomeCategories.includes(b.category as any));
  const expenseBudgets = budgets.filter((b) => expenseCategories.includes(b.category as any));

  useEffect(() => {
    setDrafts(Object.fromEntries(budgets.map((b) => [b.category, String(b.budget)])));
  }, [budgets]);

  async function handleSave() {
    try {
      const next = budgets.map((b) => ({ ...b, month, budget: Number(toDigits(drafts[b.category] || "0")) }));
      await saveBudgets(month, next);
      setMessage("予算を保存しました");
      await onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "予算保存に失敗しました");
    }
  }

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <WalletCards size={18} className="text-[#8a6a3f]" />
        <h2 className="text-lg font-black text-[#24190f]">月別予算</h2>
      </div>
      <BudgetGroup title="収入予算" rows={incomeBudgets} drafts={drafts} setDrafts={setDrafts} />
      <BudgetGroup title="支出予算" rows={expenseBudgets} drafts={drafts} setDrafts={setDrafts} />
      <button type="button" onClick={handleSave} className="mt-4 w-full rounded-xl bg-[#5b4630] py-3 text-sm font-black text-white active:scale-[0.99]">予算を保存</button>
    </div>
  );
}

function BudgetGroup({
  title,
  rows,
  drafts,
  setDrafts,
}: {
  title: string;
  rows: HouseholdBudget[];
  drafts: Record<string, string>;
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  return (
    <section className="mb-4 last:mb-0">
      <h3 className="mb-2 text-sm font-black text-[#5b4630]">{title}</h3>
      <div className="space-y-2">
        {rows.map((budget) => (
          <label key={budget.category} className="grid grid-cols-1 items-center gap-2 rounded-lg border border-[#f0e7d8] bg-[#fbfaf7] px-3 py-2 min-[380px]:grid-cols-[minmax(0,1fr)_118px] sm:grid-cols-[minmax(0,1fr)_140px]">
            <span className="text-sm font-bold text-[#24190f]">{budget.category}</span>
            <input inputMode="numeric" value={formatNumber(drafts[budget.category] ?? "")} onChange={(e) => setDrafts((current) => ({ ...current, [budget.category]: toDigits(e.target.value) }))} className="h-10 rounded-md border border-[#d7c7aa] bg-white px-2 text-right text-sm font-bold text-[#24190f]" />
          </label>
        ))}
      </div>
    </section>
  );
}
