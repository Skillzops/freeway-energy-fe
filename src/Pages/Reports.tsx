
// import { Suspense, useEffect, useMemo, useRef, useState } from "react";
// import PageLayout from "./PageLayout";
// import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
// import { useGetRequest, useApiCall } from "@/utils/useApiCall";
// import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
// import inventorybadge from "../assets/inventory/inventorybadge.png";

// const EXPORT_TYPES = ["all", "sales", "customers", "payments", "devices", "comprehensive"] as const;
// type ExportType = typeof EXPORT_TYPES[number];

// function fileName(exportType: ExportType) {
//     const ts = new Date().toISOString().replace(/[:.]/g, "-");
//     return `export-${exportType}-${ts}.csv`;
// }

// function downloadBlobCSV(blob: Blob, name: string) {
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = name;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
// }

// function flattenRow(obj: any, prefix = "", out: Record<string, any> = {}) {
//     for (const [k, v] of Object.entries(obj ?? {})) {
//         const key = prefix ? `${prefix}.${k}` : k;
//         if (v && typeof v === "object" && !Array.isArray(v)) {
//             flattenRow(v as any, key, out);
//         } else if (Array.isArray(v)) {
//             out[key] = v
//                 .map((x) => (x && typeof x === "object" ? JSON.stringify(x) : x ?? ""))
//                 .join(" | ");
//         } else {
//             out[key] = v ?? "";
//         }
//     }
//     return out;
// }

// function jsonToCsv(input: any): string {
//     const rows: any[] = Array.isArray(input) ? input : Array.isArray(input?.data) ? input.data : [];
//     if (rows.length === 0) return "data\n";

//     const flat = rows.map((r) => flattenRow(r));
//     const headers = Array.from(new Set(flat.flatMap((r) => Object.keys(r))));

//     const esc = (val: any) => {
//         const s = String(val ?? "");
//         return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
//     };

//     const csv = [headers.join(","), ...flat.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
//     return csv + "\n";
// }

// const Reports = () => {
//     const [currentPage, setCurrentPage] = useState<number>(1);
//     const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
//     const [exportType, setExportType] = useState<ExportType>("all"); // ✅ default is "all"

//     const { apiCall } = useApiCall();

//     // Fetch only for UI data count (not used for CSV export)
//     const { data: reportsData } = useGetRequest(
//         exportType !== "all"
//             ? `/v1/export/data?exportType=${exportType}&page=${currentPage}&limit=${entriesPerPage}`
//             : null,
//         true,
//         60000
//     );

//     const totalCount = useMemo(() => {
//         if (Array.isArray(reportsData)) return reportsData.length ?? 0;
//         if (reportsData?.total != null) return Number(reportsData.total) || 0;
//         if (reportsData?.data) return reportsData.data.length ?? 0;
//         if (reportsData?.results) return reportsData.results.length ?? 0;
//         return 0;
//     }, [reportsData]);

//     const paginationInfo = {
//         total: totalCount,
//         currentPage,
//         entriesPerPage,
//         setCurrentPage,
//         setEntriesPerPage,
//     };

//     const cancelFlag = useRef<number>(0);

//     const triggerCsvDownload = async (selected: ExportType) => {
//         if (selected === "all") return; // ✅ skip auto-download for "All"
//         const myFlag = ++cancelFlag.current;

//         const endpoint = `/v1/export/data`;
//         const params = { exportType: selected, page: currentPage, limit: entriesPerPage };

//         try {
//             const res = await apiCall({
//                 endpoint,
//                 method: "get",
//                 params,
//                 headers: {
//                     Accept: "text/csv,application/csv;q=0.9,application/json;q=0.8,*/*;q=0.1",
//                 },
//                 responseType: "blob",
//                 showToast: false,
//             });

//             if (myFlag !== cancelFlag.current) return;

//             const contentType = (res?.headers?.["content-type"] as string | undefined) ?? "";

//             if (contentType.includes("text/csv") || contentType.includes("application/csv")) {
//                 const blob: Blob = res.data;
//                 downloadBlobCSV(blob, fileName(selected));
//                 return;
//             }

//             const text = await (res.data as Blob).text();
//             let parsed: any;
//             try {
//                 parsed = JSON.parse(text);
//             } catch {
//                 downloadBlobCSV(new Blob([text], { type: "text/csv;charset=utf-8" }), fileName(selected));
//                 return;
//             }
//             const csv = jsonToCsv(parsed);
//             downloadBlobCSV(new Blob([csv], { type: "text/csv;charset=utf-8" }), fileName(selected));
//         } catch (err: any) {
//             console.error("CSV Export Error:", err);
//         }
//     };

