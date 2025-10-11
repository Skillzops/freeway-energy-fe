import useGetAdminOverviewQuery from "@/redux/AdminOverview";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";

const MONTHS = [
  { label: "January", abbr: "Jan" },
  { label: "February", abbr: "Feb" },
  { label: "March", abbr: "Mar" },
  { label: "April", abbr: "Apr" },
  { label: "May", abbr: "May" },
  { label: "June", abbr: "Jun" },
  { label: "July", abbr: "Jul" },
  { label: "August", abbr: "Aug" },
  { label: "September", abbr: "Sep" },
  { label: "October", abbr: "Oct" },
  { label: "November", abbr: "Nov" },
  { label: "December", abbr: "Dec" },
];

const formatCurrencyNGN = (n?: number) =>
  (Number(n) || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 });
const pad2 = (n: number) => String(n).padStart(2, "0");

const AgentLeaderboard: React.FC = () => {
  const now = new Date();
  const defaultMonthIndex = now.getMonth();
  const defaultYear = now.getFullYear();

  const [monthIndex, setMonthIndex] = useState<number>(defaultMonthIndex);
  const [year, setYear] = useState<number>(defaultYear);
  const [open, setOpen] = useState(false);


  const popRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const monthLabel = MONTHS[monthIndex]?.label;
  const monthAbbr = MONTHS[monthIndex]?.abbr;

  const displayLabel = `${monthLabel} ${year}`;
  const queryMonthParam = `${monthAbbr} ${year}`; 

  const { data, isFetching } = useGetAdminOverviewQuery({ month: queryMonthParam });

  const agents = data?.insights?.topPerformingAgents ?? [];

  const years = useMemo(() => {
    const y = defaultYear;
    return [y, y - 1, y - 2, y - 3, y - 4];
  }, [defaultYear]);

  return (
    <div className="bg-[#FFFFFF] rounded-2xl shadow-sm p-3 border border-[#E3F0FF] w-[359px] h-[640px] flex flex-col">
      <div className="flex items-center justify-between rounded-2xl bg-[#F5F7FF] px-4 py-2 mb-2 relative">
        <div className="text-[11px] font-bold tracking-wide text-slate-700 uppercase">
          Agent Leaderboard
        </div>
        <button
          type="button"
          className="flex items-center gap-1 rounded-full bg-white/90 border border-[#E3F0FF] px-3 py-1 text-[11px] font-semibold text-slate-700"
          onClick={() => setOpen((s) => !s)}
        >
          {displayLabel}
          <BiChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            ref={popRef}
            className="absolute right-3 top-12 z-20 w-56 rounded-xl border border-[#E3F0FF] bg-white shadow-md p-3"
          >
            <div className="mb-2">
              <label className="block text-[11px] text-slate-500 mb-1">Month</label>
              <select
                className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
                value={monthIndex}
                onChange={(e) => setMonthIndex(Number(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={m.abbr} value={i}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-[11px] text-slate-500 mb-1">Year</label>
              <select
                className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1.5 text-sm rounded-md border"
                onClick={() => {
                  setMonthIndex(defaultMonthIndex);
                  setYear(defaultYear);
                }}
              >
                Reset
              </button>
              <button
                className="px-3 py-1.5 text-sm rounded-md bg-[#2C3DA8] text-white"
                onClick={() => setOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 rounded-3xl bg-white/60 border border-[#EEF2FF] p-2 overflow-y-auto">
        {isFetching ? (
          <div className="px-2 py-3 text-[12px] text-slate-500">Loading…</div>
        ) : agents.length === 0 ? (
          <div className="px-2 py-3 text-[12px] text-slate-500">No data.</div>
        ) : (
          <ul className="flex flex-col">
            {agents.map((a, idx) => (
              <li
                key={a.agentId ?? idx}
                className="flex items-center justify-between py-3 px-2 border-b last:border-b-0 border-[#EEF2FF]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-sm text-[11px] text-slate-500">
                    {pad2(idx + 1)}
                  </div>
                  <div className="truncate text-[13px] text-slate-800">{a.name}</div>
                </div>

                <div className="flex  items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
                    Sales <span className="inline-block rounded-full bg-emerald-600 text-white px-1">{pad2(a.salesCount)}</span>
                  </span>
                  <span className="flex flex-col items-center gap-1 rounded-full bg-[#E6ECFF] text-[#2C3DA8] border border-[#D6E1FF] px-2 py-0.5 text-[10px] font-semibold">
                    Life time Value
                    <span className="inline-block rounded-full bg-[#2C3DA8] text-white px-2">
                      ₦{formatCurrencyNGN(a.totalRevenue)}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AgentLeaderboard;
