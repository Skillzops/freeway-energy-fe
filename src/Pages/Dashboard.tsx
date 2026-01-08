// src/Pages/Dashboard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "./PageLayout";

// Top metrics + charts
import Icon from "@/assets/agents/Icon.png";
import Icon1 from "@/assets/agents/Icon1.png";
import Icon2 from "@/assets/agents/Icon2.png";
import Icon3 from "@/assets/agents/Icon3.png";

import dashboardbadge from "@/assets/RedIconsSvg/Dashboard.svg";
import DashboardCard from "@/Components/DashBoardCard/DashBoard";
import SalesChart, { SalesGraphPoint } from "@/Components/DashBoardCard/SaleSGraph";
import SalesCategoryPie from "@/Components/DashBoardCard/SalesCategoryPie";
import TransactionsInsights from "@/Components/DashBoardCard/TransactionInsight";

// Small UI bits
import dropdown from "@/assets/table/dropdown.svg";
import dateIcon from "@/assets/table/date.svg";

// App infra
import { useApiCall } from "@/utils/useApiCall";

// Installer Drawer bits (uses your Modal & shared UI)
import AgentLeaderboard from "@/Components/DashBoardCard/AgentLeaderboard";
import useGetAdminOverviewQuery from "@/redux/AdminOverview";
import InventaryTable from "@/Components/DashBoardCard/InventaryTable";


const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const monthFromISO = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : MONTHS[d.getMonth()];
};

type ExtendedSalesPoint = SalesGraphPoint & {
  derivedMonth?: string;
};

const STATUS_OPTIONS: Array<"ALL" | "COMPLETED" | "IN_INSTALLMENT" | "UNPAID" | "CANCELLED"> = [
  "ALL",
  "COMPLETED",
  "IN_INSTALLMENT",
  "UNPAID",
  "CANCELLED",
];

const MONTH_OPTIONS = [
  "ALL", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
] as const;

// Transaction Trends local type for the second chart
type TxPoint = {
  month: (typeof MONTHS)[number];
  sales: number;
  salesValue: number;
  payments: number;
  paymentsValue: number;
  status: "COMPLETED" | "IN_INSTALLMENT" | "UNPAID" | "CANCELLED";
};