//     useEffect(() => {
//         triggerCsvDownload(exportType);
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [exportType, currentPage, entriesPerPage]);

//     return (
//         <PageLayout pageName="Reports" badge={inventorybadge}>
//             <section className="flex flex-wrap items-center gap-2 bg-paleGrayGradient px-2 md:px-8 py-4 min-h-[64px] w-full justify-between">
//                 <TitlePill
//                     icon={inventorybadge}
//                     iconBgColor="bg-[#FDEEC2]"
//                     topText="Export"
//                     bottomText="REPORTS"
//                     value={paginationInfo.total || 0}
//                 />

//                 <div className="flex items-center gap-2">
//                     <label htmlFor="exportType" className="text-sm font-medium">
//                         Export type:
//                     </label>
//                     <select
//                         id="exportType"
//                         value={exportType}
//                         onChange={(e) => setExportType(e.target.value as ExportType)}
//                         className="border rounded-md px-3 py-2 text-sm"
//                     >
//                         {EXPORT_TYPES.map((t) => (
//                             <option key={t} value={t}>
//                                 {t === "all" ? "All" : t}
//                             </option>
//                         ))}
//                     </select>

//                     <button
//                         disabled={exportType === "all"}
//                         onClick={() => triggerCsvDownload(exportType)}
//                         className={`text-sm border rounded-md px-3 py-2 ${exportType === "all" ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
//                             }`}
//                         title="Download selected export"
//                     >
//                         Download
//                     </button>
//                 </div>
//             </section>

//             <section className="relative items-start justify-center flex min-h-[415px] w-full overflow-hidden px-2 py-8 md:p-8">
//                 <Suspense fallback={<LoadingSpinner parentClass="absolute top-[50%] w-full" />}>
//                     {/* Optional table preview here */}
//                 </Suspense>
//             </section>
//         </PageLayout>
//     );
// };

// export default Reports;




















import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "./PageLayout";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import { useGetRequest, useApiCall } from "@/utils/useApiCall";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import inventorybadge from "../assets/inventory/inventorybadge.png";

// ---------------- Shared field styles (small, tidy placeholders) ----------------
const inputBase =
    "w-full border rounded-md px-3 py-2 text-sm placeholder:text-xs placeholder:text-gray-400/80 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-gray-300";
