/* eslint-disable @typescript-eslint/no-unused-vars */
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "./PageLayout";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import { useGetRequest, useApiCall } from "@/utils/useApiCall";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import inventorybadge from "../assets/inventory/inventorybadge.png";
import FiltersModal, { Filters } from "@/Components/ReportsTable/FiltersModal";
import { Table, PaginationType } from "@/Components/TableComponent/Table";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
import { toast } from "react-toastify";

const EXPORT_TYPES = [
  "sales",
  "customers",
  "payments",
  "devices",
  "debt_report",
  "renewal_report",
  "weekly_summary",
  "monthly_summary",
  "total_outstanding_receivables",
] as const;
type ExportType = typeof EXPORT_TYPES[number];
const DOWNLOAD_MAX_LIMIT = 5000;

type BoolAny = "any" | "true" | "false";

function formatExportLabel(t: ExportType) {

  const withSpaces = t.replace(/_/g, " ");
  return withSpaces.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatColumnTitle(key: string) {
  if (key === "__sn") return "S/N";

  return key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toISOOrUndefined(localDT?: string) {
  if (!localDT) return undefined;
  const d = new Date(localDT);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function trimParams<T extends Record<string, any>>(obj: T): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) if (!(v === undefined || v === null || v === "")) out[k] = v;
  return out;
}

function boolAnyToParam(v: BoolAny | undefined) {
  if (!v || v === "any") return undefined;
  return v === "true";
}

const isTruthy = (v: unknown) => !(v === undefined || v === null || v === "" || v === "any");
function countActiveFilters(f: Filters): number {
  return Object.values(f).reduce<number>((acc, v) => acc + (isTruthy(v) ? 1 : 0), 0);
}

function fileName(exportType: ExportType) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  return `export-${exportType}-${ts}.csv`;
}

