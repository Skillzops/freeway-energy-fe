import { useEffect, useState } from "react";
import { useGetRequest } from "@/utils/useApiCall";
import { DropDown } from "../DropDownComponent/DropDown";
type BoolAny = "any" | "true" | "false";

export type Filters = {
  // Date windows
  startDate?: string;
  endDate?: string;
  createdStartDate?: string;
  createdEndDate?: string;

  // Sales
  salesStatus?: "COMPLETED" | "IN_INSTALLMENT" | "UNPAID" | "CANCELLED";
  paymentMode?: "ONE_OFF" | "INSTALLMENT";

  // Agent
  agentId?: string;
  agentCategory?: "SALES" | "INSTALLER" | "BUSINESS";

  // Customer
  customerId?: string;
  customerStatus?: "active" | "inactive" | "barred";
  customerCategory?: string;
  customerType?: string;

  // Canonical geography
  state?: string;
  lga?: string;

  // UI aliases
  customerState?: string;
  customerLga?: string;

  // Payments
  paymentStatus?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paymentMethod?: "ONLINE" | "CASH" | "USSD" | "BANK_TRANSFER" | "POS" | "WALLET";
  minAmount?: number;
  maxAmount?: number;

  // Devices / product
  productId?: string;
  productName?: string;
  serialNumber?: string;
  installationStatus?: string;
  installerName?: string;

  // Flags / derived
  hasMultiplePayments?: BoolAny;
  hasMadeRepayments?: BoolAny;
  hasOutstandingBalance?: BoolAny; // legacy alias
  hasOutstandingDebt?: BoolAny;    // canonical
  paymentOverdue?: BoolAny;
  fullyPaid?: BoolAny;
  isNewSale?: BoolAny;
  isRenewal?: BoolAny;

  minPaymentCount?: number;
  maxPaymentCount?: number;

    overdueDays?: number;

  isOverdue?: BoolAny;
};

type ExportType =
  | "sales"
  | "customers"
  | "payments"
  | "devices"
  | "debt_report"
  | "renewal_report"
  | "weekly_summary"
  | "monthly_summary"
  | "total_outstanding_receivables"; 

type FiltersModalProps = {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  exportType: ExportType;
  onApply: (next: Filters) => void;
  onClear: () => void;
};


