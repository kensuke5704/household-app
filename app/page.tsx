"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, WalletCards } from "lucide-react";
import {
  expenseCategories,
  incomeCategories,
  recurringTemplates,
} from "@/lib/categories";
import {
  getBudgets,
  getTransactions,
  saveBudgets,
  seedInitialHouseholdData,
} from "@/lib/householdStore";
import {
  currentMonthString,
  makeSummaryRows,
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
import ConfirmDialog from "@/components/household/ConfirmDialog";
import MonthHeader from "@/components/household/MonthHeader";
import ProfileTab from "@/components/household/ProfileTab";
import HomeTab from "@/components/household/HomeTab";
import BudgetTab from "@/components/household/BudgetTab";
import InputTab from "@/components/household/InputTab";
import HistoryTab from "@/components/household/HistoryTab";
import TabNav from "@/components/household/TabNav";
import type { AppTab, CategoryOverview, MonthOverview, TemplateDraft } from "@/components/household/types";
import type { ConfirmDialogState, ConfirmFn, ConfirmOptions } from "@/components/household/ConfirmDialog";




const TEMPLATE_STORAGE_KEY = "household.recurringTemplates.v2";
const LEGACY_TEMPLATE_STORAGE_KEY = "household.recurringTemplates.v1";
const TEMPLATE_GLOBAL_ENABLED_KEY =
  "household.recurringTemplates.globalEnabled.v1";
const QUICK_SUBCATEGORY_STORAGE_KEY = "household.quickSubcategories.v1";
const ACTIVE_USER_KEY = "household.auth.userKey";

function getActiveUserScope() {
  if (typeof window === "undefined") return "personal";
  return window.localStorage.getItem(ACTIVE_USER_KEY) || "personal";
}

function scopedStorageKey(key: string) {
  return `${key}.${getActiveUserScope()}`;
}

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
  return window.localStorage.getItem(scopedStorageKey(TEMPLATE_GLOBAL_ENABLED_KEY)) !== "false";
}

function writeGlobalTemplateEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedStorageKey(TEMPLATE_GLOBAL_ENABLED_KEY), String(enabled));
}

function readQuickSubcategories(): Record<TransactionType, string[]> {
  if (typeof window === "undefined") return frequentSubcategories;
  try {
    const raw = window.localStorage.getItem(scopedStorageKey(QUICK_SUBCATEGORY_STORAGE_KEY));
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
  window.localStorage.setItem(scopedStorageKey(QUICK_SUBCATEGORY_STORAGE_KEY), JSON.stringify(items));
}

function signedYen(value: number) {
  return `${value >= 0 ? "+" : ""}${yen(value)}`;
}

function readTemplateDrafts(): TemplateDraft[] {
  if (typeof window === "undefined") return makeDefaultTemplates();

  const raw =
    window.localStorage.getItem(scopedStorageKey(TEMPLATE_STORAGE_KEY)) ||
    window.localStorage.getItem(scopedStorageKey(LEGACY_TEMPLATE_STORAGE_KEY)) ||
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
  window.localStorage.setItem(scopedStorageKey(TEMPLATE_STORAGE_KEY), JSON.stringify(templates));
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
  const [activeTab, setActiveTab] = useState<AppTab>("input");
  const [month, setMonth] = useState(currentMonthString());
  const [transactions, setTransactions] = useState<HouseholdTransaction[]>([]);
  const [budgets, setBudgets] = useState<HouseholdBudget[]>([]);
  const [templates, setTemplates] =
    useState<TemplateDraft[]>(makeDefaultTemplates);
  const [templatesEnabled, setTemplatesEnabled] = useState(true);
  const [monthOverviews, setMonthOverviews] = useState<MonthOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);
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
      await seedInitialHouseholdData();
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

  function requestConfirm(options: ConfirmOptions) {
    return new Promise<boolean>((resolve) => {
      setConfirmDialog({ ...options, onResolve: resolve });
    });
  }

  function closeConfirmDialog(confirmed: boolean) {
    confirmDialog?.onResolve(confirmed);
    setConfirmDialog(null);
  }

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
          {activeTab !== "history" && activeTab !== "profile" && (
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
                  requestConfirm={requestConfirm}
                />
              )}

              {activeTab === "budget" && (
                <BudgetTab incomeRows={incomeRows} expenseRows={expenseRows}>
                  <BudgetPanel
                    month={month}
                    budgets={budgets}
                    onSaved={refreshWithoutJump}
                    setMessage={setMessage}
                    requestConfirm={requestConfirm}
                  />
                </BudgetTab>
              )}

              {activeTab === "history" && (
                <HistoryTab overviews={monthOverviews} />
              )}

              {activeTab === "profile" && <ProfileTab />}
            </div>
          )}
        </div>
        {confirmDialog && (
          <ConfirmDialog
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmLabel={confirmDialog.confirmLabel}
            cancelLabel={confirmDialog.cancelLabel}
            onConfirm={() => closeConfirmDialog(true)}
            onCancel={() => closeConfirmDialog(false)}
          />
        )}
      </main>
    </LoginGate>
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
  requestConfirm,
}: {
  month: string;
  budgets: HouseholdBudget[];
  onSaved: () => Promise<void>;
  setMessage: (value: string) => void;
  requestConfirm: ConfirmFn;
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
    const applyFollowing = await requestConfirm({
      title: "以降の月にも反映しますか？",
      message: `${getMonthLabel(month)}以降の予算にも同じ変更を反映します。`,
      confirmLabel: "以降にも反映",
      cancelLabel: "この月のみ",
    });
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
