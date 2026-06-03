"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";
import {
  expenseCategories,
  incomeCategories,
  recurringTemplates,
} from "@/lib/categories";
import {
  addTransaction,
  addTransactions,
  deleteTransaction,
  getBudgets,
  getTransactions,
  saveBudgets,
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

type TemplateDraft = {
  id: string;
  type: TransactionType;
  category: string;
  subcategory: string;
  amount: string;
};

const TEMPLATE_STORAGE_KEY = "household.recurringTemplates.v1";

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

function readTemplateDrafts(): TemplateDraft[] {
  if (typeof window === "undefined") return makeDefaultTemplates();

  const raw = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
  if (!raw) return makeDefaultTemplates();

  try {
    const parsed = JSON.parse(raw) as TemplateDraft[];
    if (!Array.isArray(parsed)) return makeDefaultTemplates();
    return parsed.map((item, index) => ({
      id: item.id || `template-${index}`,
      type: item.type === "income" ? "income" : "expense",
      category: item.category || "その他(支出)",
      subcategory: item.subcategory || "",
      amount: toDigits(item.amount || ""),
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
  }));
}

export default function Page() {
  const [month, setMonth] = useState(currentMonthString());
  const [transactions, setTransactions] = useState<HouseholdTransaction[]>([]);
  const [budgets, setBudgets] = useState<HouseholdBudget[]>([]);
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

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

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

  const income = useMemo(() => totalByType(transactions, "income"), [transactions]);
  const expense = useMemo(() => totalByType(transactions, "expense"), [transactions]);
  const balance = income - expense;
  const incomeRows = useMemo(
    () => makeSummaryRows(transactions, budgets, "income"),
    [transactions, budgets]
  );
  const expenseRows = useMemo(
    () => makeSummaryRows(transactions, budgets, "expense"),
    [transactions, budgets]
  );

  return (
    <LoginGate>
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="min-h-screen bg-[#f7f3eb] px-3 py-4 sm:px-6 lg:px-8 lg:py-8"
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
                  入力・履歴・予算集計をスマホでも使いやすく整理しています。
                </p>
              </div>

              <label className="block w-full lg:w-auto">
                <span className="mb-1 block text-xs font-bold text-[#6b7280]">
                  表示月
                </span>
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

          <nav className="mobile-section-nav lg:hidden">
            <a href="#input">入力</a>
            <a href="#history">履歴</a>
            <a href="#summary">集計</a>
            <a href="#budget">予算</a>
          </nav>

          {loading ? (
            <div className="rounded-2xl border border-[#e6dcc8] bg-white px-4 py-10 text-center text-sm font-bold text-[#6b7280]">
              読み込み中...
            </div>
          ) : (
            <>
              <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <KpiCard label="収入" value={income} tone="green" />
                <KpiCard label="支出" value={expense} tone="red" />
                <KpiCard label="残高" value={balance} tone="dark" />
              </section>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
                <div id="input" className="space-y-4 scroll-mt-4">
                  <InputPanel
                    month={month}
                    onAdded={refreshWithoutJump}
                    setMessage={setMessage}
                  />
                  <div id="budget" className="scroll-mt-4">
                    <BudgetPanel
                      month={month}
                      budgets={budgets}
                      onSaved={refreshWithoutJump}
                      setMessage={setMessage}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div id="history" className="scroll-mt-4">
                    <HistoryTable
                      transactions={transactions}
                      onDeleted={refreshWithoutJump}
                      setMessage={setMessage}
                    />
                  </div>
                  <div id="summary" className="grid grid-cols-1 gap-4 scroll-mt-4 xl:grid-cols-2">
                    <SummaryTable title="収入集計" rows={incomeRows} type="income" />
                    <SummaryTable title="支出集計" rows={expenseRows} type="expense" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </LoginGate>
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

function InputPanel({
  month,
  onAdded,
  setMessage,
}: {
  month: string;
  onAdded: () => Promise<void>;
  setMessage: (value: string) => void;
}) {
  const [type, setType] = useState<TransactionType>("expense");
  const [date, setDate] = useState(todayString());
  const [category, setCategory] = useState("食費");
  const [subcategory, setSubcategory] = useState("");
  const [amount, setAmount] = useState("");
  const [templates, setTemplates] = useState<TemplateDraft[]>(makeDefaultTemplates);

  const categories = type === "income" ? incomeCategories : expenseCategories;

  useEffect(() => {
    setCategory(type === "income" ? "給与" : "食費");
  }, [type]);

  useEffect(() => {
    setTemplates(readTemplateDrafts());
  }, []);

  useEffect(() => {
    writeTemplateDrafts(templates);
  }, [templates]);

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

  async function addFixedCosts() {
    const activeTemplates = templates
      .map((item) => ({
        ...item,
        amount: toDigits(item.amount),
      }))
      .filter((item) => item.category && item.subcategory && Number(item.amount) > 0);

    if (activeTemplates.length === 0) {
      setMessage("追加できる固定費テンプレートがありません");
      return;
    }

    try {
      await addTransactions(
        activeTemplates.map((item) => ({
          date: `${month}-01`,
          type: item.type,
          category: item.category,
          subcategory: item.subcategory,
          amount: Number(item.amount),
          memo: "",
        }))
      );
      setMessage("固定費テンプレートを追加しました");
      await onAdded();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "固定費追加に失敗しました");
    }
  }

  function updateTemplate(id: string, patch: Partial<TemplateDraft>) {
    setTemplates((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
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
      },
    ]);
  }

  function deleteTemplateRow(id: string) {
    setTemplates((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Plus size={18} className="text-[#8a6a3f]" />
        <h2 className="text-lg font-black text-[#24190f]">入力</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f3eadb] p-1">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`rounded-lg py-2 text-sm font-black ${
              type === "expense"
                ? "bg-white text-[#b42318] shadow-sm"
                : "text-[#6b7280]"
            }`}
          >
            支出
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`rounded-lg py-2 text-sm font-black ${
              type === "income"
                ? "bg-white text-[#047857] shadow-sm"
                : "text-[#6b7280]"
            }`}
          >
            収入
          </button>
        </div>

        <Field label="日付">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-desktop"
          />
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
            onChange={(e) => setCategory(e.target.value)}
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
            {frequentSubcategories[type].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSubcategory(item)}
                className="rounded-full border border-[#e6dcc8] bg-[#fbfaf7] px-3 py-1.5 text-xs font-bold text-[#5b4630] active:bg-[#f3eadb]"
              >
                {item}
              </button>
            ))}
          </div>
        </Field>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#5b4630] py-3 text-sm font-black text-white active:scale-[0.99]"
        >
          保存
        </button>
      </form>

      <div className="mt-5 rounded-2xl border border-[#eee4d2] bg-[#fbfaf7] p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-[#24190f]">固定費テンプレート</h3>
            <p className="mt-1 text-xs font-bold text-[#6b7280]">
              金額・分類・項目名を編集できます。
            </p>
          </div>
          <button
            type="button"
            onClick={addTemplateRow}
            className="shrink-0 rounded-lg border border-[#d7c7aa] bg-white px-3 py-2 text-xs font-black text-[#5b4630]"
          >
            追加
          </button>
        </div>

        <div className="space-y-3">
          {templates.map((template) => {
            const templateCategories =
              template.type === "income" ? incomeCategories : expenseCategories;

            return (
              <div
                key={template.id}
                className="rounded-xl border border-[#e6dcc8] bg-white p-3"
              >
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
                    onChange={(e) => updateTemplate(template.id, { category: e.target.value })}
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
                      updateTemplate(template.id, { amount: toDigits(e.target.value) })
                    }
                    placeholder="金額"
                    className="input-desktop h-10 py-1 text-right text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => deleteTemplateRow(template.id)}
                  className="mt-2 text-xs font-black text-[#b42318]"
                >
                  削除
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addFixedCosts}
          className="mt-3 w-full rounded-xl border border-[#d7c7aa] bg-white py-3 text-sm font-black text-[#5b4630] active:bg-[#f3eadb]"
        >
          固定費テンプレートを追加
        </button>
      </div>
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
  onDeleted,
  setMessage,
}: {
  transactions: HouseholdTransaction[];
  onDeleted: () => Promise<void>;
  setMessage: (value: string) => void;
}) {
  async function handleDelete(id: string) {
    const scrollY = window.scrollY;

    try {
      await deleteTransaction(id);
      setMessage("削除しました");
      await onDeleted();
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
          <h2 className="text-lg font-black text-[#24190f]">履歴</h2>
        </div>
        <p className="text-sm font-black text-[#6b7280]">{transactions.length}件</p>
      </div>

      <div className="hidden max-h-[520px] overflow-auto lg:block">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-[#fbfaf7] text-left text-xs font-bold text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">日付</th>
              <th className="px-4 py-3">種別</th>
              <th className="px-4 py-3">大分類</th>
              <th className="px-4 py-3">小分類</th>
              <th className="px-4 py-3 text-right">金額</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center font-bold text-[#6b7280]"
                >
                  この月の記録はまだありません。
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="border-t border-[#f0e7d8] hover:bg-[#fffaf0]">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-[#24190f]">
                    {t.date}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        t.type === "income"
                          ? "bg-[#e8f7ef] text-[#047857]"
                          : "bg-[#fff0ed] text-[#b42318]"
                      }`}
                    >
                      {t.type === "income" ? "収入" : "支出"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#24190f]">{t.category}</td>
                  <td className="px-4 py-3 text-[#4b5563]">{t.subcategory || "-"}</td>
                  <td
                    className={`px-4 py-3 text-right font-bold ${
                      t.type === "income" ? "text-[#047857]" : "text-[#b42318]"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {yen(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="inline-flex rounded-md border border-[#ead8d4] bg-white p-2 text-[#b42318] hover:bg-[#fff0ed]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 p-3 lg:hidden">
        {transactions.length === 0 ? (
          <div className="rounded-xl bg-[#fbfaf7] px-4 py-8 text-center text-sm font-bold text-[#6b7280]">
            この月の記録はまだありません。
          </div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#6b7280]">{t.date}</p>
                  <p className="mt-1 text-sm font-black text-[#24190f]">
                    {t.subcategory || t.category}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#6b7280]">{t.category}</p>
                </div>
                <div
                  className={`text-right text-base font-black ${
                    t.type === "income" ? "text-[#047857]" : "text-[#b42318]"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {yen(t.amount)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    t.type === "income"
                      ? "bg-[#e8f7ef] text-[#047857]"
                      : "bg-[#fff0ed] text-[#b42318]"
                  }`}
                >
                  {t.type === "income" ? "収入" : "支出"}
                </span>
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
          ))
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

      <div className="hidden overflow-auto lg:block">
        <table className="w-full text-sm">
          <thead className="bg-[#fbfaf7] text-left text-xs font-bold text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">分類</th>
              <th className="px-4 py-3 text-right">予算</th>
              <th className="px-4 py-3 text-right">実績</th>
              <th className="px-4 py-3 text-right">{diffLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.category} className="border-t border-[#f0e7d8]">
                <td className="px-4 py-3 font-medium text-[#24190f]">{row.category}</td>
                <td className="px-4 py-3 text-right text-[#4b5563]">{yen(row.budget)}</td>
                <td className="px-4 py-3 text-right font-bold text-[#24190f]">
                  {yen(row.actual)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-bold ${
                    row.diff < 0 ? "text-[#b42318]" : "text-[#047857]"
                  }`}
                >
                  {yen(row.diff)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-[#e6dcc8] bg-[#fbfaf7] font-bold">
            <tr>
              <td className="px-4 py-3">合計</td>
              <td className="px-4 py-3 text-right">{yen(totalBudget)}</td>
              <td className="px-4 py-3 text-right">{yen(totalActual)}</td>
              <td
                className={`px-4 py-3 text-right ${
                  totalDiff < 0 ? "text-[#b42318]" : "text-[#047857]"
                }`}
              >
                {yen(totalDiff)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="space-y-2 p-3 lg:hidden">
        {rows.map((row) => (
          <div key={row.category} className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-black text-[#24190f]">{row.category}</p>
              <div className="text-right">
                <p className="text-[11px] font-black text-[#6b7280]">{diffLabel}</p>
                <p
                  className={`font-black ${
                    row.diff < 0 ? "text-[#b42318]" : "text-[#047857]"
                  }`}
                >
                  {yen(row.diff)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm min-[380px]:grid-cols-2">
              <div className="rounded-lg bg-white p-2">
                <p className="text-xs font-bold text-[#6b7280]">予算</p>
                <p className="font-bold text-[#24190f]">{yen(row.budget)}</p>
              </div>
              <div className="rounded-lg bg-white p-2">
                <p className="text-xs font-bold text-[#6b7280]">実績</p>
                <p className="font-bold text-[#24190f]">{yen(row.actual)}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="rounded-xl border-2 border-[#e6dcc8] bg-white p-4">
          <div className="flex items-center justify-between font-black">
            <span>{totalLabel}</span>
            <span className={totalDiff < 0 ? "text-[#b42318]" : "text-[#047857]"}>
              {yen(totalDiff)}
            </span>
          </div>
        </div>
      </div>
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

  useEffect(() => {
    setDrafts(Object.fromEntries(budgets.map((b) => [b.category, String(b.budget)])));
  }, [budgets]);

  async function handleSave() {
    try {
      const next = budgets.map((b) => ({
        ...b,
        month,
        budget: Number(toDigits(drafts[b.category] || "0")),
      }));
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

      <div className="max-h-none space-y-2 overflow-visible pr-0 lg:max-h-[360px] lg:overflow-auto lg:pr-1">
        {budgets.map((budget) => (
          <label
            key={budget.category}
            className="grid grid-cols-1 items-center gap-2 rounded-lg border border-[#f0e7d8] bg-[#fbfaf7] px-3 py-2 min-[380px]:grid-cols-[minmax(0,1fr)_118px] sm:grid-cols-[minmax(0,1fr)_140px]"
          >
            <span className="text-sm font-bold text-[#24190f]">{budget.category}</span>
            <input
              inputMode="numeric"
              value={formatNumber(drafts[budget.category] ?? "")}
              onChange={(e) =>
                setDrafts({
                  ...drafts,
                  [budget.category]: toDigits(e.target.value),
                })
              }
              className="h-10 rounded-md border border-[#d7c7aa] bg-white px-2 text-right text-sm font-bold text-[#24190f]"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="mt-4 w-full rounded-xl bg-[#5b4630] py-3 text-sm font-black text-white active:scale-[0.99]"
      >
        予算を保存
      </button>
    </div>
  );
}
