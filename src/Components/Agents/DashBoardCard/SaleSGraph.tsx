import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type SalesGraphPoint = {
  month: string;
  sales: number;
  value?: number;
};

type Props = {
  data: SalesGraphPoint[];
};

const SalesChart: React.FC<Props> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={data}
      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      barCategoryGap={10}
      barGap={4}
    >
      <defs>
        <linearGradient id="primaryGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--brand-primary)" />
          <stop offset="100%" stopColor="var(--brand-accent)" />
        </linearGradient>
      </defs>

      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3F0FF" />

      <XAxis
        dataKey="month"
        axisLine={false}
        tickLine={false}
        tick={{ fill: "#8A92A6", fontSize: 12, fontFamily: "inherit" }}
      />

      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: "#8A92A6", fontSize: 12, fontFamily: "inherit" }}
        tickFormatter={(value) => `${value} sales`}
      />

      <Tooltip
        contentStyle={{
          background: "#FFFFFF",
          border: "1px solid #E3F0FF",
          borderRadius: "6px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.05)",
        }}
        formatter={(value: number) => [`${value} sales`, ""]}
      />

      <Bar
        dataKey="sales"
        fill="url(#primaryGradient)"
        radius={[12, 12, 12, 12]}
        barSize={30}
        name="Sales Count"
      />
    </BarChart>
  </ResponsiveContainer>
);

export default SalesChart;
