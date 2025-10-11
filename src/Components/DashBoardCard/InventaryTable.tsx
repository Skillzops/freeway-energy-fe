import React, { useMemo } from "react";

type InventoryTableProps = {
  inventoryData: any;                
  isLoading: boolean;
  refreshTable?: any;
  // errorData?: any;
  // paginationInfo?: any;
  setTableQueryParams?: React.Dispatch<any>;
};

type Row = { id: string | number; name: string; range: string; percent: number };

const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n || 0)));
const fmtNGN0 = (n?: number) =>
  (Number(n) || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 });

const pctFill = (p: number) =>
  p <= 0 ? "bg-red-500" : p < 30 ? "bg-red-600" : p < 60 ? "bg-amber-300" : "bg-green-500";

const pctChip = (p: number) =>
  p <= 0
    ? "bg-red-200 text-red-700"
    : p < 30
    ? "bg-red-100 text-red-700"
    : p < 60
    ? "bg-[#FBD34D] text-amber-700"
    : "bg-emerald-100 text-emerald-700";

const InventaryTable: React.FC<InventoryTableProps> = ({ inventoryData, isLoading }) => {
  // Header badges
  const scorePct = useMemo(() => {
    const total = Number(inventoryData?.statistics?.inventory?.total ?? 0);
    const inStock = Number(inventoryData?.statistics?.inventory?.inStock ?? 0);
    if (!total) return 0;
    return clampPct((inStock / total) * 100);
  }, [inventoryData]);

  const coins = Number(inventoryData?.statistics?.tasks?.pending ?? 0);

  // Primary rows: charts.monthlyTrends
  const trendRows: Row[] = useMemo(() => {
    const trends: Array<any> = inventoryData?.charts?.monthlyTrends ?? [];
    if (!Array.isArray(trends) || trends.length === 0) return [];

    const maxSales =
      trends.reduce((m, t) => Math.max(m, Number(t?.sales ?? 0)), 0) || 1;

    return trends.map((t, idx) => {
      const month = t?.month ?? "—";
      const sales = Number(t?.sales ?? 0);
      const salesValue = Number(t?.salesValue ?? 0);
      const percent = clampPct((sales / maxSales) * 100);

      return {
        id: idx,
        name: `${month} Sales`,
        range: `${sales} • ₦${fmtNGN0(salesValue)}`,
        percent,
      };
    });
  }, [inventoryData]);

  // Fallback rows: charts.productCategoriesChart
  const fallbackRows: Row[] = useMemo(() => {
    const cats: Array<any> = inventoryData?.charts?.productCategoriesChart ?? [];
    if (!Array.isArray(cats) || cats.length === 0) return [];
    return cats.map((c: any, i: number) => ({
      id: i,
      name: c?.name ?? "Category",
      range: `${Number(c?.count ?? 0)} items • ₦${fmtNGN0(c?.value)}`,
      percent: clampPct(parseFloat(c?.percentage ?? "0")),
    }));
  }, [inventoryData]);

  const rows: Row[] =
    trendRows.length > 0
      ? trendRows
      : fallbackRows.length > 0
      ? fallbackRows
      : [{ id: "empty", name: "—", range: "—", percent: 0 }];

  return (
    <div className="w-[360px] rounded-3xl border border-slate-200 shadow-sm bg-white p-3">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2">
        <div className="text-[11px] font-bold tracking-wide text-slate-700 uppercase">
          Monthly Performance
        </div>
        <div className="flex items-center gap-2">
          {/* score badge */}
          <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700">
            <span className="inline-block h-4 w-4 rounded-full bg-green-500" />
            <span>{scorePct}%</span>
          </div>
          {/* coin badge */}
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
            <span className="inline-block h-4 w-4 rounded-full bg-amber-300" />
            <span>{coins}</span>
          </div>
        </div>
      </div>

      {/* Subheader */}
      <div className="px-2 pt-3 pb-1">
        <p className="text-[10px] font-semibold tracking-wide text-slate-400">
          Monthly sales
        </p>
      </div>

      {/* List */}
      <div className="max-h-[520px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="px-2 py-3 text-[12px] text-slate-500">Loading…</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((it) => (
              <li
                key={it.id}
                className="relative rounded-full bg-slate-50 px-2 py-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
              >
                {/* track */}
                <div className="absolute inset-y-0 left-0 right-0 mx-2 my-1 rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]" />
                {/* fill */}
                <div
                  className={`absolute inset-y-0 left-0 my-2 ml-2 rounded-full ${pctFill(
                    it.percent
                  )} transition-all`}
                  style={{ width: `calc(${it.percent}% - 0.5rem)` }}
                />
                {/* row  */}
                <div className="relative z-[1] flex items-center justify-between gap-2 px-3">
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      {/* <span style={{border: "3px solid red"}} className="inline-block h-4 w-4 rounded-full bg-white shadow-sm" /> */}
                      <span className="truncate text-[12px] font-semibold text-black">
                        {it.name}
                      </span>
                    </div>
                    <div className="pl-7 text-[10px] text-black">
                      {it.range}
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold ${pctChip(
                      it.percent
                    )}`}
                  >
                    {it.percent}%
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InventaryTable;

