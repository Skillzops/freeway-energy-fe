// src/Pages/Dashboard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "./PageLayout";

// Top metrics + charts
import Revenue from "@/assets/agents/Revenue.png";
import gradientsales from "@/assets/sales/gradientsales.svg";
import greencustomer from "@/assets/customers/greencustomer.svg";
import dashboardbadge from "@/assets/RedIconsSvg/Dashboard.svg";
import DashboardCard from "@/Components/DashBoardCard/DashBoard";
import SalesChart, { SalesGraphPoint } from "@/Components/DashBoardCard/SaleSGraph";
import SalesCategoryPie from "@/Components/DashBoardCard/SalesCategoryPie";
import TransactionsInsights from "@/Components/DashBoardCard/TransactionInsight";

// Wallet + modals
import PurchaseCredit from "@/Components/Agents/DashBoardCard/PurchaseCreditModal";
// import WalletCard from "@/Components/DashBoardCard/DashboardTable";
import SecondaryModal from "@/Components/ModalSecondary/SecondaryModal";
import TopUpWalletForm from "@/Components/Agents/DashBoardCard/TopWalletForm";
import wallet from "@/assets/agents/wallet.svg";

// Small UI bits
import dropdown from "@/assets/table/dropdown.svg";
import dateIcon from "@/assets/table/date.svg";

// App infra
import { useApiCall } from "@/utils/useApiCall";
import { toast } from "react-toastify";

// Right column: Tasks card
// import NewTasks from "@/Components/DashBoardCard/NewTasks";

// Installer Drawer bits (uses your Modal & shared UI)
import { Modal } from "@/Components/ModalComponent/Modal";
import ListPagination from "@/Components/PaginationComponent/ListPagination";
import { DataStateWrapper } from "@/Components/Loaders/DataStateWrapper";
import { TableSearch } from "@/Components/TableSearchComponent/TableSearch";
import searchIcon from "@/assets/search.svg";

// Data hook
import { useGetAgentOverviewQuery } from "@/redux/AgentOverview";
import WalletCard from "@/Components/Agents/DashBoardCard/DashboardTable";
import NewTasks from "@/Components/Agents/DashBoardCard/NewTasks";



type ExtendedSalesPoint = SalesGraphPoint & {
  category?: string;
  paymentMode?: string; // legacy fallback
  status?: "COMPLETED" | "IN_INSTALLMENT" | "UNPAID" | "CANCELLED";
};

type NormalizedTask = {
  id: string;
  saleId?: string;
  customerId?: string;
  pickupLocation?: string;
  description?: string;
  scheduledDate?: string;
  deviceId?: string;
  productTags?: string[];
  tokenStatus?: boolean;
};

const STATUS_OPTIONS: Array<"ALL" | "COMPLETED" | "IN_INSTALLMENT" | "UNPAID" | "CANCELLED"> = [
  "ALL",
  "COMPLETED",
  "IN_INSTALLMENT",
  "UNPAID",
  "CANCELLED",
];

const MONTH_OPTIONS = [
  "ALL","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
] as const;