const Dashboard: React.FC = () => {
  // ======= Sales/Transactions filters =======
  const [status, setStatus] = useState<string>("ALL");
  const [monthFilter, setMonthFilter] = useState<string>("ALL");

  const overviewFilters = useMemo(() => {
    return {
      status: status === "ALL" ? undefined : (status as TxPoint["status"]),
      month: monthFilter === "ALL" ? undefined : monthFilter,
      productType: undefined,
    };
  }, [status, monthFilter]);

  const { data, isFetching, refetch } = useGetAdminOverviewQuery(overviewFilters);

  const totalRevenue = data?.overview?.totalRevenue ?? 0;
  const totalSales = data?.overview?.totalSales ?? 0;
  const totalCustomers = data?.overview?.totalCustomers ?? 0;
  // payload sometimes uses totalAgents vs totalAgent; prefer totalAgents and fallback to totalAgent
  const totalAgent = (data as any)?.overview?.totalAgents ?? (data as any)?.overview?.totalAgent ?? 0;

  // ======= SALES GRAPH: use charts.salesChart (daily points) =======
  const salesDaily: ExtendedSalesPoint[] = useMemo(() => {
    const items: any[] = (data as any)?.charts?.salesChart ?? [];
    return items.map((it) => {
      const iso = String(it?.date ?? "");
      const d = new Date(iso);
      const valid = !isNaN(d.getTime());
      const m = valid ? MONTHS[d.getMonth()] : ("—" as const);
      const dd = valid ? String(d.getDate()).padStart(2, "0") : "—";
      const label = valid ? `${m} ${dd}` : (iso || "—");
      return {
        month: label,
        sales: Number(it?.count ?? 0),
        value: Number(it?.value ?? 0),
        derivedMonth: m,
      };
    });
  }, [data]);

  // Apply UI filters on the mapped daily points
  const filteredSales: SalesGraphPoint[] = useMemo(() => {
    let rows = salesDaily;
    if (monthFilter !== "ALL") rows = rows.filter((r) => r.derivedMonth === monthFilter);
    return rows;
  }, [salesDaily, monthFilter]);

  const badgeLabel =
    monthFilter === "ALL" ? "YEARLY SALES COUNT" : `${monthFilter.toUpperCase()} SALES COUNT`;

  // ======= Tasks (right column card) =======
  const { apiCall } = useApiCall();
  const apiRef = useRef(apiCall);
  useEffect(() => {
    apiRef.current = apiCall;
  }, [apiCall]);

  // ======= Product Categories Pie =======
  type ProductCategorySlice = { name: string; count: number; value: number; percentage: string };
  const productCategoriesPie: ProductCategorySlice[] =
    (data as any)?.charts?.productCategoriesPieChart ??
    (data as any)?.charts?.productCategoriesChart ??
    [];

  // ======= TRANSACTIONS GRAPH: use charts.monthlyTrends (monthly points) =======
  const monthlyTrends: TxPoint[] = useMemo(() => {
    const items: any[] = (data as any)?.charts?.monthlyTrends ?? [];
    return items.map((m) => ({
      month: String(m.month) as TxPoint["month"],
      sales: Number(m.sales ?? 0),
      salesValue: Number(m.salesValue ?? 0),
      payments: Number(m.payments ?? 0),
      paymentsValue: Number(m.paymentsValue ?? 0),
      status: "COMPLETED",
    }));
  }, [data]);

  const filteredTransactions: TxPoint[] = useMemo(() => {
    let rows = monthlyTrends;
    if (monthFilter !== "ALL") rows = rows.filter((r) => r.month === monthFilter);
    if (status !== "ALL") rows = rows.filter((r) => r.status === status);
    return rows;
  }, [monthlyTrends, monthFilter, status]);

  

  return (
    <PageLayout pageName="Dashboard" badge={dashboardbadge}>
      <section className="w-full px-4 md:px-8 py-10 space-y-8">
        {/* ===== Top Cards ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[1375px] mx-auto">
          <DashboardCard
            title="Revenue"
            icon={Icon}
            bgColor="bg-[#FFFFFF]"
            value={isFetching ? "—" : totalRevenue.toLocaleString()}
            prefix="₦"
            description="Value of Total "
          />
          <DashboardCard
            title="Sales"
            icon={Icon1}
            bgColor="bg-[#FFFFFF]"
            value={isFetching ? "—" : totalSales}
            description="Total Count For "
          />
          <DashboardCard
            title="Customers"
            icon={Icon2}
            description="Total Assigned "
            value={isFetching ? "—" : totalCustomers}
            bgColor="bg-[#FFFFFF]"
          />
          <DashboardCard
            title="Agents"
            icon={Icon3}
            bgColor="bg-[#FFFFFF]"
            value={isFetching ? "—" : totalAgent}
            description="Total Count For "
          />
        </div>

        {/* ===== Main Graph + Wallet ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_359px] gap-6 w-full max-w-[1375px] mx-auto">
          {/* Graph Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="w-full bg-saleGradient px-4 py-3 rounded-xl mb-3">
              <div className="flex items-center justify-between w-full max-w-full md:w-[975px] h-[40px] rounded-full border-[0.6px] px-4 py-2 bg-paleGrayGradient border-strokeGreyThree">
                <h2 className="w-[43px] h-[19px] font-bold text-[14px] leading-[100%] tracking-[0.7px] text-textDarkGrey font-primary">
                  SALES
                </h2>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  {/* Status */}
                  <div className="relative flex w-max">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="text-xs font-medium text-textGrey pl-2 pr-6 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full appearance-none"
                      title="Filter by status"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === "ALL" ? "All Status" : opt}
                        </option>
                      ))}
                    </select>
                    <img src={dropdown} alt="" className="w-4 h-4 -ml-5 pointer-events-none" />
                  </div>

                  {/* Month */}
                  <div className="relative flex w-max">
                    <select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="text-xs font-medium text-textGrey pl-2 pr-6 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full appearance-none"
                      title="Filter by month"
                    >
                      {MONTH_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m === "ALL" ? "All Months" : m}</option>
                      ))}
                    </select>
                    <img src={dateIcon} alt="" className="w-4 h-4 -ml-5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-2 mb-2 w/full md:w-[920px]">
                <div className="flex items-center gap-2 pl-2 pr-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full">
                  <h3 className="text-xs font-medium text-textGrey">Sales Count Graph</h3>
                </div>
                <div className="flex items-center gap-2 pl-2 pr-1 bg-primaryGradient border-[0.6px] border-strokeGreyThree rounded-full">
                  <span className="text-xs font-medium text-white">{badgeLabel}</span>
                </div>
              </div>

              {/* Feed the normalized & filtered daily points to the chart */}
              <div className="w-full h-[300px]" >
                <SalesChart data={filteredSales} />
              </div>

              {/* Cards + Pie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full max-w-[1024px]">
                <DashboardCard
                  title="Revenue"
                  icon={Icon}
                  bgColor="bg-paleGrayGradient"
                  value={isFetching ? "—" : totalRevenue.toLocaleString()}
                  prefix="₦"
                  description="Value of Total "
                />
                <DashboardCard
                  title="Sales"
                  icon={Icon1}
                  bgColor="bg-paleGrayGradient"
                  value={isFetching ? "—" : totalSales}
                  description="Count For Sales"
                />
                <SalesCategoryPie data={productCategoriesPie} isLoading={isFetching} />
              </div>
            </div>
          </div>

          <div className="">
            <InventaryTable
              inventoryData={data}
              isLoading={isFetching}
              refreshTable={refetch}
              setTableQueryParams={() => { }}
            />
          </div>
        </div>

        {/* ======= Transactions + New Tasks ======= */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_359px] gap-6 w-full max-w-[1375px] mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between w/full max-w-full md:w-[975px] h-[40px] rounded-full border-[0.6px] px-4 py-2 bg-paleGrayGradient border-strokeGreyThree">
              <h2 className="font-bold text-[14px] tracking-[0.7px] text-textDarkGrey font-primary">MONTHLY TRENDS</h2>

              {/* SAME FILTERS AS SALES */}
              <div className="flex items-center gap-2" >
                {/* Status */}
                <div className="relative flex w-max">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-xs font-medium text-textGrey pl-2 pr-6 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full appearance-none"
                    title="Filter by status"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === "ALL" ? "All Status" : opt}
                      </option>
                    ))}
                  </select>
                  <img src={dropdown} alt="" className="w-4 h-4 -ml-5 pointer-events-none" />
                </div>

                {/* Month */}
                <div className="relative flex w-max">
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="text-xs font-medium text-textGrey pl-2 pr-6 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full appearance-none"
                    title="Filter transactions by month"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m === "ALL" ? "All Months" : m}</option>
                    ))}
                  </select>
                  <img src={dateIcon} alt="icon" className="w-4 h-4 -ml-5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2 mb-2 w/full md:w-[920px]">
              <div className="flex items-center gap-2 pl-2 pr-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full">
                <h3 className="text-xs font-medium text-textGrey">Monthly Trends Line Graph</h3>
              </div>
              <div className="flex items-center gap-2 pl-2 pr-1 bg-[#3951B6] border-[0.6px] border-strokeGreyThree rounded-full">
                <span className="text-xs font-medium text-white">ALL TRENDS</span>
              </div>
            </div>

            <div className="w-full h-[300px]">
              <TransactionsInsights
                status={status === "ALL" ? undefined : (status as TxPoint["status"])}
                month={monthFilter === "ALL" ? undefined : monthFilter}
              />
            </div>
          </div>

          <div>
            <AgentLeaderboard />
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Dashboard;
