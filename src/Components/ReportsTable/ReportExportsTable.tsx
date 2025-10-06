import { KeyedMutator } from "swr";
import { useMemo } from "react";
import { PaginationType, Table } from "../TableComponent/Table";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";

type ExportReportApiItem = {
    totalRecords: number;
    estimatedCount?: number | null;
    exportType: string;               
    generatedAt: string;              
    fileSize?: number | null;         
    filters?: Record<string, any>;   
};

type ExportReportApiResponse =
    | ExportReportApiItem
    | ExportReportApiItem[]
    | { data: ExportReportApiItem[]; total?: number }
    | { results: ExportReportApiItem[]; total?: number };

type ReportRow = {
    id: number;
    totalRecords: number;
    estimatedCount: number | string;
    exportType: string;
    generatedAt: string;    
    fileSize: string;       
    filters: string;        
};

function prettyBytes(bytes?: number | null) {
    const b = typeof bytes === "number" && bytes >= 0 ? bytes : 0;
    if (b === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    const val = b / Math.pow(1024, i);
    return `${val.toFixed(val >= 100 ? 0 : val >= 10 ? 1 : 2)} ${units[i]}`;
}

function prettyDate(iso: string) {
    try {
        const d = new Date(iso);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const ss = String(d.getSeconds()).padStart(2, "0");
        return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
    } catch {
        return iso;
    }
}

function toArray(payload: ExportReportApiResponse): ExportReportApiItem[] {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object" && "data" in payload && Array.isArray((payload as any).data)) {
        return (payload as any).data;
    }
    if (payload && typeof payload === "object" && "results" in payload && Array.isArray((payload as any).results)) {
        return (payload as any).results;
    }
    if (payload && typeof payload === "object" && "totalRecords" in payload) {
        return [payload as ExportReportApiItem];
    }
    return [];
}

function makeRows(data: ExportReportApiResponse): ReportRow[] {
    const items = toArray(data);
    return items.map((item, idx) => ({
        id: idx + 1,
        totalRecords: item.totalRecords ?? 0,
        estimatedCount: typeof item.estimatedCount === "number" ? item.estimatedCount : "-",
        exportType: item.exportType ?? "-",
        generatedAt: item.generatedAt ? prettyDate(item.generatedAt) : "-",
        fileSize: prettyBytes(item.fileSize),
        filters: item.filters && Object.keys(item.filters).length
            ? JSON.stringify(item.filters)
            : "{}",
    }));
}

const ReportExportsTable = ({
    reportsData,
    isLoading,
    refreshTable,
    errorData,
    paginationInfo,
}: {
    reportsData: ExportReportApiResponse;
    isLoading: boolean;
    refreshTable: KeyedMutator<any>;
    errorData: ApiErrorStatesType;
    paginationInfo?: PaginationType;
}) => {
    const rows = useMemo(() => makeRows(reportsData), [reportsData]);

    const columnList = [
        { title: "S/N", key: "id" },
        { title: "TOTAL RECORDS", key: "totalRecords" },
        { title: "ESTIMATED COUNT", key: "estimatedCount" },
        { title: "EXPORT TYPE", key: "exportType" },
        { title: "GENERATED AT", key: "generatedAt" },
        { title: "FILE SIZE", key: "fileSize" },
        {
            title: "FILTERS",
            key: "filters",
            valueIsAComponent: true,
            customValue: (value: string) => (
                <span className="text-[11px] text-textGrey break-all">{value}</span>
            ),
        },
    ];

    return !errorData?.errorStates[0]?.errorExists ? (
        <Table
            tableTitle="REPORT EXPORTS"
            columnList={columnList}
            loading={isLoading}
            tableData={rows}
            refreshTable={async () => {
                await refreshTable();
            }}
            paginationInfo={paginationInfo}
            filterList={[]}
            clearFilters={() => undefined}
        />
    ) : (
        <ErrorComponent
            message="Failed to fetch report exports."
            className="rounded-[20px]"
            refreshData={refreshTable}
            errorData={errorData}
        />
    );
};

export default ReportExportsTable;
