const Dashboard: React.FC = () => {
  // ======= Sales/Transactions filters =======
  const [status, setStatus] = useState<string>("ALL");
  const [monthFilter, setMonthFilter] = useState<string>("ALL");

  const overviewFilters = useMemo(() => {
    return {
      status: (status === "ALL" ? undefined : (status as ExtendedSalesPoint["status"])) ?? undefined,
      month: monthFilter === "ALL" ? undefined : monthFilter,
      productType: undefined,
    };
  }, [status, monthFilter]);

  const { data, isFetching } = useGetAgentOverviewQuery(overviewFilters);

  const totalSales = data?.overview?.totalSales ?? 0;
  const salesCount = data?.overview?.salesCount ?? 0;
  const totalCustomers = data?.overview?.totalCustomers ?? 0;
  const walletBalance = data?.overview?.walletBalance ?? 0;

  const filteredSales = useMemo(() => {
    const salesGraph: ExtendedSalesPoint[] = (data as any)?.charts?.salesGraph ?? [];
    let rows = salesGraph;
    if (monthFilter !== "ALL") rows = rows.filter((r) => r.month === monthFilter);
    if (status !== "ALL") {
      rows = rows.filter((r) => {
        const rowStatus = (r.status ?? r.paymentMode ?? "").toString().toUpperCase();
        return rowStatus === status;
      });
    }
    return rows;
  }, [data, monthFilter, status]);

  const badgeLabel =
    monthFilter === "ALL" ? "YEARLY SALES COUNT" : `${monthFilter.toUpperCase()} SALES COUNT`;

  // ======= Tasks (right column card) =======
  const { apiCall } = useApiCall();
  const apiRef = useRef(apiCall);
  useEffect(() => {
    apiRef.current = apiCall;
  }, [apiCall]);

  const [tasks, setTasks] = useState<NormalizedTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksPerPage] = useState(10);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0);
  const [currentTask] = useState<any>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Helper to refetch current tasks page without changing it
  const refreshTasks = () => setTasksPage((p) => p);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setTasksLoading(true);
      try {
        const res = await apiRef.current({
          endpoint: `/v1/agents/tasks?page=${tasksPage}&limit=${tasksPerPage}&isAssigned=false`,
          method: "get",
        });
        if (!mounted) return;
        const list = res?.data?.data ?? [];
        setTasks(list);
        setTasksTotal(res?.data?.total ?? 0);
        setTaskIndex((idx) => (list.length ? Math.min(idx, list.length - 1) : 0));
      } catch (e) {
        if (!mounted) return;
        console.error("Tasks fetch error:", e);
        setTasks([]);
        setTasksTotal(0);
        setTaskIndex(0);
        setSelectedTaskId(null);
      } finally {
        if (mounted) setTasksLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [tasksPage, tasksPerPage]);

  const handlePrevTask = () => {
    if (tasksLoading) return;
    if (tasks.length === 0) return toast.info("No previous tasks.");
    if (taskIndex > 0) {
      setTaskIndex((i) => i - 1);
      return;
    }
    if (tasksPage > 1) setTasksPage((p) => p - 1);
    else toast.info("No previous tasks.");
  };

  const handleNextTask = () => {
    if (tasksLoading) return;
    if (tasks.length === 0) return toast.info("No more tasks.");
    if (taskIndex < tasks.length - 1) {
      setTaskIndex((i) => i + 1);
      return;
    }
    const shownMax = tasksPage * tasksPerPage;
    if (tasksTotal > shownMax) setTasksPage((p) => p + 1);
    else toast.info("No more tasks.");
  };

  // ======= Installer Drawer =======
  const [isAssignInstallerOpen, setIsAssignInstallerOpen] = useState(false);
  const [installerSearch, setInstallerSearch] = useState("");
  const [installersLoading, setInstallersLoading] = useState(false);
  const [installers, setInstallers] = useState<any>([]);
  const [selectedInstallerId, setSelectedInstallerId] = useState<string | null>(null);
  const [installersPage, setInstallersPage] = useState<number>(1);
  const [installersPerPage] = useState<number>(20);
  const [installersTotal, setInstallersTotal] = useState<number>(0);

  const handleOpenAssignInstaller = () => {
    setSelectedInstallerId(null);
    setIsAssignInstallerOpen(true);
  };

  useEffect(() => {
    if (!isAssignInstallerOpen) return;
    let mounted = true;
    (async () => {
      setInstallersLoading(true);
      try {
        const res = await apiRef.current({
          endpoint: `/v1/agents/installers?page=${installersPage}&limit=${installersPerPage}${
            installerSearch ? `&search=${encodeURIComponent(installerSearch)}` : ""
          }`,
          method: "get",
        });
        if (!mounted) return;
        const list = res?.data;
        setInstallers(list);
        setInstallersTotal(list?.total ?? 0);
      } catch (e) {
        if (!mounted) return;
        console.error("Installers fetch error:", e);
        setInstallers([]);
        setInstallersTotal(0);
      } finally {
        if (mounted) setInstallersLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAssignInstallerOpen, installersPage, installersPerPage, installerSearch]);

  const handleAssignInstallerDone = async () => {
    if (!selectedTaskId) return toast.error("Please select a task.");
    if (!selectedInstallerId) return toast.error("Please select an installer.");
    const body = { installerAgentId: selectedInstallerId };

    try {
      await apiRef.current({
        endpoint: `/v1/tasks/${selectedTaskId}/assign-installer-task`,
        method: "post",
        data: body,
        successMessage: "Installer assignment submitted!",
      });

      // Optimistic removal of the assigned task
      setTasks((prev) => (prev || []).filter((t) => t.id !== selectedTaskId));
      setTasksTotal((t) => Math.max(0, t - 1));

      // Adjust index and page if we removed the last visible row
      setTaskIndex((i) => {
        const nextLen = Math.max(0, (tasks?.length ?? 0) - 1);
        return nextLen ? Math.min(i, nextLen - 1) : 0;
      });

      if (tasks.length === 1 && tasksPage > 1) {
        setTasksPage((p) => p - 1); // go back one page if current page becomes empty
      } else {
        refreshTasks(); // re-fetch current page
      }

      // Close + reset selection
      setSelectedTaskId(null);
      setIsAssignInstallerOpen(false);
    } catch (e: any) {
      console.error("Tasks Assignment error:", e);
      toast.error(e?.data?.message ?? e?.message ?? "Tasks Assignment error:");
    }
  };

  // ======= Wallet Modals toggles =======
  const [isPurchaseCreditOpen, setIsPurchaseCreditOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [, setIsTransactionHistoryOpen] = useState(false);

  const handleOpenPurchaseCredit = () => setIsPurchaseCreditOpen(true);
  const handleOpenTopUpModal = () => setIsTopUpModalOpen(true);
  const handleViewTransactionHistory = () => setIsTransactionHistoryOpen(true);

  // ======= Product Categories Pie =======
  type ProductCategorySlice = { name: string; count: number; value: number; percentage: string };
  const productCategoriesPie: ProductCategorySlice[] =
    (data as any)?.charts?.productCategoriesPieChart ?? [];

  return (
    <PageLayout pageName="Dashboard" badge={dashboardbadge}>
      <section className="w-full px-4 md:px-8 py-6 space-y-8">
        {/* ===== Top Cards ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-[1375px] mx-auto">
          <DashboardCard
            title="Revenue"
            icon={Revenue}
            bgColor="bg-paleGrayGradient"
            value={isFetching ? "—" : totalSales.toLocaleString()}
            prefix="₦"
            description="Value of Total Sales"
          />
          <DashboardCard
            title="Sales"
            icon={gradientsales}
            bgColor="bg-paleGrayGradient"
            value={isFetching ? "—" : salesCount}
            description="Total Count For Sales"
          />
          <DashboardCard
            title="Customers"
            icon={greencustomer}
            description="Total Assigned Customers"
            value={isFetching ? "—" : totalCustomers}
            bgColor="bg-paleGrayGradient"
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

              <div className="w-full h-[300px]">
                <SalesChart data={filteredSales} />
              </div>

              <div className="flex gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#4FD1C5] rounded-full"></span>
                  <span className="text-sm text-textGrey">Sales Count</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#3A57E8] rounded-full"></span>
                  <span className="text-sm text-textGrey">Target</span>
                </div>
              </div>

              {/* Cards + Pie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full max-w-[1024px]">
                <DashboardCard
                  title="Revenue"
                  icon={Revenue}
                  bgColor="bg-paleGrayGradient"
                  value={isFetching ? "—" : totalSales.toLocaleString()}
                  prefix="₦"
                  description="Value of Total Sales"
                />
                <DashboardCard
                  title="Sales"
                  icon={gradientsales}
                  bgColor="bg-paleGrayGradient"
                  value={isFetching ? "—" : salesCount}
                  description="Total Count For Sales"
                />
                <SalesCategoryPie data={productCategoriesPie} isLoading={isFetching} />
              </div>
            </div>
          </div>

          {/* Wallet Card */}
          <div >
            <WalletCard
              onPurchaseCredit={handleOpenPurchaseCredit}
              onTopUpWallet={handleOpenTopUpModal}
              onViewTransactionHistory={handleViewTransactionHistory}
              walletBalance={walletBalance}
            />
          </div>
        </div>

        {/* Purchase Credit */}
        <PurchaseCredit isOpen={isPurchaseCreditOpen} setIsOpen={setIsPurchaseCreditOpen} />

        {/* Top Up Modal */}
        <SecondaryModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          width="w-98"
          height="min-h-[300px]"
          headerIcon={<img src={wallet} alt="Wallet" className="w-10 h-10" />}
        >
          <TopUpWalletForm handleClose={() => setIsTopUpModalOpen(false)} refreshTable={() => {}} />
        </SecondaryModal>

        {/* ======= Transactions + New Tasks ======= */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_359px] gap-6 w-full max-w-[1375px] mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between w-full max-w-full md:w-[975px] h-[40px] rounded-full border-[0.6px] px-4 py-2 bg-paleGrayGradient border-strokeGreyThree">
              <h2 className="font-bold text-[14px] tracking-[0.7px] text-textDarkGrey font-primary">TRANSACTIONS</h2>

              {/* SAME FILTERS AS SALES */}
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
                <h3 className="text-xs font-medium text-textGrey">Transactions Line Graph</h3>
              </div>
              <div className="flex items-center gap-2 pl-2 pr-1 bg-[#3951B6] border-[0.6px] border-strokeGreyThree rounded-full">
                <span className="text-xs font-medium text-white">TOTAL TRANSACTIONS</span>
              </div>
            </div>

            <div className="w-full h-[300px]">
              <TransactionsInsights
                status={status === "ALL" ? undefined : (status as ExtendedSalesPoint["status"])}
                month={monthFilter === "ALL" ? undefined : monthFilter}
              />
            </div>
          </div>

          <div>
            <NewTasks
              tasks={tasks}
              onAssign={(id) => {
                setSelectedTaskId(id);
                handleOpenAssignInstaller();
              }}
              onPrevTask={handlePrevTask}
              onNextTask={handleNextTask}
              isSelected={Boolean(currentTask && selectedTaskId === currentTask.id)}
              onToggleSelect={(id) => {
                if (!currentTask) return;
                setSelectedTaskId(id);
              }}
            />
          </div>
        </div>

        {/* ======= Select Installer Drawer ======= */}
        <Modal
          isOpen={isAssignInstallerOpen}
          onClose={() => setIsAssignInstallerOpen(false)}
          layout="right"
          size="large"
          bodyStyle="pb-[100px]"
          headerClass="h-[65px]"
          leftHeaderContainerClass="h-full items-start pl-1"
          leftHeaderComponents={
            <h2 style={{ textShadow: "0.5px 1px grey" }} className="text-textBlack text-xl font-semibold font-secondary">
              Select Installer
            </h2>
          }
          rightHeaderContainerClass="h-full items-start"
        >
          <div className="flex flex-col gap-2 px-4 py-8">
            {/* Top row */}
            <div className="flex items-center justify-between w-full">
              <ListPagination
                totalItems={installersTotal}
                itemsPerPage={installersPerPage}
                currentPage={installersPage}
                onPageChange={setInstallersPage}
                label="Installers"
              />
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center bg-[#F9F9F9] px-2 text-textDarkGrey w-max gap-1 h-[24px] border-[0.6px] border-strokeGreyThree rounded-full">
                  <p className="flex items-center justify-center text-xs">
                    Item{selectedInstallerId ? "" : "s"} Selected
                  </p>
                  <span className="flex items-center justify-center w-max h-4 px-1 bg-[#EAEEF2] text-xs border-[0.2px] border-strokeGrey rounded-full">
                    {selectedInstallerId ? 1 : 0}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!selectedInstallerId || !selectedTaskId}
                  onClick={handleAssignInstallerDone}
                  className={`text-sm ${
                    !selectedInstallerId || !selectedTaskId
                      ? "bg-[#F6F8FA] text-textDarkGrey cursor-not-allowed"
                      : "bg-primaryGradient text-white"
                  } h-[24px] px-4 border-[0.6px] border-strokeGreyTwo rounded-full`}
                  title={
                    !selectedTaskId
                      ? "Select a task first (click the task card)"
                      : !selectedInstallerId
                      ? "Select an installer"
                      : "Assign"
                  }
                >
                  Done
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="w-full">
              <TableSearch
                name="Search"
                onSearch={(query: string) => {
                  setInstallerSearch(query);
                  setInstallersPage(1);
                }}
                queryValue={installerSearch}
                setQueryValue={setInstallerSearch}
                refreshTable={() => {}}
                placeholder="Search installers here"
                containerClass="w-full"
                inputContainerStyle="w-full"
                inputClass="w-full h-[32px] pl-3 bg-[#F9F9F9]"
                buttonContainerStyle="w-full h-[32px] pl-3 pr-2 bg-white shadow-innerCustom"
                icon={searchIcon}
              />
            </div>

            {/* List */}
            <DataStateWrapper
              isLoading={installersLoading}
              error={null}
              errorStates={null}
              refreshData={() => setInstallersPage((p) => p)}
              errorMessage="Failed to fetch installers"
            >
              {installersTotal > 0 ? (
                <div className="border border-gray-200 rounded-xl max-h-[420px] overflow-y-auto">
                  <ul className="divide-y divide-gray-100">
                    {installers.installers?.map((inst: any) => {
                      const selected = selectedInstallerId === inst?.id;
                      return (
                        <li
                          key={inst.id}
                          className={`flex items-center justify-between p-3 cursor-pointer ${
                            selected ? "bg-[#F6F8FA]" : ""
                          }`}
                          onClick={() => setSelectedInstallerId(selected ? null : inst?.id)}
                          title={`Click to ${selected ? "unselect" : "select"} ${inst.name || "installer"}`}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {inst?.user?.firstname ?? inst?.firstname} {inst?.user?.lastname ?? inst?.lastname}
                            </p>
                            <p className="text-xs text-gray-500">
                              {inst.user?.location ? ` 📍 ${inst?.user?.location}` : ""} <br />
                              {inst.user?.email ? ` ✉️ ${inst?.user?.email}` : ""}
                            </p>
                          </div>
                          <span
                            className={`inline-flex w-4 h-4 rounded-full border ${
                              selected ? "border-[#D4442E] ring-2 ring-[#FECB45]" : "border-gray-300"
                            }`}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full pt-16">
                  <p className="text-textBlack font-medium">No installers found</p>
                </div>
              )}
            </DataStateWrapper>
          </div>
        </Modal>
      </section>
    </PageLayout>
  );
};

export default Dashboard;
