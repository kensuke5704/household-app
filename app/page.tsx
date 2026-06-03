"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Home, List, Plus, Settings, Trash2, WalletCards } from "lucide-react";
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
import type { HouseholdBudget, HouseholdTransaction, TransactionType } from "@/types/household";

type Tab = "ホーム" | "入力" | "履歴" | "分析" | "予算";

const tabs: Array<{ label: Tab; icon: React.ReactNode }> = [
  { label: "ホーム", icon: <Home size={21} /> },
  { label: "入力", icon: <Plus size={23} /> },
  { label: "履歴", icon: <List size={21} /> },
  { label: "分析", icon: <BarChart3 size={21} /> },
  { label: "予算", icon: <Settings size={21} /> },
];

export default function Page() {
  const [tab, setTab] = useState<Tab>("ホーム");
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
    <main className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-4 py-5">
        <header className="mb-4 rounded-[32px] bg-[#fffaf0] p-5 shadow-soft">
          <p className="text-xs font-black tracking-[0.2em] text-[#c08a28]">HOUSEHOLD BOOK</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-[#6b2f13]">家計簿</h1>
              <p className="text-sm font-bold text-[#9b6b2f]">Excelの月別管理をWeb化</p>
            </div>
            <WalletCards className="text-[#f0a500]" size={42} />
          </div>
          <label className="mt-4 block text-xs font-black text-[#9b6b2f]">表示月</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-[#f1d59a] bg-white px-4 py-3 font-black text-[#6b2f13]"
          />
        </header>

        {message && (
          <div className="mb-4 rounded-2xl bg-white p-3 text-sm font-bold text-[#b42318]">{message}</div>
        )}

        {loading ? (
          <div className="rounded-[28px] bg-white p-8 text-center font-black text-[#9b6b2f]">読み込み中...</div>
        ) : (
          <>
            {tab === "ホーム" && (
              <HomeScreen
                income={income}
                expense={expense}
                balance={balance}
                expenseRows={expenseRows}
                recentTransactions={transactions.slice(0, 5)}
              />
            )}
            {tab === "入力" && <InputScreen month={month} onAdded={reload} setMessage={setMessage} />}
            {tab === "履歴" && (
              <HistoryScreen transactions={transactions} onDeleted={reload} setMessage={setMessage} />
            )}
            {tab === "分析" && <AnalysisScreen incomeRows={incomeRows} expenseRows={expenseRows} />}
            {tab === "予算" && (
              <BudgetScreen month={month} budgets={budgets} onSaved={reload} setMessage={setMessage} />
            )}
          </>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#efd7a1] bg-[#fffaf0]/95 px-3 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-md justify-between gap-1">
          {tabs.map((item) => {
            const active = tab === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setTab(item.label)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-black transition ${
                  active ? "bg-[#ffd66b] text-[#6b2f13]" : "text-[#9b6b2f]"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

function HomeScreen({
  income,
  expense,
  balance,
  expenseRows,
  recentTransactions,
}: {
  income: number;
  expense: number;
  balance: number;
  expenseRows: ReturnType<typeof makeSummaryRows>;
  recentTransactions: HouseholdTransaction[];
}) {
  const used = expenseRows.reduce((sum, row) => sum + row.actual, 0);
  const budget = expenseRows.reduce((sum, row) => sum + row.budget, 0);
  const percent = budget > 0 ? Math.min(100, Math.round((used / budget) * 100)) : 0;

  return (
    <section className="space-y-4">
      <div className="rounded-[36px] bg-[#fff4d7] p-5 shadow-soft">
        <p className="text-sm font-black text-[#9b6b2f]">今月の残り</p>
        <p className={`mt-1 text-4xl font-black ${balance < 0 ? "text-[#b42318]" : "text-[#6b2f13]"}`}>
          {yen(balance)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Kpi label="収入" value={income} />
          <Kpi label="支出" value={expense} />
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-soft">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-black text-[#9b6b2f]">支出予算の使用率</p>
            <p className="text-2xl font-black text-[#6b2f13]">{percent}%</p>
          </div>
          <p className="text-sm font-black text-[#9b6b2f]">{yen(used)} / {yen(budget)}</p>
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-[#f5e1ad]">
          <div className="h-full rounded-full bg-[#f0a500]" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-soft">
        <p className="mb-3 text-sm font-black text-[#9b6b2f]">最近の記録</p>
        {recentTransactions.length === 0 ? (
          <p className="text-sm font-bold text-[#9b6b2f]">まだ記録がありません。</p>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((t) => <TransactionLine key={t.id} transaction={t} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white p-4">
      <p className="text-xs font-black text-[#9b6b2f]">{label}</p>
      <p className="text-xl font-black text-[#6b2f13]">{yen(value)}</p>
    </div>
  );
}

function InputScreen({
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
    <section className="space-y-4">
      <form onSubmit={handleSubmit} className="rounded-[32px] bg-white p-5 shadow-soft">
        <p className="text-lg font-black text-[#6b2f13]">記録を追加</p>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#fff4d7] p-1">
          <button type="button" onClick={() => setType("expense")} className={`rounded-xl py-3 font-black ${type === "expense" ? "bg-[#f0a500] text-white" : "text-[#9b6b2f]"}`}>支出</button>
          <button type="button" onClick={() => setType("income")} className={`rounded-xl py-3 font-black ${type === "income" ? "bg-[#f0a500] text-white" : "text-[#9b6b2f]"}`}>収入</button>
        </div>
        <Field label="日付"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" /></Field>
        <Field label="大分類"><select value={category} onChange={(e) => setCategory(e.target.value)} className="input">{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="小分類"><input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="例：学食、ドトール、給与" className="input" /></Field>
        <Field label="金額"><input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="1100" className="input" /></Field>
        <Field label="メモ"><textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="任意" className="input min-h-20" /></Field>
        <button type="submit" className="mt-5 w-full rounded-2xl bg-[#f0a500] py-4 text-lg font-black text-white">保存</button>
      </form>

      <div className="rounded-[28px] bg-[#fff4d7] p-5 shadow-soft">
        <p className="font-black text-[#6b2f13]">Excelにあった固定費</p>
        <p className="mt-1 text-sm font-bold text-[#9b6b2f]">DAZN、Amazon Prime、携帯料金、Adobeなどを月初の日付でまとめて追加します。</p>
        <button type="button" onClick={addFixedCosts} className="mt-4 w-full rounded-2xl bg-white py-3 font-black text-[#6b2f13]">固定費テンプレートを追加</button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-4 block"><span className="mb-1 block text-xs font-black text-[#9b6b2f]">{label}</span>{children}</label>;
}

function HistoryScreen({ transactions, onDeleted, setMessage }: { transactions: HouseholdTransaction[]; onDeleted: () => Promise<void>; setMessage: (value: string) => void }) {
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
    <section className="space-y-3">
      {transactions.length === 0 ? <Empty text="この月の記録はまだありません。" /> : transactions.map((t) => (
        <div key={t.id} className="rounded-[26px] bg-white p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <TransactionLine transaction={t} />
            <button type="button" onClick={() => handleDelete(t.id)} className="rounded-full bg-[#fff4d7] p-2 text-[#9b6b2f]"><Trash2 size={18} /></button>
          </div>
          {t.memo && <p className="mt-2 rounded-2xl bg-[#fffaf0] px-3 py-2 text-sm font-bold text-[#9b6b2f]">{t.memo}</p>}
        </div>
      ))}
    </section>
  );
}

function AnalysisScreen({ incomeRows, expenseRows }: { incomeRows: ReturnType<typeof makeSummaryRows>; expenseRows: ReturnType<typeof makeSummaryRows> }) {
  return (
    <section className="space-y-4">
      <SummaryTable title="収入" rows={incomeRows} type="income" />
      <SummaryTable title="支出" rows={expenseRows} type="expense" />
    </section>
  );
}

function SummaryTable({ title, rows, type }: { title: string; rows: ReturnType<typeof makeSummaryRows>; type: TransactionType }) {
  const totalBudget = rows.reduce((sum, r) => sum + r.budget, 0);
  const totalActual = rows.reduce((sum, r) => sum + r.actual, 0);
  const totalDiff = type === "income" ? totalActual - totalBudget : totalBudget - totalActual;
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-soft">
      <p className="mb-3 text-lg font-black text-[#6b2f13]">{title}</p>
      <div className="space-y-3">
        {rows.map((row) => {
          const max = Math.max(row.budget, row.actual, 1);
          const width = Math.min(100, Math.round((row.actual / max) * 100));
          return (
            <div key={row.category}>
              <div className="flex justify-between text-sm font-black text-[#6b2f13]"><span>{row.category}</span><span>{yen(row.actual)}</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#f5e1ad]"><div className="h-full rounded-full bg-[#f0a500]" style={{ width: `${width}%` }} /></div>
              <div className="mt-1 flex justify-between text-xs font-bold text-[#9b6b2f]"><span>予算 {yen(row.budget)}</span><span>差額 {yen(row.diff)}</span></div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-2xl bg-[#fff4d7] p-3 text-sm font-black text-[#6b2f13]">合計：予算 {yen(totalBudget)} / 実費 {yen(totalActual)} / 差額 {yen(totalDiff)}</div>
    </div>
  );
}

function BudgetScreen({ month, budgets, onSaved, setMessage }: { month: string; budgets: HouseholdBudget[]; onSaved: () => Promise<void>; setMessage: (value: string) => void }) {
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
    <section className="rounded-[32px] bg-white p-5 shadow-soft">
      <p className="text-lg font-black text-[#6b2f13]">月別予算</p>
      <p className="mt-1 text-sm font-bold text-[#9b6b2f]">Excel右側の「予算・実費・差額」の予算欄です。</p>
      <div className="mt-4 space-y-3">
        {budgets.map((budget) => (
          <label key={budget.category} className="flex items-center justify-between gap-3 rounded-2xl bg-[#fffaf0] p-3">
            <span className="font-black text-[#6b2f13]">{budget.category}</span>
            <input inputMode="numeric" value={drafts[budget.category] ?? ""} onChange={(e) => setDrafts({ ...drafts, [budget.category]: e.target.value.replace(/[^0-9]/g, "") })} className="w-32 rounded-xl border-2 border-[#f1d59a] bg-white px-3 py-2 text-right font-black text-[#6b2f13]" />
          </label>
        ))}
      </div>
      <button type="button" onClick={handleSave} className="mt-5 w-full rounded-2xl bg-[#f0a500] py-4 text-lg font-black text-white">予算を保存</button>
    </section>
  );
}

function TransactionLine({ transaction }: { transaction: HouseholdTransaction }) {
  const sign = transaction.type === "income" ? "+" : "-";
  return (
    <div className="min-w-0 flex-1">
      <p className="text-xs font-black text-[#9b6b2f]">{transaction.date}</p>
      <p className="truncate font-black text-[#6b2f13]">{transaction.category} / {transaction.subcategory || "未入力"}</p>
      <p className={`text-xl font-black ${transaction.type === "income" ? "text-[#157347]" : "text-[#6b2f13]"}`}>{sign}{yen(transaction.amount)}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-[28px] bg-white p-8 text-center font-black text-[#9b6b2f] shadow-soft">{text}</div>;
}
