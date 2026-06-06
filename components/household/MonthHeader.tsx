import type { Dispatch, SetStateAction } from "react";
import { currentMonthString } from "@/lib/utils";

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatLocalMonth(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

function shiftMonth(month: string, offset: number) {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1 + offset, 1);
  return formatLocalMonth(date);
}

export default function MonthHeader({
  month,
  setMonth,
}: {
  month: string;
  setMonth: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
      <button type="button" onClick={() => setMonth((current) => shiftMonth(current, -1))} className="h-11 rounded-xl border border-[#d7c7aa] bg-white text-lg font-black text-[#5b4630] active:bg-[#f3eadb]" aria-label="前の月">‹</button>
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        onDoubleClick={() => setMonth(currentMonthString())}
        onTouchEnd={(e) => {
          e.stopPropagation();
          const now = Date.now();
          const last = Number(e.currentTarget.dataset.lastTap || 0);
          e.currentTarget.dataset.lastTap = String(now);
          if (now - last < 320) setMonth(currentMonthString());
        }}
        className="h-11 min-w-0 rounded-xl border border-[#d7c7aa] bg-white px-3 text-center text-lg font-black text-[#24190f] outline-none active:bg-[#f3eadb]"
        aria-label="月を選択"
      />
      <button type="button" onClick={() => setMonth((current) => shiftMonth(current, 1))} className="h-11 rounded-xl border border-[#d7c7aa] bg-white text-lg font-black text-[#5b4630] active:bg-[#f3eadb]" aria-label="次の月">›</button>
    </div>
  );
}
