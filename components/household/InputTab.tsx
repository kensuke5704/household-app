"use client";

import { useEffect, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { expenseCategories, incomeCategories } from "@/lib/categories";
import { addTransaction, deleteTransaction, updateTransaction } from "@/lib/householdStore";
import { todayString, yen } from "@/lib/utils";
import DateNavigator from "@/components/household/DateNavigator";
import type { ConfirmFn } from "@/components/household/ConfirmDialog";
import type { HouseholdTransaction, TransactionType } from "@/types/household";
import type { TemplateDraft } from "@/components/household/types";

const TEMPLATE_STORAGE_KEY = "household.recurringTemplates.v2";
const LEGACY_TEMPLATE_STORAGE_KEY = "household.recurringTemplates.v1";
const TEMPLATE_GLOBAL_ENABLED_KEY =
  "household.recurringTemplates.globalEnabled.v1";
const QUICK_SUBCATEGORY_STORAGE_KEY = "household.quickSubcategories.v1";
const ACTIVE_USER_KEY = "household.auth.userKey";

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

function getActiveUserScope() {
  if (typeof window === "undefined") return "personal";
  return window.localStorage.getItem(ACTIVE_USER_KEY) || "personal";
}

function scopedStorageKey(key: string) {
  return `${key}.${getActiveUserScope()}`;
}

function formatNumber(value: number | string) {
  const digits = String(value).replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ja-JP");
}

function toDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
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

export default function InputTab({
  transactions,
  templates,
  templatesEnabled,
  setTemplates,
  setTemplatesEnabled,
  onChanged,
  setMessage,
  requestConfirm,
}: {
  transactions: HouseholdTransaction[];
  templates: TemplateDraft[];
  templatesEnabled: boolean;
  setTemplates: Dispatch<SetStateAction<TemplateDraft[]>>;
  setTemplatesEnabled: Dispatch<SetStateAction<boolean>>;
  onChanged: () => Promise<void>;
  setMessage: (value: string) => void;
  requestConfirm: ConfirmFn;
}) {
  const [selectedDate, setSelectedDate] = useState(todayString());

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
      <div className="space-y-4">
        <InputPanel
          date={selectedDate}
          setDate={setSelectedDate}
          onAdded={onChanged}
          setMessage={setMessage}
        />
        <HistoryTable
          transactions={transactions}
          onChanged={onChanged}
          setMessage={setMessage}
        />
      </div>
      <FixedTemplatePanel
        date={selectedDate}
        templates={templates}
        templatesEnabled={templatesEnabled}
        setTemplates={setTemplates}
        setTemplatesEnabled={setTemplatesEnabled}
        onAdded={onChanged}
        setMessage={setMessage}
        requestConfirm={requestConfirm}
      />
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
  setDate: Dispatch<SetStateAction<string>>;
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

  async function handleSubmit(e: FormEvent) {
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
  requestConfirm,
}: {
  date: string;
  templates: TemplateDraft[];
  templatesEnabled: boolean;
  setTemplates: Dispatch<SetStateAction<TemplateDraft[]>>;
  setTemplatesEnabled: Dispatch<SetStateAction<boolean>>;
  onAdded: () => Promise<void>;
  setMessage: (value: string) => void;
  requestConfirm: ConfirmFn;
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

  async function deleteTemplateRow(id: string) {
    const target = templates.find((item) => item.id === id);
    const label = target?.subcategory || target?.category || "この固定費";
    const confirmed = await requestConfirm({
      title: "固定費を削除しますか？",
      message: `${label}を削除します。`,
      confirmLabel: "削除",
      cancelLabel: "キャンセル",
    });
    if (!confirmed) return;
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
  children: ReactNode;
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

