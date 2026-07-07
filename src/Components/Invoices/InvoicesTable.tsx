import { useState } from "react";
import { KeyedMutator } from "swr";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";
import { NairaSymbol, DateTimeTag } from "@/Components/CardComponents/CardComponent";
import { formatNumberWithCommas } from "@/utils/helpers";
import Table, { PaginationType } from "@/Components/TableComponent/Table";
import InvoiceDetailModal from "./InvoiceDetailModal";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  SENT:           "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  DRAFT:          "bg-[#F6F8FA] text-textDarkGrey border-strokeGreyTwo",
  PARTIALLY_PAID: "bg-[#FFF3D5] text-[#A58730] border-[#F3D890]",
  PAID:           "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
  OVERDUE:        "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  VOID:           "bg-[#F1F5F9] text-[#94A3B8] border-[#CBD5E1]",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
      STATUS_STYLES[status] ?? STATUS_STYLES.SENT
    }`}
  >
    {status.replace(/_/g, " ")}
  </span>
);

// ─── Filters type ─────────────────────────────────────────────────────────────

type FiltersType = {
  search: string;        setSearch: (v: string) => void;
  status: string;        setStatus: (v: string) => void;
  type: string;          setType: (v: string) => void;
  customerName: string;  setCustomerName: (v: string) => void;
  dateFrom: string;      setDateFrom: (v: string) => void;
  dateTo: string;        setDateTo: (v: string) => void;
  dueDateFrom: string;   setDueDateFrom: (v: string) => void;
  dueDateTo: string;     setDueDateTo: (v: string) => void;
};

// ─── Build table rows ─────────────────────────────────────────────────────────

const buildRows = (
  data: any,
  onView: (id: string) => void,
  mode: "invoices" | "receipts",
): Record<string, any>[] =>
  (data?.invoices ?? []).map((inv: any, index: number) => {
    const balance = Math.max(0, (inv.totalAmount ?? 0) - (inv.amountPaid ?? 0));
    return {
      no: index + 1,
      invoiceNumber: (
        <button
          onClick={() => onView(inv.id)}
          className="text-xs font-bold text-primary-hex underline underline-offset-2"
        >
          {inv.invoiceNumber}
        </button>
      ),
      receiptNumber:
        mode === "receipts" && (inv.receiptNumber || inv.receipts?.[0]?.receiptNumber) ? (
        <span className="text-xs font-semibold text-textDarkGrey">
          {inv.receiptNumber || inv.receipts?.[0]?.receiptNumber}
        </span>
      ) : (
        <span className="text-[11px] text-textLightGrey">—</span>
      ),
      customer: inv.customerName ? (
        <span className="text-xs text-textDarkGrey font-medium">{inv.customerName}</span>
      ) : (
        <span className="text-[11px] text-textLightGrey">—</span>
      ),
      status: <StatusBadge status={inv.status} />,
      type: (
        <span className="text-[11px] font-semibold text-textDarkGrey bg-[#F6F8FA] px-2 py-0.5 rounded-full border border-strokeGreyTwo">
          {inv.type}
        </span>
      ),
      total: (
        <div className="flex items-center gap-0.5">
          <NairaSymbol />
          <span className="text-xs font-bold text-textDarkGrey">
            {formatNumberWithCommas(inv.totalAmount ?? 0)}
          </span>
        </div>
      ),
      paid: (
        <div className="flex items-center gap-0.5">
          <NairaSymbol />
          <span className="text-xs font-semibold text-[#059669]">
            {formatNumberWithCommas(inv.amountPaid ?? 0)}
          </span>
        </div>
      ),
      balance: (
        <div className="flex items-center gap-0.5">
          <NairaSymbol />
          <span
            className={`text-xs font-bold ${
              balance > 0 ? "text-errorTwo" : "text-[#059669]"
            }`}
          >
            {formatNumberWithCommas(balance)}
          </span>
        </div>
      ),
      dueDate: inv.dueDate ? (
        <DateTimeTag datetime={inv.dueDate} />
      ) : (
        <span className="text-[11px] text-textLightGrey">—</span>
      ),
      lastPayment: inv.lastPaymentDate ? (
        <DateTimeTag datetime={inv.lastPaymentDate} />
      ) : (
        <span className="text-[11px] text-textLightGrey">—</span>
      ),
      created: inv.createdAt ? (
        <DateTimeTag datetime={inv.createdAt} />
      ) : (
        <span className="text-[11px] text-textLightGrey">—</span>
      ),
      action: (
        <button
          onClick={() => onView(inv.id)}
          className="px-3 py-1 text-[11px] font-semibold rounded-full bg-primary-hex text-white"
        >
          View
        </button>
      ),
    };
  });

// ─── Main component ───────────────────────────────────────────────────────────

const InvoicesTable = ({
  invoicesData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  mode = "invoices",
  filters,
  onClearFilters,
  onFilterChange,
}: {
  invoicesData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  error: any;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  mode?: "invoices" | "receipts";
  filters: FiltersType;
  onClearFilters: () => void;
  onFilterChange: () => void;
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [queryValue, setQueryValue] = useState("");
  const [isSearchQuery, setIsSearchQuery] = useState(false);

  const {
    setSearch, setStatus, setType, setCustomerName,
    setDateFrom, setDateTo, setDueDateFrom, setDueDateTo,
    status, type,
  } = filters;
  const isReceiptsMode = mode === "receipts";
  const columns = [
    { title: "No.", key: "no", valueIsAComponent: false },
    ...(isReceiptsMode
      ? [{ title: "Receipt Number", key: "receiptNumber", valueIsAComponent: true }]
      : []),
    {
      title: isReceiptsMode ? "Invoice Reference" : "Invoice No.",
      key: "invoiceNumber",
      valueIsAComponent: true,
    },
    { title: "Customer", key: "customer", valueIsAComponent: true },
    { title: "Status", key: "status", valueIsAComponent: true },
    { title: "Type", key: "type", valueIsAComponent: true },
    { title: "Total", key: "total", valueIsAComponent: true },
    { title: "Paid", key: "paid", valueIsAComponent: true },
    { title: "Balance", key: "balance", valueIsAComponent: true },
    { title: "Due Date", key: "dueDate", valueIsAComponent: true },
    { title: "Last Payment", key: "lastPayment", valueIsAComponent: true },
    { title: "Created", key: "created", valueIsAComponent: true },
    { title: "", key: "action", valueIsAComponent: true },
  ];

  const filterList: any[] = [
    // ── Search by invoice ref ──
    {
      name: isReceiptsMode ? "Search (Receipt / Invoice Ref)" : "Search",
      onSearch: (q: string) => {
        setQueryValue(q);
        setIsSearchQuery(true);
        setSearch(q);
        onFilterChange();
      },
      isSearch: true,
    },
    // ── Customer name ──
    {
      name: "Customer",
      onSearch: (q: string) => {
        setCustomerName(q);
        setIsSearchQuery(false);
        onFilterChange();
      },
      isSearch: true,
    },
    // ── Status ──
    {
      name: status
        ? status.replace(/_/g, " ")
        : "Status",
      items: ["All", "Sent", "Partially Paid", "Paid", "Overdue", "Void", "Draft"],
      onClickLink: (index: number) => {
        const map = ["", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE", "VOID", "DRAFT"];
        setStatus(map[index] ?? "");
        setIsSearchQuery(false);
        onFilterChange();
      },
    },
    // ── Type ──
    {
      name: type ? type : "Type",
      items: ["All", "Master", "Sub"],
      onClickLink: (index: number) => {
        const map = ["", "MASTER", "SUB"];
        setType(map[index] ?? "");
        setIsSearchQuery(false);
        onFilterChange();
      },
    },
    // ── Created date range ──
    {
      name: "Created Date",
      isDateRange: true,
      onDateClick: (startDate: string, endDate?: string) => {
        setDateFrom(startDate ? startDate.split("T")[0] : "");
        setDateTo(endDate ? endDate.split("T")[0] : "");
        setIsSearchQuery(false);
        onFilterChange();
      },
    },
    // ── Due date range ──
    {
      name: "Due Date",
      isDateRange: true,
      onDateClick: (startDate: string, endDate?: string) => {
        setDueDateFrom(startDate ? startDate.split("T")[0] : "");
        setDueDateTo(endDate ? endDate.split("T")[0] : "");
        setIsSearchQuery(false);
        onFilterChange();
      },
    },
  ];

  if (error) {
    return (
      <ErrorComponent
        message="Failed to load invoices"
        className="absolute"
        refreshData={refreshTable}
        errorStates={errorData}
      />
    );
  }

  return (
    <>
      <Table
        tableTitle={isReceiptsMode ? "All Receipts" : "All Invoices"}
        columnList={columns}
        tableData={buildRows(invoicesData, setSelectedId, mode)}
        loading={isLoading}
        filterList={filterList}
        paginationInfo={paginationInfo}
        refreshTable={refreshTable}
        queryValue={isSearchQuery ? queryValue : ""}
        clearFilters={() => {
          onClearFilters();
          setQueryValue("");
          setIsSearchQuery(false);
        }}
      />

      {selectedId && (
        <InvoiceDetailModal
          invoiceId={selectedId}
          isOpen={!!selectedId}
          onClose={() => setSelectedId(null)}
          onRefresh={refreshTable}
        />
      )}
    </>
  );
};

export default InvoicesTable;
