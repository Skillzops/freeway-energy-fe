import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DistributionPoint = {
  name?: string;
  value?: number;
  percentage?: string | number;
};

type CustomerInsights = {
  genderChart?: DistributionPoint[];
  generatorSizeChart?: DistributionPoint[];
  dailyRuntimeChart?: DistributionPoint[];
  monthlyFuelSpendChart?: DistributionPoint[];
  electricityPainPointsChart?: DistributionPoint[];
  profileCompletion?: {
    total?: number;
    withGender?: number;
    withEnergyProfile?: number;
    genderCompletionPct?: number;
    energyProfileCompletionPct?: number;
  };
};

type Props = {
  customerCategoryChart?: DistributionPoint[];
  customerBusinessChart?: DistributionPoint[];
  customerInsights?: CustomerInsights;
};

const COLORS = ["#00CCFF", "#345FAA", "#00AF50", "#8396E7", "#828DA9", "#FFB86B"];

const toNumber = (value: unknown) => {
  const casted = Number(value);
  return Number.isFinite(casted) ? casted : 0;
};

const toDisplayLabel = (value: unknown, fallback = "Value") => {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  return raw
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const mapDistribution = (
  source: DistributionPoint[] | undefined,
  fallbackLabel: string,
) => {
  const rows = source ?? [];
  const total = rows.reduce((sum, item) => sum + toNumber(item.value), 0);
  return rows
    .map((item) => {
      const value = toNumber(item.value);
      const percentage =
        toNumber(item.percentage) > 0
          ? toNumber(item.percentage)
          : total > 0
            ? (value / total) * 100
            : 0;
      return {
        name: toDisplayLabel(item.name, fallbackLabel),
        value,
        percentage,
      };
    })
    .sort((a, b) => b.value - a.value);
};

const BarCard = ({
  title,
  subtitle,
  data,
  emptyLabel,
  color = "#00CCFF",
}: {
  title: string;
  subtitle: string;
  data: Array<{ name: string; value: number; percentage: number }>;
  emptyLabel: string;
  color?: string;
}) => (
  <article className="rounded-2xl border border-[#EEF1F5] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    {data.length ? (
      <>
        <div className="mt-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748B" }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex justify-between text-sm">
              <span className="text-slate-600">{item.name}</span>
              <span className="font-semibold text-slate-900">
                {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="py-14 text-sm text-slate-500">{emptyLabel}</div>
    )}
  </article>
);

const PieCard = ({
  title,
  subtitle,
  data,
  emptyLabel,
}: {
  title: string;
  subtitle: string;
  data: Array<{ name: string; value: number; percentage: number }>;
  emptyLabel: string;
}) => (
  <article className="rounded-2xl border border-[#EEF1F5] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    {data.length ? (
      <>
        <div className="mt-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="54%"
                outerRadius="88%"
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, i) => (
            <div key={item.name} className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-slate-600">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-900">
                {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="py-14 text-sm text-slate-500">{emptyLabel}</div>
    )}
  </article>
);

const CustomerInsightsAnalytics = ({
  customerCategoryChart,
  customerBusinessChart,
  customerInsights,
}: Props) => {
  const categoryData = useMemo(
    () => mapDistribution(customerCategoryChart, "Category"),
    [customerCategoryChart],
  );
  const businessData = useMemo(
    () => mapDistribution(customerBusinessChart, "Business"),
    [customerBusinessChart],
  );
  const genderData = useMemo(
    () => mapDistribution(customerInsights?.genderChart, "Gender"),
    [customerInsights?.genderChart],
  );
  const fuelData = useMemo(
    () => mapDistribution(customerInsights?.monthlyFuelSpendChart, "Spend"),
    [customerInsights?.monthlyFuelSpendChart],
  );
  const generatorData = useMemo(
    () => mapDistribution(customerInsights?.generatorSizeChart, "Size"),
    [customerInsights?.generatorSizeChart],
  );
  const runtimeData = useMemo(
    () => mapDistribution(customerInsights?.dailyRuntimeChart, "Runtime"),
    [customerInsights?.dailyRuntimeChart],
  );
  const painData = useMemo(
    () => mapDistribution(customerInsights?.electricityPainPointsChart, "Pain point"),
    [customerInsights?.electricityPainPointsChart],
  );

  const completion = customerInsights?.profileCompletion;

  return (
    <div className="space-y-6">
      {completion && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-[#EEF1F5] bg-white p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Total customers</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {toNumber(completion.total).toLocaleString()}
            </p>
          </article>
          <article className="rounded-2xl border border-[#EEF1F5] bg-white p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Gender captured</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {toNumber(completion.genderCompletionPct)}%
            </p>
            <p className="text-xs text-slate-500">
              {toNumber(completion.withGender).toLocaleString()} customers
            </p>
          </article>
          <article className="rounded-2xl border border-[#EEF1F5] bg-white p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Energy profile</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {toNumber(completion.energyProfileCompletionPct)}%
            </p>
            <p className="text-xs text-slate-500">
              {toNumber(completion.withEnergyProfile).toLocaleString()} with fuel/gen/runtime/pain data
            </p>
          </article>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PieCard
          title="Customers by gender"
          subtitle="Gender distribution across customers"
          data={genderData}
          emptyLabel="No gender data recorded yet."
        />
        <BarCard
          title="Customers by category"
          subtitle="Category breakdown"
          data={categoryData}
          emptyLabel="No category data available."
        />
        <BarCard
          title="Customers by business type"
          subtitle="Business / shop type breakdown"
          data={businessData}
          emptyLabel="No business type data available."
          color="#345FAA"
        />
        <BarCard
          title="Monthly fuel spend"
          subtitle="Estimated monthly fuel spend buckets"
          data={fuelData}
          emptyLabel="No fuel spend data captured yet."
          color="#FFB86B"
        />
        <PieCard
          title="Generator size"
          subtitle="Reported generator capacity"
          data={generatorData}
          emptyLabel="No generator size data yet."
        />
        <PieCard
          title="Daily runtime"
          subtitle="Typical daily generator runtime"
          data={runtimeData}
          emptyLabel="No daily runtime data yet."
        />
      </div>

      <BarCard
        title="Electricity pain points"
        subtitle="Top reported challenges (outages, cost, fuel, etc.)"
        data={painData}
        emptyLabel="No pain point data captured yet."
        color="#8396E7"
      />
    </div>
  );
};

export default CustomerInsightsAnalytics;
