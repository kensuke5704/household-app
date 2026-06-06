"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import { currentMonthString, yen } from "@/lib/utils";
import type { CategoryOverview, MonthOverview } from "@/components/household/types";

const HISTORY_OPEN_YEARS_STORAGE_KEY = "household.historyOpenYears.v1";
const HISTORY_OPEN_MONTHS_STORAGE_KEY = "household.historyOpenMonths.v1";
const ACTIVE_USER_KEY = "household.auth.userKey";

function getActiveUserScope() {
  if (typeof window === "undefined") return "personal";
  return window.localStorage.getItem(ACTIVE_USER_KEY) || "personal";
}

function scopedStorageKey(key: string) {
  return `${key}.${getActiveUserScope()}`;
}

function signedYen(value: number) {
  return `${value >= 0 ? "+" : ""}${yen(value)}`;
}

function getMonthLabel(month: string) {
  const [year, m] = month.split("-");
  return `${year}年${Number(m)}月`;
}

export default function HistoryTab({ overviews }: { overviews: MonthOverview[] }) {
  const [openYears, setOpenYears] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem(scopedStorageKey(HISTORY_OPEN_YEARS_STORAGE_KEY)) || "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  });
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem(scopedStorageKey(HISTORY_OPEN_MONTHS_STORAGE_KEY)) || "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(scopedStorageKey(HISTORY_OPEN_YEARS_STORAGE_KEY), JSON.stringify(openYears));
  }, [openYears]);

  useEffect(() => {
    window.localStorage.setItem(scopedStorageKey(HISTORY_OPEN_MONTHS_STORAGE_KEY), JSON.stringify(openMonths));
  }, [openMonths]);

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
                        <div key={row.month} className="rounded-xl border border-[#f0e7d8] bg-white px-3 py-2">
                          <button type="button" onClick={() => toggleMonth(row.month)} className="flex w-full items-center justify-between gap-3 text-left">
                            <p className="text-sm font-black text-[#24190f]">{getMonthLabel(row.month)}</p>
                            <div className="text-right">
                              <p className={`text-base font-black ${row.balance < 0 ? "text-[#b42318]" : "text-[#047857]"}`}>
                                {signedYen(row.balance)}
                              </p>
                              <p className="text-[10px] font-black text-[#6b7280]">{open ? "閉じる" : "内訳"}</p>
                            </div>
                          </button>
                          {open && (
                            <div className="mt-2 space-y-3 border-t border-[#f0e7d8] pt-2">
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