function downloadBlobCSV(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const DownloadSpinner = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin"
    aria-hidden="true"
  >
    <path
      d="M12 2a10 10 0 1 0 10 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const amountKeyPattern = /(amount|price|revenue|total|debt|balance|outstanding|receivable|monthlypayment)s?/i;
const nf = new Intl.NumberFormat("en-NG");

// Pull device info (serial/name/key) into a single column when present
function extractDeviceInfo(row: any): string {
  const candidates = [
    row?.deviceInfo,
    row?.device,
    Array.isArray(row?.devices) ? row.devices[0] : undefined,
  ].filter(Boolean);

  const device = candidates.find(Boolean);
  if (!device) {
    if (row?.serialNumber || row?.deviceSerialNumber) {
      return (row.serialNumber || row.deviceSerialNumber) as string;
    }
    return "";
  }

  const serial =
    device.serialNumber || device.deviceSerialNumber || device?.serial || device?.meterId;
  const name = device.name || device.model || device.productName;
  const key = device.key || device.deviceKey;

  const parts = [serial, name, key].filter(Boolean);
  return parts.join(" • ");
}

function formatAmountMaybe(key: string, v: any): string {
  if (v === null || v === undefined) return "-";
  if (typeof v === "number" && amountKeyPattern.test(key)) return nf.format(v);
  if (typeof v === "string") {
    const num = Number(v);
    if (!Number.isNaN(num) && amountKeyPattern.test(key)) return nf.format(num);
    return v;
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function buildParams(
  filters: Filters,
  currentPage: number,
  entriesPerPage: number,
  exportType: ExportType,
  reloadTick: number
) {
  const {
    startDate, endDate, createdStartDate, createdEndDate,
    hasMultiplePayments, hasMadeRepayments, paymentOverdue, fullyPaid,
    hasOutstandingDebt, hasOutstandingBalance,
    isNewSale, isRenewal,
    overdueDays,
    isOverdue,
    customerState, customerLga,
    state, lga,
    ...rest
  } = filters;


  const geoState = state ?? customerState;
  const geoLga = lga ?? customerLga;

  const base = {
    ...rest,
    state: geoState,
    lga: geoLga,

    startDate: toISOOrUndefined(startDate),
    endDate: toISOOrUndefined(endDate),
    createdStartDate: toISOOrUndefined(createdStartDate),
    createdEndDate: toISOOrUndefined(createdEndDate),

    hasMultiplePayments: boolAnyToParam(hasMultiplePayments),
    hasMadeRepayments: boolAnyToParam(hasMadeRepayments),
    paymentOverdue: boolAnyToParam(paymentOverdue),
    fullyPaid: boolAnyToParam(fullyPaid),

    hasOutstandingDebt:
      boolAnyToParam(hasOutstandingDebt) ?? boolAnyToParam(hasOutstandingBalance),

    isNewSale: boolAnyToParam(isNewSale),
    isRenewal: boolAnyToParam(isRenewal),

    isOverdue: exportType === "debt_report" ? boolAnyToParam(isOverdue) : undefined,

    overdueDays:
      typeof overdueDays === "number"
        ? overdueDays
        : exportType === "renewal_report"
          ? 35
          : undefined,

    page: exportType === "weekly_summary" || exportType === "monthly_summary" ? undefined : currentPage,
    limit: exportType === "weekly_summary" || exportType === "monthly_summary" ? undefined : entriesPerPage,
    exportType,
    _rt: String(reloadTick),
  };

  if (exportType === "total_outstanding_receivables") {
    return trimParams({
      startDate: toISOOrUndefined(startDate),
      endDate: toISOOrUndefined(endDate),
      exportType,
      _rt: String(reloadTick),
    });
  }

  return trimParams(base);
}

const Reports = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const [exportType, setExportType] = useState<ExportType>("sales");
  const [filters, setFilters] = useState<Filters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const { apiCall } = useApiCall();

  const baseParams = useMemo(
    () => buildParams(filters, currentPage, entriesPerPage, exportType, reloadTick),
    [filters, currentPage, entriesPerPage, exportType, reloadTick]
  );

  const previewUrl = `/v1/export/data?${new URLSearchParams({
    ...(baseParams as any),
    format: "json",
  }).toString()}`;

  const { data: reportsJsonData, isLoading } = useGetRequest(previewUrl, true, 60000);

  const apiRows: any[] = useMemo(() => {
    if (exportType === "weekly_summary" || exportType === "monthly_summary") return [];
    const r = (reportsJsonData as any) || {};
    return Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : [];
  }, [reportsJsonData, exportType]);

  const totalFromApi = useMemo(() => {
    if (exportType === "weekly_summary" || exportType === "monthly_summary") return 1;
    const r: any = reportsJsonData || {};
    return (
      (typeof r?.allRecordsCount === "number" && r.allRecordsCount) ||
      (typeof r?.totalRecords === "number" && r.totalRecords) ||
      (typeof r?.estimatedCount === "number" && r.estimatedCount) ||
      (typeof r?.total === "number" && r.total) ||
      (Array.isArray(r?.results) && r.results.length) ||
      (Array.isArray(r?.data) && r.data.length) ||
      (Array.isArray(r) && r.length) ||
      0
    );
  }, [reportsJsonData, exportType]);

  // Use the full record count for exports so CSV downloads are not capped by the table page size
  const downloadParams = useMemo(() => {
    const { _rt, ...rest } = baseParams as any;
    const hasPagination = "page" in rest || "limit" in rest;
    if (!hasPagination) return rest;

    const maxLimit = Math.min(
      totalFromApi > 0 ? totalFromApi : rest.limit || entriesPerPage,
      DOWNLOAD_MAX_LIMIT
    );
    return {
      ...rest,
      page: 1,
      limit: maxLimit,
    };
  }, [baseParams, totalFromApi, entriesPerPage]);

  const columns = useMemo(() => {
    const keys = new Set<string>();
    let hasDeviceInfo = false;
    apiRows.slice(0, 50).forEach((row) => {
      Object.keys(row ?? {}).forEach((k) => keys.add(k));
      if (extractDeviceInfo(row)) hasDeviceInfo = true;
    });
    if (hasDeviceInfo) keys.add("deviceInfo");
    return ["__sn", ...Array.from(keys)];
  }, [apiRows]);

  const tableData = useMemo(() => {
    return apiRows.map((row, idx) => {
      const out: Record<string, any> = { __sn: (currentPage - 1) * entriesPerPage + idx + 1 };
      columns.forEach((key) => {
        if (key === "__sn") return;
        if (key === "deviceInfo") {
          out[key] = extractDeviceInfo(row) || "-";
        } else {
          out[key] = formatAmountMaybe(key, (row as any)[key]);
        }
      });
      return out;
    });
  }, [apiRows, currentPage, entriesPerPage, columns]);

  // const fileSize = useMemo(() => {
  //   const r: any = reportsJsonData || {};
  //   return typeof r?.fileSize === "number" ? r.fileSize : 0;
  // }, [reportsJsonData]);

  const columnList = useMemo(
    () =>
      columns.map((c) => ({
        title: formatColumnTitle(c),
        key: c,
      })),
    [columns]
  );

  const paginationInfo: PaginationType = () => ({
    total: totalFromApi,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage: (n: number) => {
      setEntriesPerPage(Math.max(1, Number(n) || 20));
      setCurrentPage(1);
    },
  });

  const cancelFlag = useRef<number>(0);
  const triggerCsvDownload = async (selected: ExportType) => {
    if (isDownloading) return;
    const myFlag = ++cancelFlag.current;
    setIsDownloading(true);
    try {
      const res = await apiCall({
        endpoint: "/v1/export/data",
        method: "get",
        params: { ...downloadParams, format: "csv" },
        headers: { Accept: "text/csv,application/csv;q=0.9,application/json;q=0.8,*/*;q=0.1" },
        responseType: "blob",
        showToast: false,
      });
      if (myFlag !== cancelFlag.current) return;
      const contentType = (
        (res?.headers?.["content-type"] as string | undefined) ?? ""
      ).toLowerCase();
      const blobData = res.data as Blob;

      if (!blobData || blobData.size === 0) {
        toast.error("No data available to download for this report.");
        return;
      }

      if (contentType.includes("application/json")) {
        const text = await blobData.text();
        let message = "Failed to download report. Please try again.";
        try {
          const parsed = JSON.parse(text);
          const apiMessage = parsed?.message;
          message = Array.isArray(apiMessage)
            ? apiMessage.join(", ")
            : apiMessage || message;
        } catch {
          void 0;
        }
        toast.error(message);
        return;
      }

      if (contentType.includes("csv") || contentType.includes("text/plain")) {
        downloadBlobCSV(res.data as Blob, fileName(selected));
        toast.success("Report downloaded successfully.");
      } else {
        const text = await blobData.text();
        downloadBlobCSV(new Blob([text], { type: "text/csv;charset=utf-8" }), fileName(selected));
        toast.success("Report downloaded successfully.");
      }
    } catch {
      toast.error("Failed to download report. Please try again.");
    } finally {
      if (myFlag === cancelFlag.current) {
        setIsDownloading(false);
      }
    }
  };

  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [exportType]);

  const summaryParams = useMemo(() => {
    const allowKeys = new Set([
      "startDate", "endDate", "createdStartDate", "createdEndDate",
      "agentId", "customerId", "state", "lga", "paymentMethod", "salesStatus", "paymentMode", "overdueDays",
      "isOverdue",
    ]);
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(baseParams)) {
      if (allowKeys.has(k) && v !== undefined && v !== "") cleaned[k] = v;
    }
    return cleaned;
  }, [baseParams]);

  const overdueUrl =
    exportType === "renewal_report"
      ? `/v1/export/summary/overdue-payments?${new URLSearchParams({
        ...(summaryParams as any),
        format: "json",
      }).toString()}`
      : null;

  // const totalDebtUrl =
  //   exportType === "debt_report"
  //     ? `/v1/export/summary/total-debt?${new URLSearchParams({
  //       ...(summaryParams as any),
  //       format: "json",
  //     }).toString()}`
  //     : null;

  const { data: overdueSummary, isLoading: overdueLoading } = useGetRequest(overdueUrl || "", !!overdueUrl, 60000);
  // const { data: totalDebtSummary } = useGetRequest(totalDebtUrl || "", !!totalDebtUrl, 60000);

  const summary = useMemo(() => {
    if (exportType !== "weekly_summary" && exportType !== "monthly_summary") return null;
    const r = (reportsJsonData as any) || {};
    return r?.summary ?? r ?? null;
  }, [reportsJsonData, exportType]);

  const isSummaryView = exportType === "weekly_summary" || exportType === "monthly_summary";
  const loadingPlaceholder = "...";

  return (
    <PageLayout pageName="Reports" badge={inventorybadge}>
      <section className="flex flex-wrap items-center gap-2 bg-paleGrayGradient px-2 md:px-8 py-4 min-h-[64px] w-full justify-between">
        <div className="flex items-center gap-3">
          {/* <TitlePill
            icon={inventorybadge}
            iconBgColor="bg-[#FDEEC2]"
            topText="EXPORT"
            bottomText={exportType.toUpperCase()}
            value={isLoading ? loadingPlaceholder : isSummaryView ? 1 : fileSize}
          /> */}
          {!isSummaryView && (
            <TitlePill
              icon={inventorybadge}
              iconBgColor="bg-[#D8F5E4]"
              topText="TOTAL"
              bottomText={`${exportType.toUpperCase()} RECORDS`}
              value={isLoading ? loadingPlaceholder : totalFromApi}
            />
          )}
          {exportType === "renewal_report" && (
            <TitlePill
              icon={inventorybadge}
              iconBgColor="bg-[#FFDBDE]"
              topText="OVERDUE"
              bottomText="PAYMENTS"
              value={
                overdueLoading
                  ? loadingPlaceholder
                  : (overdueSummary as any)?.totalOverduePayments ?? (overdueSummary as any)?.count ?? 0
              }
            />
          )}
          {/* {exportType === "debt_report" && (
            <TitlePill
              icon={inventorybadge}
              iconBgColor="bg-[#D8F5E4]"
              topText="TOTAL"
              bottomText="DEBT (₦)"
              value={nf.format(
                (totalDebtSummary as any)?.totalOutstandingDebt ??
                (totalDebtSummary as any)?.amount ?? 0
              )}
            />
          )} */}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="exportType" className="text-sm font-medium">
            Export type:
          </label>
          <select
            id="exportType"
            value={exportType}
            onChange={(e) => setExportType(e.target.value as ExportType)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {EXPORT_TYPES.map((t) => (
              <option key={t} value={t}>
                {formatExportLabel(t)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="relative text-sm border rounded-md px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
            title="Open filters"
          >
            Filters
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 text-[11px] px-1 rounded-full bg-black text-white">
                {activeCount}
              </span>
            )}
          </button>

          <ActionButton
            label={isDownloading ? "Downloading..." : "Download"}
            icon={isDownloading ? <DownloadSpinner /> : undefined}
            onClick={() => triggerCsvDownload(exportType)}
            disabled={isDownloading}
          />
        </div>
      </section>

      {isSummaryView && (
        <section className="px-2 py-4 md:px-8 md:py-6">
          <Suspense fallback={<LoadingSpinner parentClass="absolute top-[50%] w-full" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">Period</div>
                <div className="text-sm mt-1">
                  {summary?.periodStart} — {summary?.periodEnd}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">New Sales</div>
                <div className="mt-1 text-sm grid grid-cols-2 gap-2">
                  <div>Total: {nf.format(summary?.newSales?.totalCount ?? 0)}</div>
                  <div>Qty: {nf.format(summary?.newSales?.totalQuantity ?? 0)}</div>
                  <div>Cash: {nf.format(summary?.newSales?.cashSalesCount ?? 0)}</div>
                  <div>Inst: {nf.format(summary?.newSales?.installmentSalesCount ?? 0)}</div>
                  <div className="col-span-2">Sales Value: ₦{nf.format(summary?.newSales?.totalRevenue ?? 0)}</div>
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">Renewals</div>
                <div className="mt-1 text-sm grid grid-cols-2 gap-2">
                  <div>Count: {nf.format(summary?.renewals?.totalCount ?? 0)}</div>
                  <div className="col-span-2">Amount: ₦{nf.format(summary?.renewals?.totalAmount ?? 0)}</div>
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow-sm md:col-span-3">
                <div className="text-xs uppercase tracking-wide text-gray-500">Grand Total</div>
                <div className="mt-1 text-sm">Sales Value: ₦{nf.format(summary?.grandTotal?.totalRevenue ?? 0)}</div>
              </div>
            </div>
          </Suspense>
        </section>
      )}

      {!isSummaryView && (
        <section className="relative items-start justify-center flex w-full overflow-hidden px-2 py-4 md:px-8 md:py-6" >
          <div className="w-full">
            <Suspense fallback={<LoadingSpinner parentClass="absolute top-[50%] w-full" />}>
              <Table
                tableTitle={`${exportType.toUpperCase()}`}
                loading={isLoading}
                tableData={tableData}
                columnList={columnList}
                tableClassname="bg-white"
                tableType="default"
                paginationInfo={paginationInfo}
                refreshTable={async () => setReloadTick((n) => n + 1)}
                clearFilters={() => {
                  setFilters({});
                  setCurrentPage(1);
                }}
              />
            </Suspense>
          </div>
        </section>
      )}

      {/* Filters modal */}
      <FiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        exportType={exportType}
        onApply={(next) => {
          setFilters(next);
          setCurrentPage(1);
          setFiltersOpen(false);
        }}
        onClear={() => {
          setFilters({});
          setCurrentPage(1);
        }}
      />
    </PageLayout>
  );
};

export default Reports;
