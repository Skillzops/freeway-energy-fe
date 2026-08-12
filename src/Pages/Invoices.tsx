import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import { useGetRequest } from "@/utils/useApiCall";
import invoiceBadge from "@/assets/RedIconsSvg/Sales.svg";
import greensales from "@/assets/sales/greensales.svg";
import pendingIcon from "@/assets/table/clock.svg";
import InvoicesTable from "@/Components/Invoices/InvoicesTable";

const Invoices = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isReceiptsScope = location.pathname.startsWith("/receipts");
  const basePath = isReceiptsScope ? "/receipts" : "/invoices";
  const pageTitle = isReceiptsScope ? "Receipts" : "Invoices";
  const [currentPage, setCurrentPage]   = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);

  // ── filter state ────────────────────────────────────────────────────────────
  const [search, setSearch]           = useState("");
  const [status, setStatus]           = useState("");
  const [type, setType]               = useState("");
  const [customerName, setCustomerName] = useState("");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateTo, setDueDateTo]     = useState("");
  const [pendingGroupOnly, setPendingGroupOnly] = useState(false);

  const queryParts = [
    `page=${currentPage}`,
    `limit=${entriesPerPage}`,
    isReceiptsScope && "hasReceipt=1",
    search        && `search=${encodeURIComponent(search)}`,
    status && status !== "PENDING_GROUP" && `status=${status}`,
    pendingGroupOnly && "statusGroup=pending",
    type          && `type=${type}`,
    customerName  && `customerName=${encodeURIComponent(customerName)}`,
    dateFrom      && `dateFrom=${dateFrom}`,
    dateTo        && `dateTo=${dateTo}`,
    dueDateFrom   && `dueDateFrom=${dueDateFrom}`,
    dueDateTo     && `dueDateTo=${dueDateTo}`,
  ].filter(Boolean).join("&");

  const { data, isLoading, mutate, error, errorStates } = useGetRequest(
    `/v1/invoices?${queryParts}`,
    true,
    30000,
  );
  const { data: statsData } = useGetRequest(
    `/v1/invoices/stats${isReceiptsScope ? "?hasReceipt=1" : ""}`,
    true,
    30000,
  );

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setPendingGroupOnly(false);
    setType("");
    setCustomerName("");
    setDateFrom("");
    setDateTo("");
    setDueDateFrom("");
    setDueDateTo("");
    setCurrentPage(1);
  };

  const paginationInfo = () => ({
    total: data?.total,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  });
  const invoicePaths = ["all", "paid", "pending"];
  const isCardActive = (path: string) => location.pathname === path;
  const handleTopCardFilter = (path: string) => {
    setCurrentPage(1);
    navigate(path);
  };
  const bottomLabel = isReceiptsScope ? "RECEIPTS" : "INVOICES";

  useEffect(() => {
    if (location.pathname === `${basePath}/paid`) {
      setStatus("PAID");
      setPendingGroupOnly(false);
      return;
    }
    if (location.pathname === `${basePath}/pending`) {
      setStatus("");
      setPendingGroupOnly(true);
      return;
    }
    setStatus("");
    setPendingGroupOnly(false);
  }, [basePath, location.pathname]);

  return (
    <PageLayout pageName={pageTitle} badge={invoiceBadge}>
      {/* Stats strip */}
      <section className="flex flex-wrap items-center justify-start w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
        <button type="button" onClick={() => handleTopCardFilter(`${basePath}/all`)} className={`rounded-lg transition-all ${isCardActive(`${basePath}/all`) ? "border border-[var(--brand-primary-hex)]" : "hover:-translate-y-[1px]"}`}>
          <TitlePill
            icon={invoiceBadge}
            iconBgColor="bg-[#DBEAFE]"
            topText="All"
            bottomText={bottomLabel}
            value={statsData?.total ?? data?.total}
          />
        </button>
        <button type="button" onClick={() => handleTopCardFilter(`${basePath}/paid`)} className={`rounded-lg transition-all ${isCardActive(`${basePath}/paid`) ? "border border-[var(--brand-primary-hex)]" : "hover:-translate-y-[1px]"}`}>
          <TitlePill
            icon={greensales}
            iconBgColor="bg-[#ECFDF5]"
            topText="Paid"
            bottomText={bottomLabel}
            value={statsData?.paid ?? data?.invoices?.filter((i: any) => i.status === "PAID").length}
          />
        </button>
        <button type="button" onClick={() => handleTopCardFilter(`${basePath}/pending`)} className={`rounded-lg transition-all ${isCardActive(`${basePath}/pending`) ? "border border-[var(--brand-primary-hex)]" : "hover:-translate-y-[1px]"}`}>
          <TitlePill
            icon={pendingIcon}
            iconBgColor="bg-[#FFF3D5]"
            topText="Pending"
            bottomText={bottomLabel}
            value={statsData?.pending ?? data?.invoices?.filter((i: any) =>
              ["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(i.status),
            ).length}
          />
        </button>
      </section>

      <div className="w-full px-2 py-8 md:p-8">
        <section className="relative items-start justify-center flex min-h-[415px] w-full overflow-hidden">
          <Suspense fallback={<LoadingSpinner parentClass="absolute top-[50%] w-full" />}>
            <Routes>
              <Route path="/" element={<Navigate to={`${basePath}/all`} replace />} />
              {invoicePaths.map((path) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <InvoicesTable
                      invoicesData={data}
                      isLoading={isLoading}
                      refreshTable={mutate}
                      error={error}
                      errorData={errorStates}
                      paginationInfo={paginationInfo}
                      mode={isReceiptsScope ? "receipts" : "invoices"}
                      filters={{
                        search, setSearch,
                        status, setStatus,
                        type, setType,
                        customerName, setCustomerName,
                        dateFrom, setDateFrom,
                        dateTo, setDateTo,
                        dueDateFrom, setDueDateFrom,
                        dueDateTo, setDueDateTo,
                      }}
                      onClearFilters={handleClearFilters}
                      onFilterChange={() => setCurrentPage(1)}
                    />
                  }
                />
              ))}
              <Route path="*" element={<Navigate to={`${basePath}/all`} replace />} />
            </Routes>
          </Suspense>
        </section>
      </div>
    </PageLayout>
  );
};

export default Invoices;
