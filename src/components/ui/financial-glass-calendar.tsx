import { useMemo, useState } from "react";

type CalendarEvent = {
  date: string; // YYYY-MM-DD
  type: "bill" | "transaction" | "budget";
  label: string;
  amount?: number;
};

type FinancialGlassCalendarProps = {
  title?: string;
  events?: Array<CalendarEvent>;
  className?: string;
};

function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function FinancialGlassCalendar({
  title = "Financial Calendar",
  events,
  className = "",
}: FinancialGlassCalendarProps) {
  const [pivot, setPivot] = useState<Date>(new Date());

  const monthInfo = useMemo(() => {
    const start = new Date(pivot.getFullYear(), pivot.getMonth(), 1);
    const end = new Date(pivot.getFullYear(), pivot.getMonth() + 1, 0);
    const startWeekday = start.getDay(); // 0-6, Sun=0
    const daysInMonth = end.getDate();

    // Build grid cells: prefix blanks + month days
    const cells: Array<{ key: string; day?: number; date?: string }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ key: `b-${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(pivot.getFullYear(), pivot.getMonth(), d);
      cells.push({ key: `d-${d}`, day: d, date: formatDate(date) });
    }

    return {
      label: pivot.toLocaleString("default", { month: "long", year: "numeric" }),
      cells,
    };
  }, [pivot]);

  const data: Array<CalendarEvent> = useMemo(() => {
    if (events) return events;
    // Minimal demo data
    const base = new Date(pivot.getFullYear(), pivot.getMonth(), 1);
    const mk = (day: number) => formatDate(new Date(base.getFullYear(), base.getMonth(), day));
    const arr: Array<CalendarEvent> = [
      { date: mk(2), type: "bill", label: "Rent due", amount: 1200 },
      { date: mk(5), type: "transaction", label: "Groceries", amount: 64.5 },
      { date: mk(7), type: "budget", label: "Dining alert: 80% used" },
      { date: mk(10), type: "bill", label: "Utilities", amount: 140 },
      { date: mk(14), type: "transaction", label: "Coffee", amount: 4.25 },
      { date: mk(19), type: "transaction", label: "Fuel", amount: 48.0 },
      { date: mk(23), type: "budget", label: "Subscriptions high" },
      { date: mk(26), type: "transaction", label: "Dining", amount: 32.0 },
    ];
    return arr;
  }, [events, pivot]);

  const byDate: Record<string, Array<CalendarEvent>> = useMemo(() => {
    const map: Record<string, Array<CalendarEvent>> = {};
    for (const ev of data) {
      (map[ev.date] = map[ev.date] ?? []).push(ev);
    }
    return map;
  }, [data]);

  const badge = (t: CalendarEvent["type"]) => {
    if (t === "bill") return { bg: "#FFE9A3", fg: "#2C3E50", dot: "#F4D03F" };
    if (t === "transaction") return { bg: "#E8F7EE", fg: "#1F5132", dot: "#22C55E" };
    return { bg: "#F5F3F0", fg: "#7F8C8D", dot: "#2C3E50" };
  };

  return (
    <div className={`rounded-2xl border border-[#E8E8E8] bg-white/60 backdrop-blur-xl p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ color: "#2C3E50" }}>
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs" style={{ color: "#7F8C8D" }}>
          <button
            className="px-2 py-1 rounded border border-[#E8E8E8] bg-white/70"
            onClick={() => setPivot(new Date(pivot.getFullYear(), pivot.getMonth() - 1, 1))}
          >
            ◀
          </button>
          <span>{monthInfo.label}</span>
          <button
            className="px-2 py-1 rounded border border-[#E8E8E8] bg-white/70"
            onClick={() => setPivot(new Date(pivot.getFullYear(), pivot.getMonth() + 1, 1))}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-4">
        {[
          { k: "bill", label: "Bills" },
          { k: "transaction", label: "Transactions" },
          { k: "budget", label: "Budget alerts" },
        ].map((l) => {
          const c = badge(l.k as CalendarEvent["type"]);
          return (
            <span
              key={l.k}
              className="px-2 py-1 rounded-full text-xs"
              style={{ background: c.bg, color: c.fg, border: "1px solid #E8E8E8" }}
            >
              {l.label}
            </span>
          );
        })}
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-3 mt-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-[11px] text-center" style={{ color: "#7F8C8D" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-3 mt-1">
        {monthInfo.cells.map((cell) => {
          if (!cell.day) {
            return <div key={cell.key} className="h-20 rounded-xl border border-[#E8E8E8] bg-white/40" />;
          }
          const evs = cell.date ? byDate[cell.date] ?? [] : [];
          return (
            <div
              key={cell.key}
              className={`h-24 rounded-xl border border-[#E8E8E8] bg-white/70 p-2 text-xs flex flex-col`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold" style={{ color: "#2C3E50" }}>
                  {cell.day}
                </div>
                <div className="flex -space-x-1">
                  {evs.slice(0, 3).map((e, i) => {
                    const c = badge(e.type);
                    return (
                      <span
                        key={i}
                        className="w-2.5 h-2.5 rounded-full ring-2 ring-white"
                        title={e.label}
                        style={{ background: c.dot }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="mt-1 flex-1 overflow-hidden">
                {evs.slice(0, 2).map((e, i) => {
                  const c = badge(e.type);
                  return (
                    <div
                      key={i}
                      className="truncate mb-1 px-1 py-0.5 rounded"
                      style={{ background: c.bg, color: c.fg, border: "1px solid #E8E8E8" }}
                      title={e.label}
                    >
                      {e.label}
                      {typeof e.amount === "number" ? ` • $${e.amount}` : ""}
                    </div>
                  );
                })}
                {evs.length > 2 && (
                  <div className="text-[11px]" style={{ color: "#7F8C8D" }}>
                    +{evs.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
