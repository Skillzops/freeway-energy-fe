import { useMemo, useState } from "react";
import CustomerInsightsAnalytics from "@/Components/Analytics/CustomerInsightsAnalytics";
import { FiCheckCircle, FiClock, FiCpu, FiPackage } from "react-icons/fi";
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
import dashboardbadge from "@/assets/RedIconsSvg/Dashboard.svg";
import useGetAdminOverviewQuery from "@/redux/AdminOverview";
import PageLayout from "./PageLayout";

type DistributionPoint = {
  name?: string;
  value?: number;
  percentage?: string | number;
};

type PaymentAnalyticsPoint = {
  status?: string;
  count?: number;
  totalAmount?: number;
};

type DashboardPayload = {
  overview?: {
    totalRevenue?: number;
    totalSales?: number;
    totalCustomers?: number;
    totalAgents?: number;
    totalAgent?: number;
    totalDevices?: number;
    completedPayments?: number;
    pendingTasks?: number;
    activeInventoryItems?: number;
  };
  charts?: {
    userDistributionChart?: DistributionPoint[];
    agentDistributionChart?: DistributionPoint[];
    paymentAnalyticsChart?: PaymentAnalyticsPoint[];
    customerCategoryChart?: DistributionPoint[];
    customerBusinessChart?: DistributionPoint[];
    customerInsights?: {
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
  };
  statistics?: {
    inventory?: {
      total?: number;
      inStock?: number;
      outOfStock?: number;
      lowStockItems?: number;
      discontinued?: number;
    };
    tasks?: {
      pending?: number;
    };
    geographical?: {
      states?: Array<{
        state?: string;
        count?: number;
      }>;
      lgas?: Array<{
        lga?: string;
        count?: number;
      }>;
    };
  };
};

const COLORS = ["#00CCFF", "#345FAA", "#00AF50", "#8396E7", "#828DA9"];

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
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatCurrency = (amount: number) =>
  `₦${amount.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

type PieVariant = "basic" | "doughnut" | "exploded" | "nested";

const getLargestSliceIndex = (rows: Array<{ value: number }>) => {
  if (!rows.length) return 0;
  return rows.reduce(
    (maxIndex, item, index, arr) =>
      item.value > arr[maxIndex].value ? index : maxIndex,
    0,
  );
};

type AnalyticsTab = "operations" | "customers";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("operations");
  const { data, isFetching } = useGetAdminOverviewQuery();
  const dashboardData = data as DashboardPayload | undefined;

  const userDistributionData = useMemo(() => {
    const source = dashboardData?.charts?.userDistributionChart ?? [];
    const total = source.reduce((sum, item) => sum + toNumber(item.value), 0);
    return source.map((item) => {
      const value = toNumber(item.value);
      const percentage =
        toNumber(item.percentage) > 0
          ? toNumber(item.percentage)
          : total > 0
            ? (value / total) * 100
            : 0;
      return {
        name: item.name || "User",
        value,
        percentage,
      };
    });
  }, [dashboardData?.charts?.userDistributionChart]);

  const agentDistributionData = useMemo(() => {
    const source = dashboardData?.charts?.agentDistributionChart ?? [];
    const total = source.reduce((sum, item) => sum + toNumber(item.value), 0);
    return source.map((item) => {
      const value = toNumber(item.value);
      const percentage =
        toNumber(item.percentage) > 0
          ? toNumber(item.percentage)
          : total > 0
            ? (value / total) * 100
            : 0;
      return {
        name: item.name || "Category",
        value,
        percentage,
      };
    });
  }, [dashboardData?.charts?.agentDistributionChart]);

  const paymentAnalyticsData = useMemo(() => {
    const source = dashboardData?.charts?.paymentAnalyticsChart ?? [];
    const total = source.reduce(
      (sum, item) =>
        sum + Math.max(toNumber(item.totalAmount), toNumber(item.count)),
      0,
    );
    return source.map((item) => {
      const count = toNumber(item.count);
      const totalAmount = toNumber(item.totalAmount);
      const value = Math.max(totalAmount, count);
      const percentage = total > 0 ? (value / total) * 100 : 0;

      return {
        name: item.status || "Unknown",
        count,
        totalAmount,
        value,
        percentage,
      };
    });
  }, [dashboardData?.charts?.paymentAnalyticsChart]);

  const paymentAnalyticsPieData = useMemo(() => {
    const largestSliceIndex = getLargestSliceIndex(paymentAnalyticsData);
    return paymentAnalyticsData.map((item, index) => ({
      ...item,
      outerRadiusValue: index === largestSliceIndex ? 92 : 80,
    }));
  }, [paymentAnalyticsData]);

  const stateGeographicalData = useMemo(() => {
    const source = dashboardData?.statistics?.geographical?.states ?? [];
    const total = source.reduce((sum, item) => sum + toNumber(item.count), 0);
    return source
      .map((item) => {
        const value = toNumber(item.count);
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return {
          name: item.state || "Unknown State",
          value,
          percentage,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [dashboardData?.statistics?.geographical?.states]);

  const lgaGeographicalData = useMemo(() => {
    const source = dashboardData?.statistics?.geographical?.lgas ?? [];
    const total = source.reduce((sum, item) => sum + toNumber(item.count), 0);
    return source
      .map((item) => {
        const value = toNumber(item.count);
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return {
          name: item.lga || "Unknown LGA",
          value,
          percentage,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [dashboardData?.statistics?.geographical?.lgas]);

  const inventoryTotal = toNumber(dashboardData?.statistics?.inventory?.total);
  const inventoryInStock = toNumber(dashboardData?.statistics?.inventory?.inStock);
  const inventoryOutOfStock = toNumber(
    dashboardData?.statistics?.inventory?.outOfStock,
  );
  const inventoryLowStock = toNumber(
    dashboardData?.statistics?.inventory?.lowStockItems,
  );
  const inventoryDiscontinued = toNumber(
    dashboardData?.statistics?.inventory?.discontinued,
  );

  const inventoryRows = useMemo(
    () => [
      { label: "In Stock", value: inventoryInStock, color: "#16A34A" },
      { label: "Low Stock", value: inventoryLowStock, color: "#D97706" },
      { label: "Out of Stock", value: inventoryOutOfStock, color: "#DC2626" },
      { label: "Discontinued", value: inventoryDiscontinued, color: "#64748B" },
    ],
    [
      inventoryDiscontinued,
      inventoryInStock,
      inventoryLowStock,
      inventoryOutOfStock,
    ],
  );

  const inventoryBase = Math.max(
    1,
    inventoryTotal ||
      inventoryInStock + inventoryOutOfStock + inventoryDiscontinued,
  );

  const inventoryPieData = useMemo(
    () =>
      inventoryRows
        .filter((item) => item.value > 0)
        .map((item) => ({
          ...item,
          name: item.label,
          percentage: (item.value / inventoryBase) * 100,
        })),
    [inventoryRows, inventoryBase],
  );

  const totalDevices = toNumber(dashboardData?.overview?.totalDevices);
  const completedPayments = toNumber(dashboardData?.overview?.completedPayments);
  const pendingTasks = toNumber(
    dashboardData?.overview?.pendingTasks ??
      dashboardData?.statistics?.tasks?.pending,
  );
  const activeInventoryItems = toNumber(
    dashboardData?.overview?.activeInventoryItems ??
      dashboardData?.statistics?.inventory?.inStock ??
      dashboardData?.statistics?.inventory?.total,
  );

  const extraOverviewCards = [
    {
      title: "Total Devices",
      value: totalDevices.toLocaleString(),
      subtitle: "Connected devices",
      icon: <FiCpu size={16} />,
      iconClass: "bg-[#E6FAFF] text-primary-hex",
    },
    {
      title: "Completed Payments",
      value: completedPayments.toLocaleString(),
      subtitle: "Successful payments",
      icon: <FiCheckCircle size={16} />,
      iconClass: "bg-[#E8FBF1] text-[#0E9F6E]",
    },
    {
      title: "Pending Tasks",
      value: pendingTasks.toLocaleString(),
      subtitle: "Awaiting action",
      icon: <FiClock size={16} />,
      iconClass: "bg-[#FFF4D6] text-[#D97706]",
    },
    {
      title: "Active Inventory",
      value: activeInventoryItems.toLocaleString(),
      subtitle: "In-stock items",
      icon: <FiPackage size={16} />,
      iconClass: "bg-[#E6FAFF] text-primary-hex",
    },
  ];

  const renderPieCard = (
    title: string,
    subtitle: string,
    dataRows: Array<{ name: string; value: number; percentage: number }>,
    emptyLabel: string,
    variant: PieVariant = "doughnut",
  ) => {
    const largestSliceIndex = getLargestSliceIndex(dataRows);
    const pieRows =
      variant === "exploded"
        ? dataRows.map((item, index) => ({
            ...item,
            outerRadiusValue: index === largestSliceIndex ? 92 : 80,
          }))
        : dataRows;

    return (
      <article className="rounded-2xl border border-[#EEF1F5] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        {dataRows.length ? (
          <>
            <div className="mt-4 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieRows}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={
                      variant === "doughnut" ? "54%" : variant === "exploded" ? "0%" : "0%"
                    }
                    outerRadius={
                      variant === "exploded"
                        ? (entry: { outerRadiusValue?: number }) =>
                            entry.outerRadiusValue ?? 80
                        : "88%"
                    }
                    paddingAngle={variant === "exploded" ? 4 : 2}
                    stroke="#FFFFFF"
                    strokeWidth={variant === "basic" ? 2 : 3}
                  >
                    {dataRows.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    isAnimationActive={false}
                    wrapperStyle={{ zIndex: 20 }}
                    formatter={(value: number, _name: string, item: { payload?: { percentage?: number; name?: string } }) => {
                      const pieValue = toNumber(value).toLocaleString();
                      const pct = toNumber(item?.payload?.percentage);
                      return [
                        pct > 0 ? `${pieValue} (${pct.toFixed(1)}%)` : pieValue,
                        toDisplayLabel(item?.payload?.name, "Value"),
                      ];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 space-y-2">
              {dataRows.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
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
  };

  return (
    <PageLayout pageName="Analytics" badge={dashboardbadge}>
      <section className="w-full px-4 md:px-8 pt-2 pb-10">
        <div className="mx-auto w-full max-w-[1375px] space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex w-full max-w-md rounded-full border-[0.6px] border-strokeGreyThree bg-white p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("operations")}
                className={`flex-1 h-9 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === "operations"
                    ? "bg-primaryGradient text-white shadow-sm"
                    : "bg-transparent text-textBlack hover:bg-[#F6F8FA]"
                }`}
              >
                Operations
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("customers")}
                className={`flex-1 h-9 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === "customers"
                    ? "bg-primaryGradient text-white shadow-sm"
                    : "bg-transparent text-textBlack hover:bg-[#F6F8FA]"
                }`}
              >
                Customer insights
              </button>
            </div>
            {isFetching && (
              <span className="text-xs text-slate-400 shrink-0">Refreshing…</span>
            )}
          </div>

          {activeTab === "customers" ? (
            <CustomerInsightsAnalytics
              customerCategoryChart={dashboardData?.charts?.customerCategoryChart}
              customerBusinessChart={dashboardData?.charts?.customerBusinessChart}
              customerInsights={dashboardData?.charts?.customerInsights}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {extraOverviewCards.map((card) => (
                  <article
                    key={card.title}
                    className="rounded-2xl border border-[#EEF1F5] bg-white p-4 min-h-[142px] shadow-[0_10px_20px_rgba(15,23,42,0.05)] flex flex-col"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">
                          {card.title}
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                          {card.value}
                        </h2>
                      </div>
                      <span className={`rounded-xl p-2 ${card.iconClass}`}>
                        {card.icon}
                      </span>
                    </div>
                    <p className="mt-auto text-[10px] font-semibold text-slate-500">
                      {card.subtitle}
                    </p>
                  </article>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {renderPieCard(
                  "User Distribution",
                  "Role composition",
                  userDistributionData,
                  "No user distribution data available.",
                  "basic",
                )}
                {renderPieCard(
                  "Agent Distribution",
                  "Agent categories split",
                  agentDistributionData,
                  "No agent distribution data available.",
                  "doughnut",
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <article className="rounded-2xl border border-[#EEF1F5] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Payment Analytics
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Payment status breakdown
                  </p>
                  {paymentAnalyticsData.length ? (
                    <>
                      <div className="mt-4 h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={paymentAnalyticsPieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius="0%"
                              outerRadius={(entry: { outerRadiusValue?: number }) =>
                                entry.outerRadiusValue ?? 80
                              }
                              paddingAngle={4}
                              stroke="#FFFFFF"
                              strokeWidth={2}
                            >
                              {paymentAnalyticsData.map((entry, index) => (
                                <Cell
                                  key={`${entry.name}-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              isAnimationActive={false}
                              wrapperStyle={{ zIndex: 20 }}
                              formatter={(
                                _value: number,
                                _name: string,
                                item: {
                                  payload?: {
                                    count?: number;
                                    totalAmount?: number;
                                    name?: string;
                                  };
                                },
                              ) => {
                                const count = toNumber(
                                  item?.payload?.count,
                                ).toLocaleString();
                                const amount = formatCurrency(
                                  toNumber(item?.payload?.totalAmount),
                                );
                                return [
                                  `${count} txns • ${amount}`,
                                  toDisplayLabel(item?.payload?.name, "Status"),
                                ];
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-5 space-y-2">
                        {paymentAnalyticsData.map((item, index) => (
                          <div
                            key={`${item.name}-${index}`}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                              />
                              <span className="text-slate-600">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">
                                {item.count.toLocaleString()} txns
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatCurrency(item.totalAmount)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-14 text-sm text-slate-500">
                      No payment analytics data available.
                    </div>
                  )}
                </article>

                <article className="rounded-2xl border border-[#EEF1F5] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Inventory Details
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Current inventory stock breakdown
                  </p>
                  {inventoryPieData.length ? (
                    <>
                      <div className="mt-4 h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={inventoryPieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius="54%"
                              outerRadius="88%"
                              paddingAngle={2}
                              stroke="#FFFFFF"
                              strokeWidth={3}
                            >
                              {inventoryPieData.map((entry) => (
                                <Cell
                                  key={`inventory-${entry.label}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              isAnimationActive={false}
                              wrapperStyle={{ zIndex: 20 }}
                              formatter={(
                                value: number,
                                _name: string,
                                item: { payload?: { percentage?: number; name?: string } },
                              ) => {
                                const count = toNumber(value).toLocaleString();
                                const pct = toNumber(item?.payload?.percentage);
                                return [
                                  `${count} (${pct.toFixed(1)}%)`,
                                  toDisplayLabel(item?.payload?.name, "Inventory"),
                                ];
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-5 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-600">
                            Total Inventory
                          </span>
                          <span className="font-semibold text-slate-900">
                            {inventoryTotal.toLocaleString()}
                          </span>
                        </div>
                        {inventoryRows.map((item) => {
                          const percent = (item.value / inventoryBase) * 100;
                          return (
                            <div
                              key={item.label}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-slate-600">{item.label}</span>
                              </div>
                              <span className="font-semibold text-slate-900">
                                {item.value.toLocaleString()} ({percent.toFixed(1)}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="py-14 text-sm text-slate-500">
                      No inventory data available.
                    </div>
                  )}
                </article>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {renderPieCard(
                  "Geographical Stats (States)",
                  "Customer distribution by state",
                  stateGeographicalData,
                  "No state geographical data available.",
                  "doughnut",
                )}
                {renderPieCard(
                  "Geographical Stats (LGAs)",
                  "Customer distribution by LGA",
                  lgaGeographicalData,
                  "No LGA geographical data available.",
                  "exploded",
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Analytics;
