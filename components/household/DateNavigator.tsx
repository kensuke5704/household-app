import type { Dispatch, SetStateAction } from "react";
import { todayString } from "@/lib/utils";

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function shiftDate(date: string, offset: number) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(year, month - 1, day + offset);
  return formatLocalDate(next);
}

export default function DateNavigator({
  date,
  setDate,
}: {
  date: string;
  setDate: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
      <button type="button" onTouchEnd={(e) => e.stopPropagation()} onClick={() => setDate((current) => shiftDate(current, -1))} className="h-11 rounded-xl border border-[#d7c7aa] bg-white text-lg font-black text-[#5b4630] active:bg-[#f3eadb]" aria-label="前の日">‹</button>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        onDoubleClick={() => setDate(todayString())}
        onTouchEnd={(e) => {
          e.stopPropagation();
          const now = Date.now();
          const last = Number(e.currentTarget.dataset.lastTap || 0);
          e.currentTarget.dataset.lastTap = String(now);
          if (now - last < 320) setDate(todayString());
        }}
        className="h-11 min-w-0 rounded-xl border border-[#d7c7aa] bg-white px-3 text-center text-sm font-black text-[#24190f] outline-none active:bg-[#f3eadb]"
        aria-label="日付を選択"
      />
      <button type="button" onTouchEnd={(e) => e.stopPropagation()} onClick={() => setDate((current) => shiftDate(current, 1))} className="h-11 rounded-xl border border-[#d7c7aa] bg-white text-lg font-black text-[#5b4630] active:bg-[#f3eadb]" aria-label="次の日">›</button>
    </div>
  );
}