const numberInput =
    `${inputBase} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;
const selectBase =
    "w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-300";
const labelBase = "text-[11px] uppercase tracking-wide text-gray-600";

// -------------------------------------------------------------------------------
const EXPORT_TYPES = ["all", "sales", "customers", "payments", "devices", "comprehensive"] as const;
type ExportType = typeof EXPORT_TYPES[number];

type BoolAny = "any" | "true" | "false";

type Filters = {
    // Date windows (ISO via datetime-local)
    startDate?: string;
    endDate?: string;
    createdStartDate?: string;
    createdEndDate?: string;

    // Sales
    salesStatus?: "COMPLETED" | "IN_INSTALLMENT" | "UNPAID" | "CANCELLED";

    // Agent
    agentId?: string;
    agentCategory?: "SALES" | "INSTALLER" | "BUSINESS";

    // Customer
    customerId?: string;
    customerStatus?: "active" | "inactive" | "barred";
    customerType?: string;
    customerState?: string;
    customerLga?: string;

    // Payment
    paymentStatus?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
    paymentMethod?: "ONLINE" | "CASH" | "USSD" | "BANK_TRANSFER" | "POS" | "WALLET";
    minAmount?: number;
    maxAmount?: number;

    // Product / Device
    productId?: string;
    productName?: string;
    serialNumber?: string;
    state?: string; // generic
    lga?: string;   // generic
    installerName?: string;

    // Flags / counts
    hasMultiplePayments?: BoolAny;
    hasMadeRepayments?: BoolAny;
    fullyPaid?: BoolAny;
    hasOutstandingBalance?: BoolAny;
    paymentOverdue?: BoolAny;

    minPaymentCount?: number;
    maxPaymentCount?: number;
};

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
function flattenRow(obj: any, prefix = "", out: Record<string, any> = {}) {
    for (const [k, v] of Object.entries(obj ?? {})) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object" && !Array.isArray(v)) {
            flattenRow(v as any, key, out);
        } else if (Array.isArray(v)) {
            out[key] = v.map((x) => (x && typeof x === "object" ? JSON.stringify(x) : x ?? "")).join(" | ");
        } else {
            out[key] = v ?? "";
        }
    }
    return out;
}
function jsonToCsv(input: any): string {
    const rows: any[] = Array.isArray(input) ? input : Array.isArray(input?.data) ? input.data : [];
    if (rows.length === 0) return "data\n";
    const flat = rows.map((r) => flattenRow(r));
    const headers = Array.from(new Set(flat.flatMap((r) => Object.keys(r))));
    const esc = (val: any) => {
        const s = String(val ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(","), ...flat.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
    return csv + "\n";
}
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

const Reports = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
    const [exportType, setExportType] = useState<ExportType>("all"); // default "All"
    const [filters, setFilters] = useState<Filters>({});

    const { apiCall } = useApiCall();

    // Compose query params (only set keys that have values)
    const queryParams = useMemo(() => {
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
        };

        return trimParams(params);
    }, [filters, currentPage, entriesPerPage, exportType]);

    const { data: reportsData } = useGetRequest(
        exportType !== "all"
            ? `/v1/export/data?${new URLSearchParams(queryParams as any).toString()}`
            : null,
        true,
        60000
    );

    const totalCount = useMemo(() => {
        if (Array.isArray(reportsData)) return reportsData.length ?? 0;
        if (reportsData?.total != null) return Number(reportsData.total) || 0;
        if (reportsData?.data) return reportsData.data.length ?? 0;
        if (reportsData?.results) return reportsData.results.length ?? 0;
        return 0;
    }, [reportsData]);

    const paginationInfo = {
        total: totalCount,
        currentPage,
        entriesPerPage,
        setCurrentPage,
        setEntriesPerPage,
    };

    const cancelFlag = useRef<number>(0);

    const triggerCsvDownload = async (selected: ExportType) => {
        if (selected === "all") return; // don't download on "All"
        const myFlag = ++cancelFlag.current;

        try {
            const res = await apiCall({
                endpoint: "/v1/export/data",
                method: "get",
                params: queryParams, // include filters + pagination + exportType
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

            // Fallback: try JSON->CSV
            const text = await (res.data as Blob).text();
            let parsed: any;
            try {
                parsed = JSON.parse(text);
            } catch {
                downloadBlobCSV(new Blob([text], { type: "text/csv;charset=utf-8" }), fileName(selected));
                return;
            }
            const csv = jsonToCsv(parsed);
            downloadBlobCSV(new Blob([csv], { type: "text/csv;charset=utf-8" }), fileName(selected));
        } catch (err) {
            console.error("CSV Export Error:", err);
        }
    };

    useEffect(() => {
        triggerCsvDownload(exportType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exportType, currentPage, entriesPerPage, queryParams]);

    const set = <K extends keyof Filters>(key: K, val: Filters[K]) =>
        setFilters((f) => ({ ...f, [key]: val }));

    const dateInput = (v?: string) => (v ? v : "");

    return (
        <PageLayout pageName="Reports" badge={inventorybadge}>
            {/* Header */}
            <section className="flex flex-wrap items-center gap-2 bg-paleGrayGradient px-2 md:px-8 py-4 min-h-[64px] w-full justify-between">
                <TitlePill
                    icon={inventorybadge}
                    iconBgColor="bg-[#FDEEC2]"
                    topText="Export"
                    bottomText="REPORTS"
                    value={paginationInfo.total || 0}
                />

                <div className="flex items-center gap-2">
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
                                {t === "all" ? "All" : t}
                            </option>
                        ))}
                    </select>

                    <button
                        disabled={exportType === "all"}
                        onClick={() => triggerCsvDownload(exportType)}
                        className={`text-sm border rounded-md px-3 py-2 ${exportType === "all" ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                            }`}
                        title="Download selected export"
                    >
                        Download
                    </button>
                </div>
            </section>

            {/* Filters */}
            <section className="w-full border-t bg-white px-2 md:px-8 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {/* Dates */}
                    <div>
                        <label className={labelBase}>Start date</label>
                        <input
                            type="datetime-local"
                            value={dateInput(filters.startDate)}
                            onChange={(e) => set("startDate", e.target.value || undefined)}
                            className={inputBase}
                        />
                    </div>
                    <div>
                        <label className={labelBase}>End date</label>
                        <input
                            type="datetime-local"
                            value={dateInput(filters.endDate)}
                            onChange={(e) => set("endDate", e.target.value || undefined)}
                            className={inputBase}
                        />
                    </div>
                    <div>
                        <label className={labelBase}>Created start date</label>
                        <input
                            type="datetime-local"
                            value={dateInput(filters.createdStartDate)}
                            onChange={(e) => set("createdStartDate", e.target.value || undefined)}
                            className={inputBase}
                        />
                    </div>
                    <div>
                        <label className={labelBase}>Created end date</label>
                        <input
                            type="datetime-local"
                            value={dateInput(filters.createdEndDate)}
                            onChange={(e) => set("createdEndDate", e.target.value || undefined)}
                            className={inputBase}
                        />
                    </div>

                    {/* Sales */}
                    <div>
                        <label className={labelBase}>Sales status</label>
                        <select
                            value={filters.salesStatus ?? ""}
                            onChange={(e) => set("salesStatus", (e.target.value || undefined) as Filters["salesStatus"])}
                            className={selectBase}
                        >
                            <option value="">Any</option>
                            <option>COMPLETED</option>
                            <option>IN_INSTALLMENT</option>
                            <option>UNPAID</option>
                            <option>CANCELLED</option>
                        </select>
                    </div>

                    {/* Agent */}
                    <div>
                        <label className={labelBase}>Agent ID</label>
                        <input
                            value={filters.agentId ?? ""}
                            onChange={(e) => set("agentId", e.target.value || undefined)}
                            className={inputBase}
                            placeholder="507f1f77bcf86cd799439011"
                        />
                    </div>
                    <div>
                        <label className={labelBase}>Agent category</label>
                        <select
                            value={filters.agentCategory ?? ""}
                            onChange={(e) => set("agentCategory", (e.target.value || undefined) as Filters["agentCategory"])}
                            className={selectBase}
                        >
                            <option value="">Any</option>
                            <option>SALES</option>
                            <option>INSTALLER</option>
                            <option>BUSINESS</option>
                        </select>
                    </div>

                    {/* Customer */}
                    <div>
                        <label className={labelBase}>Customer ID</label>
                        <input
                            value={filters.customerId ?? ""}
                            onChange={(e) => set("customerId", e.target.value || undefined)}
                            className={inputBase}
                            placeholder="507f1f77bcf86cd799439011"
                        />
                    </div>
                    <div>
                        <label className={labelBase}>Customer status</label>
                        <select
                            value={filters.customerStatus ?? ""}
                            onChange={(e) => set("customerStatus", (e.target.value || undefined) as Filters["customerStatus"])}
                            className={selectBase}
                        >
                            <option value="">Any</option>
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                            <option value="barred">barred</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelBase}>Customer type</label>
                        <input
                            value={filters.customerType ?? ""}
                            onChange={(e) => set("customerType", e.target.value || undefined)}
                            className={inputBase}
                            placeholder="residential"
                        />
                    </div>
                    <div>
                        <label className={labelBase}>Customer state</label>
                        <input
                            value={filters.customerState ?? ""}
                            onChange={(e) => set("customerState", e.target.value || undefined)}
                            className={inputBase}
                            placeholder="Lagos"
                        />
                    </div>
                    <div>
                        <label className={labelBase}>Customer LGA</label>
                        <input
                            value={filters.customerLga ?? ""}
                            onChange={(e) => set("customerLga", e.target.value || undefined)}
                            className={inputBase}
                            placeholder="Ikeja"
                        />
                    </div>

                    {/* Payment */}
                    <div>
                        <label className={labelBase}>Payment status</label>
                        <select
                            value={filters.paymentStatus ?? ""}
                            onChange={(e) => set("paymentStatus", (e.target.value || undefined) as Filters["paymentStatus"])}
                            className={selectBase}
                        >
                            <option value="">Any</option>
                            <option>PENDING</option>
                            <option>COMPLETED</option>
                            <option>FAILED</option>
                            <option>REFUNDED</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelBase}>Payment method</label>
                        <select
                            value={filters.paymentMethod ?? ""}
                            onChange={(e) => set("paymentMethod", (e.target.value || undefined) as Filters["paymentMethod"])}
                            className={selectBase}
                        >
                            <option value="">Any</option>
                            <option>ONLINE</option>
                            <option>CASH</option>
                            <option>USSD</option>
                            <option>BANK_TRANSFER</option>
                            <option>POS</option>
                            <option>WALLET</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelBase}>Min amount</label>
                        <input
                            type="number"
                            value={filters.minAmount ?? ""}
                            onChange={(e) => set("minAmount", e.target.value ? Number(e.target.value) : undefined)}
                            className={numberInput}
                            placeholder="1000"
                        />
                    </div>
                    <div>
                        <label className={labelBase}>Max amount</label>
                        <input
                            type="number"
                            value={filters.maxAmount ?? ""}
                            onChange={(e) => set("maxAmount", e.target.value ? Number(e.target.value) : undefined)}
                            className={numberInput}
                            placeholder="100000"
                        />
                    </div>

                    {/* Product / Device */}
                    <div>
                        <label className={labelBase}>Product ID</label>
                        <input
                            value={filters.productId ?? ""}
                            onChange={(e) => set("productId", e.target.value || undefined)}
                            className={inputBase}
                            placeholder="507f1f77bcf86cd799439011"
                        />
                    </div>
                    <div>
                        <label className={labelBase}>Product name</label>
                        <input
                            value={filters.productName ?? ""}
                            onChange={(e) => set("productName", e.target.value || undefined)}
                            className={inputBase}
                            placeholder="Solar Panel 100W"
                        />
                    </div>
                    <div>
                        <label className={labelBase}>Serial number</label>
                        <input
                            value={filters.serialNumber ?? ""}
                            onChange={(e) => set("serialNumber", e.target.value || undefined)}
                            className={inputBase}
                            placeholder="SN123456789"
                        />
                    </div>
                    <div>
                        <label className={labelBase}>State</label>
                        <input
                            value={filters.state ?? ""}
                            onChange={(e) => set("state", e.target.value || undefined)}
                            className={inputBase}
                            placeholder="Lagos"
                        />
                    </div>
                    <div>
                        <label className={labelBase}>LGA</label>
                        <input
                            value={filters.lga ?? ""}
                            onChange={(e) => set("lga", e.target.value || undefined)}
                            className={inputBase}
                            placeholder="Ikeja"
                        />
                    </div>
                    <div>
                        <label className={labelBase}>Installer name</label>
                        <input
                            value={filters.installerName ?? ""}
                            onChange={(e) => set("installerName", e.target.value || undefined)}
                            className={inputBase}
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Flags / counts */}
                    <div>
                        <label className={labelBase}>Has multiple payments</label>
                        <select
                            value={filters.hasMultiplePayments ?? "any"}
                            onChange={(e) => set("hasMultiplePayments", (e.target.value as BoolAny) || "any")}
                            className={selectBase}
                        >
                            <option value="any">Any</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelBase}>Has made repayments</label>
                        <select
                            value={filters.hasMadeRepayments ?? "any"}
                            onChange={(e) => set("hasMadeRepayments", (e.target.value as BoolAny) || "any")}
                            className={selectBase}
                        >
                            <option value="any">Any</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelBase}>Payment overdue</label>
                        <select
                            value={filters.paymentOverdue ?? "any"}
                            onChange={(e) => set("paymentOverdue", (e.target.value as BoolAny) || "any")}
                            className={selectBase}
                        >
                            <option value="any">Any</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelBase}>Fully paid</label>
                        <select
                            value={filters.fullyPaid ?? "any"}
                            onChange={(e) => set("fullyPaid", (e.target.value as BoolAny) || "any")}
                            className={selectBase}
                        >
                            <option value="any">Any</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelBase}>Has outstanding balance</label>
                        <select
                            value={filters.hasOutstandingBalance ?? "any"}
                            onChange={(e) => set("hasOutstandingBalance", (e.target.value as BoolAny) || "any")}
                            className={selectBase}
                        >
                            <option value="any">Any</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelBase}>Min payment count</label>
                        <input
                            type="number"
                            value={filters.minPaymentCount ?? ""}
                            onChange={(e) => set("minPaymentCount", e.target.value ? Number(e.target.value) : undefined)}
                            className={numberInput}
                            placeholder="2"
                        />
                    </div>
                    <div>
                        <label className={labelBase}>Max payment count</label>
                        <input
                            type="number"
                            value={filters.maxPaymentCount ?? ""}
                            onChange={(e) => set("maxPaymentCount", e.target.value ? Number(e.target.value) : undefined)}
                            className={numberInput}
                            placeholder="10"
                        />
                    </div>
                </div>

                {/* Filter actions */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        className="text-sm border bg-[#B75A25] text-white rounded-md px-3 py-2 hover:bg-gray-50"
                        onClick={() => setFilters({})}
                    >
                        Clear filters
                    </button>
                    {/* <button
                        className="text-sm border rounded-md px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => triggerCsvDownload(exportType)}
                        disabled={exportType === "all"}
                        title={exportType === "all" ? "Select an export type first" : "Apply filters & download"}
                    >
                        Apply & Download
                    </button> */}
                </div>
            </section>

            <section className="relative items-start justify-center flex min-h-[415px] w-full overflow-hidden px-2 py-8 md:p-8">
                <Suspense fallback={<LoadingSpinner parentClass="absolute top-[50%] w-full" />}>
                </Suspense>
            </section>
        </PageLayout>
    );
};

export default Reports;
