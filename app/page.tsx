"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, Plus, RefreshCw, Trash2, WalletCards } from "lucide-react";
import { expenseCategories, incomeCategories, recurringTemplates } from "@/lib/categories";
import {
  addTransaction,
  addTransactions,
  deleteTransaction,
  getBudgets,
  getTransactions,
  saveBudgets,
} from "@/lib/householdStore";
import { currentMonthString, makeSummaryRows, todayString, totalByType, yen } from "@/lib/utils";
import type { HouseholdBudget, HouseholdTransaction, SummaryRow, TransactionType } from "@/types/household";
import LoginGate from "@/components/LoginGate";

export default function Page() {
  const [month, setMonth] = useState(currentMonthString());
  const [transactions, setTransactions] = useState<HouseholdTransaction[]>([]);
  const [budgets, setBudgets] = useState<HouseholdBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function reload() {
    setLoading(true);
    try {
      const [transactionRows, budgetRows] = await Promise.all([getTransactions(month), getBudgets(month)]);
      setTransactions(transactionRows);
      setBudgets(budgetRows);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "データ取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const income = useMemo(() => totalByType(transactions, "income"), [transactions]);
  const expense = useMemo(() => totalByType(transactions, "expense"), [transactions]);
  const balance = income - expense;
  const incomeRows = useMemo(() => makeSummaryRows(transactions, budgets, "income"), [transactions, budgets]);
  const expenseRows = useMemo(() => makeSummaryRows(transactions, budgets, "expense"), [transactions, budgets]);

  return (
    <LoginGate>
      <main className="min-h-screen w-full overflow-x-hidden bg-[#f7f3eb] pb-20 text-[#1f2933] lg:pb-0">
      <div className="mx-auto w-full max-w-[1440px] min-w-0 overflow-x-hidden px-3 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <header className="sticky top-0 z-20 mb-3 min-w-0 rounded-b-2xl border border-[#e6dcc8] bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:mb-6 sm:rounded-2xl sm:px-6 sm:py-5 lg:static">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#8a6a3f]">HOUSEHOLD BOOK</p>
              <h1 className="mt-1 text-xl font-bold text-[#24190f] sm:text-3xl">家計簿</h1>
              <p className="mt-1 hidden text-sm text-[#6b7280] sm:block">Excelの入力・履歴・予算集計をPC画面向けに整理しています。</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[#6b7280]">表示月</span>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#d7c7aa] bg-white px-3 text-sm font-bold text-[#24190f] sm:w-auto"
                />
              </label>
              <button
                type="button"
                onClick={reload}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#d7c7aa] bg-[#fbfaf7] px-4 text-sm font-bold text-[#5b4630] hover:bg-[#f2eadc] sm:w-auto"
              >
                <RefreshCw size={16} />
                更新
              </button>
            </div>
          </div>
        </header>

        {message && <div className="mb-5 rounded-lg border border-[#f2b8b5] bg-[#fff4f2] px-4 py-3 text-sm font-bold text-[#b42318]">{message}</div>}

        <section className="mb-4 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:mb-6 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          <KpiCard label="収入" value={income} tone="green" />
          <KpiCard label="支出" value={expense} tone="red" />
          <KpiCard label="残高" value={balance} tone={balance < 0 ? "red" : "dark"} />
          <KpiCard label="記録件数" value={`${transactions.length}件`} tone="dark" />
        </section>

        <nav className="mobile-section-nav lg:hidden" aria-label="スマホ用メニュー">
          <a href="#input-section">入力</a>
          <a href="#history-section">履歴</a>
          <a href="#summary-section">集計</a>
          <a href="#budget-section">予算</a>
        </nav>

        {loading ? (
          <div className="rounded-2xl border border-[#e6dcc8] bg-white p-10 text-center font-bold text-[#6b7280]">読み込み中...</div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
            <section id="input-section" className="min-w-0 scroll-mt-24 lg:col-span-4 lg:row-start-1">
              <InputPanel month={month} onAdded={reload} setMessage={setMessage} />
            </section>

            <section id="history-section" className="min-w-0 scroll-mt-24 lg:col-span-8 lg:row-span-2 lg:row-start-1">
              <HistoryTable transactions={transactions} onDeleted={reload} setMessage={setMessage} />
            </section>

            <section id="summary-section" className="min-w-0 scroll-mt-24 lg:col-span-8 lg:col-start-5">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
                <SummaryTable title="支出集計" rows={expenseRows} type="expense" />
                <SummaryTable title="収入集計" rows={incomeRows} type="income" />
              </div>
            </section>

            <section id="budget-section" className="min-w-0 scroll-mt-24 lg:col-span-4 lg:col-start-1 lg:row-start-2">
              <BudgetPanel month={month} budgets={budgets} onSaved={reload} setMessage={setMessage} />
            </section>
          </div>
        )}
      </div>
      </main>
    </LoginGate>
  );
}

function KpiCard({ label, value, tone }: { label: string; value: number | string; tone: "green" | "red" | "dark" }) {
  const textClass = tone === "green" ? "text-[#047857]" : tone === "red" ? "text-[#b42318]" : "text-[#24190f]";
  return (
    <div className="rounded-xl border border-[#e6dcc8] bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
      <p className="text-sm font-bold text-[#6b7280]">{label}</p>
      <p className={`mt-1 text-xl font-bold tracking-tight sm:mt-2 sm:text-3xl ${textClass}`}>{typeof value === "number" ? yen(value) : value}</p>
    </div>
  );
}

function InputPanel({ month, onAdded, setMessage }: { month: string; onAdded: () => Promise<void>; setMessage: (value: string) => void }) {
  const [type, setType] = useState<TransactionType>("expense");
  const [date, setDate] = useState(todayString());
  const [category, setCategory] = useState("食費");
  const [subcategory, setSubcategory] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const categories = type === "income" ? incomeCategories : expenseCategories;

  useEffect(() => {
    setCategory(type === "income" ? "給与" : "食費");
  }, [type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!date || !category || !numericAmount || numericAmount <= 0) {
      setMessage("日付・分類・金額を確認してください");
      return;
    }
    try {
      await addTransaction({ date, type, category, subcategory, amount: numericAmount, memo });
      setSubcategory("");
      setAmount("");
      setMemo("");
      setMessage("保存しました");
      await onAdded();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存に失敗しました");
    }
  }

  async function addFixedCosts() {
    try {
      await addTransactions(
        recurringTemplates.map((item) => ({
          date: `${month}-01`,
          type: item.type as TransactionType,
          category: item.category,
          subcategory: item.subcategory,
          amount: item.amount,
          memo: "固定費テンプレート",
        }))
      );
      setMessage("固定費テンプレートを追加しました");
      await onAdded();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "固定費追加に失敗しました");
    }
  }

  return (
    <div className="rounded-xl border border-[#e6dcc8] bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Plus size={18} className="text-[#8a6a3f]" />
        <h2 className="text-lg font-bold text-[#24190f]">入力</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#f3eadb] p-1">
          <button type="button" onClick={() => setType("expense")} className={`rounded-md py-2 text-sm font-bold ${type === "expense" ? "bg-white text-[#b42318] shadow-sm" : "text-[#6b7280]"}`}>支出</button>
          <button type="button" onClick={() => setType("income")} className={`rounded-md py-2 text-sm font-bold ${type === "income" ? "bg-white text-[#047857] shadow-sm" : "text-[#6b7280]"}`}>収入</button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="日付"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-desktop" /></Field>
          <Field label="金額"><input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="1100" className="input-desktop text-right" /></Field>
        </div>
        <Field label="大分類"><select value={category} onChange={(e) => setCategory(e.target.value)} className="input-desktop">{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="小分類"><input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="例：学食、ドトール、給与" className="input-desktop" /></Field>
        <Field label="メモ"><textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="任意" className="input-desktop min-h-20" /></Field>

        <button type="submit" className="w-full rounded-lg bg-[#5b4630] py-3 text-sm font-bold text-white hover:bg-[#3f3020]">保存</button>
      </form>
      <button type="button" onClick={addFixedCosts} className="mt-3 w-full rounded-lg border border-[#d7c7aa] bg-[#fbfaf7] py-3 text-sm font-bold text-[#5b4630] hover:bg-[#f2eadc]">
        固定費テンプレートを追加
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-bold text-[#6b7280]">{label}</span>{children}</label>;
}

function HistoryTable({ transactions, onDeleted, setMessage }: { transactions: HouseholdTransaction[]; onDeleted: () => Promise<void>; setMessage: (value: string) => void }) {
  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id);
      setMessage("削除しました");
      await onDeleted();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "削除に失敗しました");
    }
  }

  return (
    <div className="rounded-xl border border-[#e6dcc8] bg-white shadow-sm sm:rounded-2xl">
      <div className="flex items-center justify-between border-b border-[#eee4d2] px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-[#8a6a3f]" />
          <h2 className="text-lg font-bold text-[#24190f]">履歴</h2>
        </div>
        <p className="text-sm font-bold text-[#6b7280]">{transactions.length}件</p>
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
              <th className="px-4 py-3">メモ</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center font-bold text-[#6b7280]">この月の記録はまだありません。</td></tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="border-t border-[#f0e7d8] hover:bg-[#fffaf0]">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-[#24190f]">{t.date}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${t.type === "income" ? "bg-[#e8f7ef] text-[#047857]" : "bg-[#fff0ed] text-[#b42318]"}`}>{t.type === "income" ? "収入" : "支出"}</span></td>
                  <td className="px-4 py-3 font-medium text-[#24190f]">{t.category}</td>
                  <td className="px-4 py-3 text-[#4b5563]">{t.subcategory || "-"}</td>
                  <td className={`px-4 py-3 text-right font-bold ${t.type === "income" ? "text-[#047857]" : "text-[#b42318]"}`}>{t.type === "income" ? "+" : "-"}{yen(t.amount)}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-[#6b7280]">{t.memo || ""}</td>
                  <td className="px-4 py-3 text-right"><button type="button" onClick={() => handleDelete(t.id)} className="inline-flex rounded-md border border-[#ead8d4] bg-white p-2 text-[#b42318] hover:bg-[#fff0ed]"><Trash2 size={15} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 p-3 lg:hidden">
        {transactions.length === 0 ? (
          <div className="rounded-xl bg-[#fbfaf7] px-4 py-8 text-center text-sm font-bold text-[#6b7280]">この月の記録はまだありません。</div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#6b7280]">{t.date}</p>
                  <p className="mt-1 text-sm font-bold text-[#24190f]">{t.subcategory || t.category}</p>
                  <p className="mt-1 text-xs font-bold text-[#6b7280]">{t.category}</p>
                </div>
                <div className={`text-right text-base font-bold ${t.type === "income" ? "text-[#047857]" : "text-[#b42318]"}`}>
                  {t.type === "income" ? "+" : "-"}{yen(t.amount)}
                </div>
              </div>
              {t.memo && <p className="mb-3 rounded-lg bg-white px-3 py-2 text-sm text-[#4b5563]">{t.memo}</p>}
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${t.type === "income" ? "bg-[#e8f7ef] text-[#047857]" : "bg-[#fff0ed] text-[#b42318]"}`}>{t.type === "income" ? "収入" : "支出"}</span>
                <button type="button" onClick={() => handleDelete(t.id)} className="inline-flex items-center gap-1 rounded-md border border-[#ead8d4] bg-white px-3 py-2 text-xs font-bold text-[#b42318] hover:bg-[#fff0ed]"><Trash2 size={14} />削除</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SummaryTable({ title, rows, type }: { title: string; rows: SummaryRow[]; type: TransactionType }) {
  const totalBudget = rows.reduce((sum, r) => sum + r.budget, 0);
  const totalActual = rows.reduce((sum, r) => sum + r.actual, 0);
  const totalDiff = type === "income" ? totalActual - totalBudget : totalBudget - totalActual;

  return (
    <div className="rounded-xl border border-[#e6dcc8] bg-white shadow-sm sm:rounded-2xl">
      <div className="flex items-center gap-2 border-b border-[#eee4d2] px-4 py-3 sm:px-5 sm:py-4">
        <BarChart3 size={18} className="text-[#8a6a3f]" />
        <h2 className="text-lg font-bold text-[#24190f]">{title}</h2>
      </div>
      <div className="hidden overflow-auto lg:block">
        <table className="w-full text-sm">
          <thead className="bg-[#fbfaf7] text-left text-xs font-bold text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">分類</th>
              <th className="px-4 py-3 text-right">予算</th>
              <th className="px-4 py-3 text-right">実績</th>
              <th className="px-4 py-3 text-right">差額</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.category} className="border-t border-[#f0e7d8]">
                <td className="px-4 py-3 font-medium text-[#24190f]">{row.category}</td>
                <td className="px-4 py-3 text-right text-[#4b5563]">{yen(row.budget)}</td>
                <td className="px-4 py-3 text-right font-bold text-[#24190f]">{yen(row.actual)}</td>
                <td className={`px-4 py-3 text-right font-bold ${row.diff < 0 ? "text-[#b42318]" : "text-[#047857]"}`}>{yen(row.diff)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-[#e6dcc8] bg-[#fbfaf7] font-bold">
            <tr>
              <td className="px-4 py-3">合計</td>
              <td className="px-4 py-3 text-right">{yen(totalBudget)}</td>
              <td className="px-4 py-3 text-right">{yen(totalActual)}</td>
              <td className={`px-4 py-3 text-right ${totalDiff < 0 ? "text-[#b42318]" : "text-[#047857]"}`}>{yen(totalDiff)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="space-y-2 p-3 lg:hidden">
        {rows.map((row) => (
          <div key={row.category} className="rounded-xl border border-[#f0e7d8] bg-[#fbfaf7] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-bold text-[#24190f]">{row.category}</p>
              <p className={`font-bold ${row.diff < 0 ? "text-[#b42318]" : "text-[#047857]"}`}>{yen(row.diff)}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm min-[380px]:grid-cols-2">
              <div className="rounded-lg bg-white p-2"><p className="text-xs font-bold text-[#6b7280]">予算</p><p className="font-bold text-[#24190f]">{yen(row.budget)}</p></div>
              <div className="rounded-lg bg-white p-2"><p className="text-xs font-bold text-[#6b7280]">実績</p><p className="font-bold text-[#24190f]">{yen(row.actual)}</p></div>
            </div>
          </div>
        ))}
        <div className="rounded-xl border-2 border-[#e6dcc8] bg-white p-4">
          <div className="flex items-center justify-between font-bold">
            <span>合計差額</span>
            <span className={totalDiff < 0 ? "text-[#b42318]" : "text-[#047857]"}>{yen(totalDiff)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BudgetPanel({ month, budgets, onSaved, setMessage }: { month: string; budgets: HouseholdBudget[]; onSaved: () => Promise<void>; setMessage: (value: string) => void }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setDrafts(Object.fromEntries(budgets.map((b) => [b.category, String(b.budget)])));
  }, [budgets]);

  async function handleSave() {
    try {
      const next = budgets.map((b) => ({ ...b, month, budget: Number(drafts[b.category] || 0) }));
      await saveBudgets(month, next);
      setMessage("予算を保存しました");
      await onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "予算保存に失敗しました");
    }
  }

  return (
    <div className="rounded-xl border border-[#e6dcc8] bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <WalletCards size={18} className="text-[#8a6a3f]" />
        <h2 className="text-lg font-bold text-[#24190f]">月別予算</h2>
      </div>
      <div className="max-h-none space-y-2 overflow-visible pr-0 lg:max-h-[360px] lg:overflow-auto lg:pr-1">
        {budgets.map((budget) => (
          <label key={budget.category} className="grid grid-cols-1 items-center gap-2 rounded-lg border border-[#f0e7d8] bg-[#fbfaf7] px-3 py-2 min-[380px]:grid-cols-[minmax(0,1fr)_104px] sm:grid-cols-[minmax(0,1fr)_130px]">
            <span className="text-sm font-bold text-[#24190f]">{budget.category}</span>
            <input inputMode="numeric" value={drafts[budget.category] ?? ""} onChange={(e) => setDrafts({ ...drafts, [budget.category]: e.target.value.replace(/[^0-9]/g, "") })} className="h-9 rounded-md border border-[#d7c7aa] bg-white px-2 text-right text-sm font-bold text-[#24190f]" />
          </label>
        ))}
      </div>
      <button type="button" onClick={handleSave} className="mt-4 w-full rounded-lg bg-[#5b4630] py-3 text-sm font-bold text-white hover:bg-[#3f3020]">予算を保存</button>
    </div>
  );
}
