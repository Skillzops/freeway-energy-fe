// src/Components/DashBoardCard/SalesCategoryPie.tsx
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type ProductCategorySlice = {
  name: string;
  count: number;
  value: number;
  percentage: string | number; // API sends string like "100.00"
};

export type SalesCategoryPieProps = {
  data?: ProductCategorySlice[];
  isLoading?: boolean;
  height?: number; // allow parent to tweak height if needed
};

const SalesCategoryPie: React.FC<SalesCategoryPieProps> = ({ data = [], isLoading = false, height = 180 }) => {
  const parsed = useMemo(() => {
    return (data || []).map((d) => ({
      ...d,
      // normalize percentage to number for math/labels
      pctNum: typeof d.percentage === "string" ? parseFloat(d.percentage) : Number(d.percentage ?? 0),
    }));
  }, [data]);

  // Simple color palette (kept neutral; you can swap to your brand colors)
  const COLORS = useMemo(
    () => ["#3A57E8", "#4FD1C5", "#F6AD55", "#ECC94B", "#ED64A6", "#63B3ED", "#68D391", "#F56565"],
    []
  );

  // Empty state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading categories…</span>
      </div>
    );
  }

  if (!parsed.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center justify-center">
        <span className="text-sm text-gray-500">No category data</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Product Categories</h3>
        {/* tiny legend summary */}
        <span className="text-xs text-gray-500">
          {parsed.length} categor{parsed.length === 1 ? "y" : "ies"}
        </span>
      </div>

      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={parsed}
              dataKey="count"             // Using count slices; swap to "value" if you prefer value-weighted
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              innerRadius="55%"
              paddingAngle={2}
            >
              {parsed.map((entry, idx) => (
                <Cell key={`slice-${entry.name}-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip
              formatter={(v: any, _name: string, payload: any) => {
                const pct = payload?.payload?.pctNum ?? 0;
                const count = payload?.payload?.count ?? 0;
                const value = payload?.payload?.value ?? 0;
                return [
                  `Count: ${count.toLocaleString()}\nValue: ₦${Number(value).toLocaleString()}\nShare: ${pct.toFixed(2)}%`,
                  payload?.payload?.name ?? "Category"
                ];
              }}
              contentStyle={{ whiteSpace: "pre-line" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* inline legend */}
      <div className="mt-3 grid grid-cols-1 gap-1">
        {parsed.map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-gray-700 truncate max-w-[140px]" title={item.name}>
                {item.name}
              </span>
            </div>
            <div className="text-gray-500">
              {item.count.toLocaleString()} • {Number(item.pctNum || 0).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesCategoryPie;
