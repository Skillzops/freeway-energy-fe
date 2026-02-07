

import { BRAND_CONFIG } from "@/config/brandConfig";
import { useEffect, useState } from "react";

const shadeWithPrimary = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const clamp = (v: number) => Math.min(255, Math.max(0, v));
    const delta = Math.round((percent / 100) * 255);
    const r = clamp((num >> 16) + delta);
    const g = clamp(((num >> 8) & 0xff) + delta);
    const b = clamp((num & 0xff) + delta);
    const toHex = (v: number) => v.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const inputBase =
    "w-full border rounded-md px-3 py-2 text-sm placeholder:text-xs placeholder:text-gray-400/80 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-gray-300";
const numberInput =
    `${inputBase} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;
const selectBase =
    "w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-300";
const labelBase = "text-[11px] uppercase tracking-wide text-gray-600";

type BoolAny = "any" | "true" | "false";

export type Filters = {
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

type FiltersModalProps = {
    open: boolean;
    onClose: () => void;

    // The *applied* filters coming from Reports.tsx
    filters: Filters;

    // Called with the *new* filters when the user clicks Apply
    onApply: (next: Filters) => void;

    // Clear both local draft and applied filters
    onClear: () => void;
};

const applyButtonGradient = (() => {
    const { brandPrimary } = BRAND_CONFIG.colors.legacy;
    const darkerPrimary = shadeWithPrimary(brandPrimary, -20);
    return `linear-gradient(90deg, ${brandPrimary}, ${darkerPrimary})`;
})();

const dateInput = (v?: string) => (v ? v : "");

// Helper to trim empty values before apply
function trim<T extends Record<string, any>>(obj: T): T {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === undefined || v === null || v === "" || v === "any") continue;
        out[k] = v;
    }
    return out as T;
}

export default function FiltersModal({
    open,
    onClose,
    filters,
    onApply,
    onClear,
}: FiltersModalProps) {
    const [local, setLocal] = useState<Filters>(filters);


    useEffect(() => {
        if (open) setLocal(filters);
    }, [open, filters]);

    const setField = <K extends keyof Filters>(key: K, val: Filters[K]) =>
        setLocal((prev) => ({ ...prev, [key]: val }));

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            onKeyDown={(e) => e.key === "Escape" && onClose()}
        >
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-[61] w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                    <h3 className="text-base font-semibold">Filters</h3>
                    <button
                        onClick={onClose}
                        aria-label="Close filters"
                        className="rounded-md px-2 py-1 text-sm hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-5 py-4 overflow-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div>
                            <label className={labelBase}>Start date</label>
                            <input
                                type="datetime-local"
                                value={dateInput(local.startDate)}
                                onChange={(e) => setField("startDate", e.target.value || undefined)}
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <label className={labelBase}>End date</label>
                            <input
                                type="datetime-local"
                                value={dateInput(local.endDate)}
                                onChange={(e) => setField("endDate", e.target.value || undefined)}
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <label className={labelBase}>Created start date</label>
                            <input
                                type="datetime-local"
                                value={dateInput(local.createdStartDate)}
                                onChange={(e) => setField("createdStartDate", e.target.value || undefined)}
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <label className={labelBase}>Created end date</label>
                            <input
                                type="datetime-local"
                                value={dateInput(local.createdEndDate)}
                                onChange={(e) => setField("createdEndDate", e.target.value || undefined)}
                                className={inputBase}
                            />
                        </div>

                        {/* Sales */}
                        <div>
                            <label className={labelBase}>Sales status</label>
                            <select
                                value={local.salesStatus ?? ""}
                                onChange={(e) => setField("salesStatus", (e.target.value || undefined) as Filters["salesStatus"])}
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
                                value={local.agentId ?? ""}
                                onChange={(e) => setField("agentId", e.target.value || undefined)}
                                className={inputBase}
                                placeholder="507f1f77bcf86cd799439011"
                            />
                        </div>
                        <div>
                            <label className={labelBase}>Agent category</label>
                            <select
                                value={local.agentCategory ?? ""}
                                onChange={(e) => setField("agentCategory", (e.target.value || undefined) as Filters["agentCategory"])}
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
                                value={local.customerId ?? ""}
                                onChange={(e) => setField("customerId", e.target.value || undefined)}
                                className={inputBase}
                                placeholder="507f1f77bcf86cd799439011"
                            />
                        </div>
                        <div>
                            <label className={labelBase}>Customer status</label>
                            <select
                                value={local.customerStatus ?? ""}
                                onChange={(e) => setField("customerStatus", (e.target.value || undefined) as Filters["customerStatus"])}
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
                                value={local.customerType ?? ""}
                                onChange={(e) => setField("customerType", e.target.value || undefined)}
                                className={inputBase}
                                placeholder="residential"
                            />
                        </div>
                        <div>
                            <label className={labelBase}>Customer state</label>
                            <input
                                value={local.customerState ?? ""}
                                onChange={(e) => setField("customerState", e.target.value || undefined)}
                                className={inputBase}
                                placeholder="Lagos"
                            />
                        </div>
                        <div>
                            <label className={labelBase}>Customer LGA</label>
                            <input
                                value={local.customerLga ?? ""}
                                onChange={(e) => setField("customerLga", e.target.value || undefined)}
                                className={inputBase}
                                placeholder="Ikeja"
                            />
                        </div>

                        {/* Payment */}
                        <div>
                            <label className={labelBase}>Payment status</label>
                            <select
                                value={local.paymentStatus ?? ""}
                                onChange={(e) => setField("paymentStatus", (e.target.value || undefined) as Filters["paymentStatus"])}
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
                                value={local.paymentMethod ?? ""}
                                onChange={(e) => setField("paymentMethod", (e.target.value || undefined) as Filters["paymentMethod"])}
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
                                value={local.minAmount ?? ""}
                                onChange={(e) => setField("minAmount", e.target.value ? Number(e.target.value) : undefined)}
                                className={numberInput}
                                placeholder="1000"
                            />
                        </div>
                        <div>
                            <label className={labelBase}>Max amount</label>
                            <input
                                type="number"
                                value={local.maxAmount ?? ""}
                                onChange={(e) => setField("maxAmount", e.target.value ? Number(e.target.value) : undefined)}
                                className={numberInput}
                                placeholder="100000"
                            />
                        </div>

                        {/* Product / Device */}
                        <div>
                            <label className={labelBase}>Product ID</label>
                            <input
                                value={local.productId ?? ""}
                                onChange={(e) => setField("productId", e.target.value || undefined)}
                                className={inputBase}
                                placeholder="507f1f77bcf86cd799439011"
                            />
                        </div>
                        <div>
                            <label className={labelBase}>Product name</label>
                            <input
                                value={local.productName ?? ""}
                                onChange={(e) => setField("productName", e.target.value || undefined)}
                                className={inputBase}
                                placeholder="Solar Panel 100W"
                            />
                        </div>
                        <div>
                            <label className={labelBase}>Serial number</label>
                            <input
                                value={local.serialNumber ?? ""}
                                onChange={(e) => setField("serialNumber", e.target.value || undefined)}
                                className={inputBase}
                                placeholder="SN123456789"
                            />
                        </div>
                        <div>
                            <label className={labelBase}>State</label>
                            <input
                                value={local.state ?? ""}
                                onChange={(e) => setField("state", e.target.value || undefined)}
                                className={inputBase}
                                placeholder="Lagos"
                            />
                        </div>
                        <div>
                            <label className={labelBase}>LGA</label>
                            <input
                                value={local.lga ?? ""}
                                onChange={(e) => setField("lga", e.target.value || undefined)}
                                className={inputBase}
                                placeholder="Ikeja"
                            />
                        </div>
                        <div>
                            <label className={labelBase}>Installer name</label>
                            <input
                                value={local.installerName ?? ""}
                                onChange={(e) => setField("installerName", e.target.value || undefined)}
                                className={inputBase}
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Flags / counts */}
                        <div>
                            <label className={labelBase}>Has multiple payments</label>
                            <select
                                value={local.hasMultiplePayments ?? "any"}
                                onChange={(e) => setField("hasMultiplePayments", (e.target.value as BoolAny) || "any")}
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
                                value={local.hasMadeRepayments ?? "any"}
                                onChange={(e) => setField("hasMadeRepayments", (e.target.value as BoolAny) || "any")}
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
                                value={local.paymentOverdue ?? "any"}
                                onChange={(e) => setField("paymentOverdue", (e.target.value as BoolAny) || "any")}
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
                                value={local.fullyPaid ?? "any"}
                                onChange={(e) => setField("fullyPaid", (e.target.value as BoolAny) || "any")}
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
                                value={local.hasOutstandingBalance ?? "any"}
                                onChange={(e) => setField("hasOutstandingBalance", (e.target.value as BoolAny) || "any")}
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
                                value={local.minPaymentCount ?? ""}
                                onChange={(e) => setField("minPaymentCount", e.target.value ? Number(e.target.value) : undefined)}
                                className={numberInput}
                                placeholder="2"
                            />
                        </div>
                        <div>
                            <label className={labelBase}>Max payment count</label>
                            <input
                                type="number"
                                value={local.maxPaymentCount ?? ""}
                                onChange={(e) => setField("maxPaymentCount", e.target.value ? Number(e.target.value) : undefined)}
                                className={numberInput}
                                placeholder="10"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-5 py-3 border-t flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                    <button
                        className="text-sm border rounded-md px-3 py-2 hover:bg-gray-50"
                        onClick={() => {
                            setLocal({}); // clear the draft
                            onClear();    // clear applied filters in parent (will refetch)
                        }}
                    >
                        Clear filters
                    </button>

                    <button
                        className="text-sm text-white rounded-md px-3 py-2 border border-transparent hover:opacity-95"
                        style={{
                            backgroundImage: applyButtonGradient,
                            borderColor: BRAND_CONFIG.colors.legacy.brandPrimary,
                        }}
                        onClick={() => {
                            const next = trim(local); 
                            onApply(next);            
                        }}
                        title="Apply filters"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