const inputBase = "w-full border rounded-md px-3 py-2 text-sm bg-white";
const fieldsFor = (type: ExportType): (keyof Filters)[] => [
  "startDate", "endDate", "agentId", "agentCategory",
  ...(!["weekly_summary", "monthly_summary", "total_outstanding_receivables"].includes(type) ? ["customerId" as const] : []),
  ...(type === "sales" ? ["salesStatus" as const] : []),
  ...(type === "payments" ? ["paymentStatus", "paymentMethod", "minAmount", "maxAmount"] as const : []),
  ...(["customers", "debt_report", "renewal_report"].includes(type) ? ["state", "lga"] as const : []),
  ...(type === "customers" ? ["hasOutstandingDebt" as const] : []),
  ...(type === "devices" ? ["serialNumber", "installationStatus"] as const : []),
  ...(type === "debt_report" ? ["isOverdue" as const] : []),
  ...(type === "renewal_report" ? ["overdueDays" as const] : []),
];
const labels: Partial<Record<keyof Filters, string>> = {
  startDate: "From date", endDate: "Through date", agentId: "Agent ID",
  agentCategory: "Agent category", customerId: "Customer ID", salesStatus: "Sale status",
  paymentStatus: "Payment status", paymentMethod: "Payment method", minAmount: "Minimum amount",
  maxAmount: "Maximum amount", state: "State", lga: "LGA", hasOutstandingDebt: "Outstanding debt",
  serialNumber: "Serial number", installationStatus: "Installation status", isOverdue: "Overdue",
  overdueDays: "Minimum overdue days",
};
const options: Partial<Record<keyof Filters, string[]>> = {
  agentCategory: ["SALES", "INSTALLER", "BUSINESS"],
  salesStatus: ["COMPLETED", "IN_INSTALLMENT", "UNPAID", "CANCELLED"],
  paymentStatus: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
  paymentMethod: ["ONLINE", "CASH", "USSD", "BANK_TRANSFER", "POS", "WALLET"],
  hasOutstandingDebt: ["true", "false"], isOverdue: ["true", "false"],
  installationStatus: ["not_installed", "ready_for_installation", "installed"],
};
export default function FiltersModal({ open, onClose, filters, exportType, onApply, onClear }: FiltersModalProps) {
  const [local, setLocal] = useState<Filters>(filters);
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setLocal(filters); setError(""); } }, [open, filters, exportType]);
  const { data: agentData } = useGetRequest(open ? "/v1/agents" : null, false);
  const { data: customerData } = useGetRequest(open ? "/v1/customers" : null, false);
  const records = (data: any): any[] => {
    const rows = Array.isArray(data) ? data : data?.updatedResults || data?.data || data?.results;
    return Array.isArray(rows) ? rows : [];
  };
  const agents = records(agentData);
  const customers = records(customerData);
  if (!open) return null;
  const fields = fieldsFor(exportType);
  const apply = () => {
    if (local.startDate && local.endDate && local.startDate > local.endDate) {
      setError("From date must be before through date."); return;
    }
    if (local.minAmount !== undefined && local.maxAmount !== undefined && local.minAmount > local.maxAmount) {
      setError("Minimum amount must not exceed maximum amount."); return;
    }
    const next: Filters = {};
    for (const key of fields) {
      const value = local[key];
      if (value !== undefined && value !== "" && value !== "any") (next as any)[key] = value;
    }
    onApply(next);
  };
  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Report filters">
    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
      <div className="flex items-center justify-between mb-5"><h2 className="text-xl font-semibold">Report filters</h2>
        <button type="button" onClick={onClose} aria-label="Close filters">✕</button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{fields.map(key => {
        const choices = options[key];
        if (key === "agentId" || key === "customerId") {
          const list = key === "agentId" ? agents : customers;
          const name = (record: any) => {
            const person = record.user || record;
            return [person.firstname, person.lastname].filter(Boolean).join(" ") || record.name || record.id;
          };
          const selected = list.find(record => record.id === local[key]);
          return <div key={key} className="text-sm text-gray-600">{key === "agentId" ? "Agent" : "Customer"}<DropDown
            name={selected ? name(selected) : "Any"} title={key === "agentId" ? "Select agent" : "Select customer"}
            items={["Any", ...list.map(name)]} searchable searchMode="local" searchPlaceholder="Search..."
            containerClassName="w-full" buttonClassName={`${inputBase} text-left`} menuAlign="left"
            onClickLink={(index: number) => setLocal(prev => ({ ...prev, [key]: index === 0 ? undefined : list[index - 1]?.id }))}
          /></div>;
        }
        const numeric = ["minAmount", "maxAmount", "overdueDays"].includes(key);
        return <label key={key} className="text-sm text-gray-600">{labels[key]}
          {choices ? <select className={inputBase} value={local[key] ?? ""} onChange={e => setLocal(prev => ({ ...prev, [key]: e.target.value || undefined }))}>
            <option value="">Any</option>{choices.map(value => <option key={value} value={value}>{value === "true" ? "Yes" : value === "false" ? "No" : value.toLowerCase().replace(/_/g, " ")}</option>)}
          </select> : <input className={inputBase} type={numeric ? "number" : key.endsWith("Date") ? "date" : "text"}
            min={key === "overdueDays" ? 1 : numeric ? 0 : undefined} value={local[key] ?? ""}
            onChange={e => setLocal(prev => ({ ...prev, [key]: e.target.value ? numeric ? Number(e.target.value) : e.target.value.trim() : undefined }))} />}
        </label>;
      })}</div>
      {error && <p className="text-red-600 mt-4" role="alert">{error}</p>}
      <div className="flex justify-end gap-3 mt-6"><button type="button" className="border rounded-lg px-4 py-2" onClick={() => { setLocal({}); setError(""); onClear(); }}>Reset filters</button>
        <button type="button" className="border rounded-lg px-4 py-2" onClick={onClose}>Cancel</button>
        <button type="button" className="bg-red-800 text-white rounded-lg px-4 py-2" onClick={apply}>Apply filters</button></div>
    </div>
  </div>;
}
