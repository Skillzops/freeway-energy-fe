
import { Suspense, useMemo, useRef, useState } from "react";
import PageLayout from "./PageLayout";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import { useGetRequest, useApiCall } from "@/utils/useApiCall";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import inventorybadge from "../assets/inventory/inventorybadge.png";
import FiltersModal, { Filters } from "@/Components/ReportsTable/FiltersModal";
import { Table, PaginationType } from "@/Components/TableComponent/Table";

const EXPORT_TYPES = ["all", "sales", "customers", "payments", "devices", "comprehensive"] as const;
type ExportType = typeof EXPORT_TYPES[number];
type BoolAny = "any" | "true" | "false";

function toISOOrUndefined(localDT?: string) {
    if (!localDT) return undefined;
    try {
        const d = new Date(localDT);
        if (isNaN(d.getTime())) return undefined;
        return d.toISOString();
    } catch {
        return undefined;
    }
}
function trimParams<T extends Record<string, any>>(obj: T): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === undefined || v === null || v === "") continue;
        out[k] = v;
    }
    return out;
}
function boolAnyToParam(v: BoolAny | undefined) {
    if (!v || v === "any") return undefined;
    return v === "true";
}
const isTruthy = (v: any) => !(v === undefined || v === null || v === "" || v === "any");
function countActiveFilters(f: Filters) {
    return Object.values(f).reduce((acc, v) => acc + (isTruthy(v) ? 1 : 0), 0);
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
function cellStr(v: any) {
    if (v === null || v === undefined || v === "nil") return "-";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
}

const Reports = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
    const [exportType, setExportType] = useState<ExportType>("all");
    const [filters, setFilters] = useState<Filters>({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [reloadTick, setReloadTick] = useState(0);

    const { apiCall } = useApiCall();

    const baseParams = useMemo(() => {
        const {
            startDate, endDate, createdStartDate, createdEndDate,
            hasMultiplePayments, hasMadeRepayments, paymentOverdue, fullyPaid, hasOutstandingBalance,
            ...rest
        } = filters;

        const params = {
            ...rest,
            startDate: toISOOrUndefined(startDate),
            endDate: toISOOrUndefined(endDate),
            createdStartDate: toISOOrUndefined(createdStartDate),
            createdEndDate: toISOOrUndefined(createdEndDate),
            hasMultiplePayments: boolAnyToParam(hasMultiplePayments),
            hasMadeRepayments: boolAnyToParam(hasMadeRepayments),
            paymentOverdue: boolAnyToParam(paymentOverdue),
            fullyPaid: boolAnyToParam(fullyPaid),
            hasOutstandingBalance: boolAnyToParam(hasOutstandingBalance),
            page: currentPage,
            limit: entriesPerPage,
            ...(exportType !== "all" ? { exportType } : {}),
            _rt: String(reloadTick),
        };

        return trimParams(params);
    }, [filters, currentPage, entriesPerPage, exportType, reloadTick]);

    const previewUrl =
        exportType === "all"
            ? null
            : `/v1/export/data?${new URLSearchParams({ ...baseParams, format: "json" } as any).toString()}`;

    const { data: reportsJsonData, isLoading } = useGetRequest(previewUrl, true, 60000);

    const apiRows: any[] = useMemo(() => {
        const r = (reportsJsonData as any) || {};
        return Array.isArray(r?.data) ? r.data : [];
    }, [reportsJsonData]);

    const totalFromApi = useMemo(() => {
        if (exportType === "all") return 0;
        const r = reportsJsonData as any;
        if (!r) return 0;
        if (typeof r?.totalRecords === "number") return r.totalRecords;
        if (typeof r?.total === "number") return r.total;
        if (Array.isArray(r?.results)) return r.results.length;
        if (Array.isArray(r?.data)) return r.data.length;
        if (Array.isArray(r)) return r.length;
        return apiRows.length;
    }, [reportsJsonData, apiRows.length, exportType]);

    const columns = useMemo(() => {
        const keys = new Set<string>();
        apiRows.slice(0, 50).forEach((row) => Object.keys(row ?? {}).forEach((k) => keys.add(k)));
        return ["__sn", ...Array.from(keys)];
    }, [apiRows]);

    const tableData = useMemo(() => {
        return apiRows.map((row, idx) => ({
            __sn: (currentPage - 1) * entriesPerPage + idx + 1,
            ...columns.reduce((acc, key) => {
                if (key === "__sn") return acc;
                acc[key] = cellStr((row as any)[key]);
                return acc;
            }, {} as Record<string, any>),
        }));
    }, [apiRows, currentPage, entriesPerPage, columns]);

    const columnList = useMemo(
        () =>
            columns.map((c) => ({
                title: c === "__sn" ? "S/N" : c,
                key: c,
            })),
        [columns]
    );

    const paginationInfo: PaginationType = () => ({
        total: totalFromApi,
        currentPage,
        entriesPerPage,
        setCurrentPage,
        setEntriesPerPage,
    });

    const cancelFlag = useRef<number>(0);
    const triggerCsvDownload = async (selected: ExportType) => {
        if (selected === "all") return;
        const myFlag = ++cancelFlag.current;
        try {
            const res = await apiCall({
                endpoint: "/v1/export/data",
                method: "get",
                params: { ...baseParams, format: "csv" },
                headers: {
                    Accept: "text/csv,application/csv;q=0.9,application/json;q=0.8,*/*;q=0.1",
                },
                responseType: "blob",
                showToast: false,
            });
            if (myFlag !== cancelFlag.current) return;
            const contentType = (res?.headers?.["content-type"] as string | undefined) ?? "";
            if (contentType.includes("text/csv") || contentType.includes("application/csv")) {
                downloadBlobCSV(res.data as Blob, fileName(selected));
                return;
            }
            const text = await (res.data as Blob).text();
            downloadBlobCSV(new Blob([text], { type: "text/csv;charset=utf-8" }), fileName(selected));
        } catch (err) {
            console.error("CSV Export Error:", err);
        }
    };

    const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

    return (
        <PageLayout pageName="Reports" badge={inventorybadge}>
            <section className="flex flex-wrap items-center gap-2 bg-paleGrayGradient px-2 md:px-8 py-4 min-h-[64px] w-full justify-between">
                <TitlePill
                    icon={inventorybadge}
                    iconBgColor="bg-[#FDEEC2]"
                    topText="EXPORT"
                    bottomText={exportType.toUpperCase()}
                    value={totalFromApi}
                />

                <div className="flex items-center gap-2">
                    <label htmlFor="exportType" className="text-sm font-medium">
                        Export type:
                    </label>
                    <select
                        id="exportType"
                        value={exportType}
                        onChange={(e) => {
                            setCurrentPage(1);
                            setExportType(e.target.value as ExportType);
                        }}
                        className="border rounded-md px-3 py-2 text-sm"
                    >
                        {EXPORT_TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t === "all" ? "All" : t}
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

                    <button
                        disabled={exportType === "all"}
                        onClick={() => triggerCsvDownload(exportType)}
                        className={`text-sm border rounded-md px-3 py-2 ${exportType === "all" ? "opacity-50 cursor-not-allowed" : "bg-[#B75A25] text-white hover:opacity-95"
                            }`}
                        title={exportType === "all" ? "Select an export type first" : "Download filtered report (CSV)"}
                    >
                        Download
                    </button>
                </div>
            </section>

            <section className="relative items-start justify-center flex w-full overflow-hidden px-2 py-4 md:px-8 md:py-6">
                <div className="w-full">
                    <Suspense fallback={<LoadingSpinner parentClass="absolute top-[50%] w-full" />}>
                        {exportType === "all" ? (
                            <div className="text-xs text-gray-600 border rounded-lg bg-white p-4">
                                Select a specific <span className="font-medium">Export type</span> to preview data here. “All” does not fetch preview data.
                            </div>
                        ) : (
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
                        )}
                    </Suspense>
                </div>
            </section>

            <FiltersModal
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                filters={filters}
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
