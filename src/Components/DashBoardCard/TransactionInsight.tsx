import useGetAdminOverviewQuery from "@/redux/AdminOverview";
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type TxPoint = { month: string; amount: number; count: number };

type Props = {
  status?: "COMPLETED" | "IN_INSTALLMENT" | "UNPAID" | "CANCELLED";
  month?: string; 
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

const TransactionsInsights: React.FC<Props> = ({ status, month }) => {
  const { data, isFetching, isError } = useGetAdminOverviewQuery({
    status,
    month,
  });

  const lineData: TxPoint[] = useMemo(() => {
    const rows = (data as any)?.charts?.monthlyTrends ?? [];

    const byMonth: Record<string, { paymentsValue: number; payments: number }> =
      rows.reduce((acc: Record<string, any>, r: any) => {
        const m = String(r?.month ?? "");
        acc[m] = {
          paymentsValue: Number(r?.paymentsValue ?? 0),
          payments: Number(r?.payments ?? 0),
        };
        return acc;
      }, {});


      return MONTHS.map((m) => {
      const hit = byMonth[m];
      return {
        month: m,
        // Your chart uses a money axis called "amount" — we map paymentsValue here
        amount: hit ? hit.paymentsValue : 0,
        // keeping "count" around if you later want a second series
        count: hit ? hit.payments : 0,
      };
    });
  }, [data]);

  if (isFetching) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-textGrey">
        Loading transactions…
      </div>
    );
  }
  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-red-500">
        Failed to load transactions.
      </div>
    );
  }

  const hasData = lineData.some((d) => d.amount > 0 || d.count > 0);
  if (!hasData) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-textGrey">
        No transaction data yet.
      </div>
    );
  }

  const maxAmount = Math.max(...lineData.map((d) => d.amount), 0);
  const paddedMax = Math.ceil(maxAmount * 1.1);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fontWeight: 500, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `₦${(v / 1_000_000).toFixed(0)}M`}
            domain={[0, paddedMax || 1]}
            allowDecimals
            tick={{ fontSize: 12, fontWeight: 500, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: "#3A57E8", strokeWidth: 0.5 }}
            contentStyle={{ fontSize: "13px", borderRadius: "8px" }}
            formatter={(value: number, name) => {
              if (name === "amount") return [`₦${value.toLocaleString()}`, "Total"];
              return [value, name];
            }}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#3A57E8"
            strokeWidth={2}
            dot={{ stroke: "#3A57E8", strokeWidth: 2, r: 3, fill: "white" }}
            activeDot={{ r: 5 }}
            name="Total"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionsInsights;
