import { useState } from "react";
import { toast } from "react-toastify";
import { Modal } from "@/Components/ModalComponent/Modal";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { DataStateWrapper } from "@/Components/Loaders/DataStateWrapper";
import { Tag } from "@/Components/Products/ProductDetails";
import { NairaSymbol } from "@/Components/CardComponents/CardComponent";
import TabComponent from "@/Components/TabComponent/TabComponent";
import { formatDateTime, formatNumberWithCommas, resolveApiAssetUrl } from "@/utils/helpers";
import { KeyedMutator } from "swr";
import useTokens from "@/hooks/useTokens";
import { canSendInvoiceToCustomer, getSaleCustomerEmail } from "@/utils/authSession";

const normalizeRoleKey = (role?: string | null): string =>
  String(role ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");


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
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status] ?? STATUS_STYLES.SENT}`}>
    {status.replace(/_/g, " ")}
  </span>
);

// ─── Pay modal ────────────────────────────────────────────────────────────────

const PayModal = ({
  invoice,
  saleItems,
  onClose,
  onDone,
}: {
  invoice: any;
  saleItems?: { id: string; productName?: string; total?: number }[];
  onClose: () => void;
  onDone: () => void;
}) => {
  const { apiCall } = useApiCall();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [notes, setNotes]   = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError]   = useState("");
  const [saleItemId, setSaleItemId] = useState<string>(
    saleItems && saleItems.length > 0 ? saleItems[0].id : ""
  );

  const balance = invoice.balance ?? Math.max(0, invoice.totalAmount - (invoice.liveAmountPaid ?? 0));

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }
    if (amt > balance)    { setError(`Exceeds balance ₦${formatNumberWithCommas(balance)}`); return; }
    setPaying(true); setError("");
    try {
      await apiCall({
        method: "post",
        endpoint: `/v1/invoices/${invoice.id}/pay`,
        data: { amount: amt, paymentMethod: method, notes: notes || undefined, saleItemId: saleItemId || undefined },
        headers: { "Idempotency-Key": `${invoice.id}-${Date.now()}` },
      });
      toast.success("Payment recorded");
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.message?.[0] ?? err?.message ?? "Failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-textDarkGrey">
          Pay — {invoice.invoiceNumber}
        </h3>
        <p className="text-xs text-textLightGrey">
          Balance: <span className="font-bold text-textDarkGrey">₦{formatNumberWithCommas(balance)}</span>
        </p>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Amount (₦)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Payment method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}
            className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full bg-white focus:outline-none">
            <option value="CASH">Cash</option>
            {/* <option value="WALLET">Wallet</option> */}
            <option value="ONLINE">Online</option>
          </select>
        </div>
        {saleItems && saleItems.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textDarkGrey">Sale Item (optional)</label>
            <select value={saleItemId} onChange={(e) => setSaleItemId(e.target.value)}
              className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full bg-white focus:outline-none">
              {saleItems.map((item) => (
                <option key={item.id} value={item.id}>{item.productName ?? item.id.slice(-8)}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Notes (optional)</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment notes…"
            className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full focus:outline-none" />
        </div>

        {error && <p className="text-xs text-errorTwo font-semibold">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
            Cancel
          </button>
          <button onClick={submit} disabled={paying}
            className="flex-1 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white disabled:opacity-60">
            {paying ? "Processing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};


// ─── Sub-Invoice modal (embedded) ─────────────────────────────────────────────

const SubInvoiceModal = ({
  masterInvoice,
  onClose,
  onDone,
}: {
  masterInvoice: any;
  onClose: () => void;
  onDone: () => void;
}) => {
  const { apiCall } = useApiCall();
  const liveBalance = masterInvoice.balance ??
    Math.max(0, masterInvoice.totalAmount - (masterInvoice.liveAmountPaid ?? masterInvoice.amountPaid ?? 0));
  const [amount, setAmount]     = useState("");
  const [dueDate, setDueDate]   = useState("");
  const [note, setNote]         = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError]       = useState("");

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)  { setError("Enter a valid amount"); return; }
    if (amt > liveBalance) { setError(`Exceeds balance (₦${formatNumberWithCommas(liveBalance)})`); return; }
    setCreating(true); setError("");
    try {
      await apiCall({
        method: "post",
        endpoint: "/v1/invoices/sub",
        data: { masterInvoiceId: masterInvoice.id, amount: amt, dueDate: dueDate || undefined, note: note || undefined },
        headers: { "Idempotency-Key": `sub-${masterInvoice.id}-${Date.now()}` },
      });
      toast.success("Sub-invoice created");
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.message?.[0] ?? err?.message ?? "Failed");
    } finally { setCreating(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-textDarkGrey">Create Sub-Invoice</h3>
        <p className="text-xs text-textLightGrey">
          Under <span className="font-semibold text-textDarkGrey">{masterInvoice.invoiceNumber}</span>
          {" "}· Available: <span className="font-bold text-textDarkGrey">₦{formatNumberWithCommas(liveBalance)}</span>
        </p>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Amount (₦) *</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Due Date (optional)</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full bg-white focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Note (optional)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. First instalment" className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full focus:outline-none" />
        </div>
        {error && <p className="text-xs text-errorTwo font-semibold">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">Cancel</button>
          <button onClick={submit} disabled={creating} className="flex-1 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white disabled:opacity-60">
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Detail modal ─────────────────────────────────────────────────────────────

const InvoiceDetailModal = ({
  invoiceId,
  isOpen,
  onClose,
  onRefresh,
}: {
  invoiceId: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: KeyedMutator<any>;
}) => {
  const { apiCall }     = useApiCall();
  const userData        = useTokens();
  const roleKey         = normalizeRoleKey(userData?.role?.role as string | undefined);
  const isTenantAdmin     = roleKey === "TENANT_ADMIN";
  const isInvoiceOfficer  = roleKey === "INVOICE_OFFICER";
  const canManageInvoice  = isTenantAdmin || isInvoiceOfficer;
  const canSendToCustomer = canSendInvoiceToCustomer(userData);
  const receiptsEnabled = true;
  const [showPay, setShowPay]             = useState(false);
  const [regenLoading, setRegenLoading]   = useState(false);
  const [regenConfirm, setRegenConfirm]   = useState(false);
  const [downloadConfirm, setDownloadConfirm] = useState(false);
  const [sendLoading, setSendLoading]     = useState(false);
  const [subRegenMap, setSubRegenMap]     = useState<Record<string, boolean>>({});
  const [subRegenConfirm, setSubRegenConfirm] = useState<string | null>(null);
  const [subDownloadConfirm, setSubDownloadConfirm] = useState<string | null>(null);
  const [subSendMap, setSubSendMap]       = useState<Record<string, boolean>>({});
  const [sendConfirm, setSendConfirm]     = useState(false);
  const [subSendConfirm, setSubSendConfirm] = useState<string | null>(null);
  const [voidConfirm, setVoidConfirm]     = useState(false);
  const [receiptConfirm, setReceiptConfirm] = useState(false);
  const [receiptSendConfirm, setReceiptSendConfirm] = useState<string | null>(null);
  const [receiptGenerateConfirm, setReceiptGenerateConfirm] = useState<string | null>(null);
  const [receiptSendByPayment, setReceiptSendByPayment] = useState<Record<string, boolean>>({});
  const [voiding, setVoiding]             = useState(false);
  const [voidReason, setVoidReason]       = useState("");
  const [showSubInvoice, setShowSubInvoice] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptSendLoading, setReceiptSendLoading] = useState(false);
  const [receiptByPaymentLoading, setReceiptByPaymentLoading] = useState<
    Record<string, boolean>
  >({});
  const [tabContent, setTabContent] = useState("summary");

  const { data: invoice, isLoading, error, errorStates, mutate } = useGetRequest(
    isOpen ? `/v1/invoices/${invoiceId}` : null,
    true,
    10000,
  );

  const refresh = () => { mutate(); onRefresh?.(); };
  const openPdf = (pdfUrl?: string | null) => {
    if (!pdfUrl) return;
    window.open(resolveApiAssetUrl(pdfUrl), "_blank", "noopener,noreferrer");
  };

  const handleVoid = async () => {
    setVoiding(true);
    try {
      await apiCall({
        method: "patch",
        endpoint: `/v1/invoices/${invoiceId}/void`,
        data: { reason: voidReason.trim() || "Voided by user" },
      });
      toast.success("Invoice voided");
      refresh();
      setVoidConfirm(false);
      setVoidReason("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.[0] ?? err?.message ?? "Failed to void");
    } finally {
      setVoiding(false);
    }
  };

  const handleRegenPdf = async () => {
    setRegenLoading(true);
    try {
      await apiCall({
        method: "post",
        endpoint: `/v1/invoices/${invoiceId}/pdf`,
      });
      toast.success("PDF regenerated — link updated");
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.[0] ?? err?.message ?? "PDF regeneration failed");
    } finally {
      setRegenLoading(false);
      setRegenConfirm(false);
    }
  };

  const customerEmail = getSaleCustomerEmail(invoice?.sale);

  const handleSend = async () => {
    if (!customerEmail) {
      toast.error("Customer has no email on file — add an email to the customer profile first.");
      setSendConfirm(false);
      return;
    }
    setSendLoading(true);
    try {
      const res = await apiCall({ method: "post", endpoint: `/v1/invoices/${invoiceId}/send` });
      toast.success((res as any)?.message ?? "Invoice sent to customer email");
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.[0] ?? err?.message ?? "Failed to send invoice");
    } finally {
      setSendLoading(false);
      setSendConfirm(false);
    }
  };

  const handleSubRegen = async (subId: string) => {
    setSubRegenMap((m) => ({ ...m, [subId]: true }));
    try {
      await apiCall({ method: "post", endpoint: `/v1/invoices/${subId}/pdf` });
      toast.success("Sub-invoice PDF generated");
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.[0] ?? err?.message ?? "PDF generation failed");
    } finally {
      setSubRegenMap((m) => ({ ...m, [subId]: false }));
    }
  };



  const handleGenerateReceipt = async (paymentId?: string) => {
    if (paymentId) {
      setReceiptByPaymentLoading((m) => ({ ...m, [paymentId]: true }));
    } else {
      setReceiptLoading(true);
    }
    try {
      const res = await apiCall({
        method: "post",
        endpoint: `/v1/invoices/${invoiceId}/receipt`,
        data: paymentId ? { paymentId } : undefined,
      });
      const receiptNo = (res as any)?.receiptNumber;
      toast.success(receiptNo ? `Receipt ${receiptNo} generated` : "Receipt generated");
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.[0] ?? err?.message ?? "Failed to generate receipt");
    } finally {
      if (paymentId) {
        setReceiptByPaymentLoading((m) => ({ ...m, [paymentId]: false }));
      } else {
        setReceiptLoading(false);
      }
    }
  };

  const handleSendReceipt = async (paymentId?: string) => {
    if (paymentId) {
      setReceiptSendByPayment((m) => ({ ...m, [paymentId]: true }));
    } else {
      setReceiptSendLoading(true);
    }
    try {
      const res = await apiCall({
        method: "post",
        endpoint: `/v1/invoices/${invoiceId}/receipt/send`,
        data: paymentId ? { paymentId } : undefined,
      });
      toast.success((res as any)?.message ?? "Receipt sent to customer email");
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.[0] ?? err?.message ?? "Failed to send receipt");
    } finally {
      if (paymentId) {
        setReceiptSendByPayment((m) => ({ ...m, [paymentId]: false }));
      } else {
        setReceiptSendLoading(false);
      }
      setReceiptSendConfirm(null);
    }
  };

  const handleSubSend = async (subId: string) => {
    setSubSendMap((m) => ({ ...m, [subId]: true }));
    try {
      const res = await apiCall({ method: "post", endpoint: `/v1/invoices/${subId}/send` });
      toast.success((res as any)?.message ?? "Sub-invoice sent to customer");
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.[0] ?? err?.message ?? "Failed to send");
    } finally {
      setSubSendMap((m) => ({ ...m, [subId]: false }));
      setSubSendConfirm(null);
    }
  };

  const isVoid = invoice?.status === "VOID" || invoice?.derivedStatus === "VOID";
  const isPaid = invoice?.derivedStatus === "PAID";
  const balance = invoice?.balance ?? Math.max(0, (invoice?.totalAmount ?? 0) - (invoice?.liveAmountPaid ?? 0));
  const customerName = (() => {
    const c = invoice?.sale?.customer;
    if (!c) return "—";
    const full = [c.firstname, c.lastname].filter(Boolean).join(" ").trim();
    return full || c.email || c.phone || "—";
  })();

  const receiptByPaymentId: Record<string, { receiptNumber: string; pdfUrl?: string | null }> =
    {};
  if (Array.isArray(invoice?.receipts)) {
    for (const r of invoice.receipts) {
      if (r.paymentId) {
        receiptByPaymentId[r.paymentId] = r;
      }
    }
  }
  const tabs = [
    { name: "Summary", key: "summary", count: null },
    ...(receiptsEnabled ? [{ name: "Receipt", key: "receipt", count: Array.isArray(invoice?.receipts) ? invoice.receipts.length : 0 }] : []),
    { name: "Line Items", key: "items", count: Array.isArray(invoice?.lineItems) ? invoice.lineItems.length : 0 },
    { name: "Payments", key: "payments", count: Array.isArray(invoice?.payments) ? invoice.payments.length : 0 },
    { name: "Sub-Invoices", key: "subInvoices", count: Array.isArray(invoice?.subInvoices) ? invoice.subInvoices.length : 0 },
  ];

  return (
    <Modal
      layout="right"
      size="large"
      bodyStyle="pb-32 overflow-auto"
      isOpen={isOpen}
      onClose={() => {
        setTabContent("summary");
        onClose();
      }}
      leftHeaderComponents={
        invoice ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-textDarkGrey">
              {invoice.invoiceNumber}
            </span>
            <StatusBadge status={invoice.derivedStatus ?? invoice.status} />
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4 px-4 py-2">
        <DataStateWrapper
          isLoading={isLoading}
          error={error}
          errorStates={errorStates}
          refreshData={mutate}
          errorMessage="Failed to load invoice"
        >
          {invoice && (
            <>
              <TabComponent
                tabs={tabs}
                onTabSelect={(key) => setTabContent(key)}
              />

              {/* ── Key figures ── */}
              {tabContent === "summary" && (
              <div className="flex flex-col p-3 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[16px]">
                <p className="text-[10px] font-medium text-textLightGrey uppercase pb-1">Overview</p>
                <div className="flex items-center justify-between">
                  <Tag name="Invoice No." />
                  <span className="text-xs font-bold text-textDarkGrey">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Customer" />
                  <span className="text-xs text-textDarkGrey font-semibold">{customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Type" />
                  <span className="text-[11px] font-semibold bg-[#F6F8FA] px-2 py-0.5 rounded-full border border-strokeGreyTwo text-textDarkGrey">
                    {invoice.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Status" />
                  <StatusBadge status={invoice.derivedStatus ?? invoice.status} />
                </div>
                {invoice.dueDate && (
                  <div className="flex items-center justify-between">
                    <Tag name="Due Date" />
                    <span className="text-xs text-textDarkGrey font-semibold">{formatDateTime("datetime", invoice.dueDate)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Tag name="Created" />
                  <span className="text-xs text-textDarkGrey">{formatDateTime("datetime", invoice.createdAt)}</span>
                </div>
              </div>
              )}

              {/* ── Amounts ── */}
              {tabContent === "summary" && (
              <div className="flex flex-col p-3 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[16px]">
                <p className="text-[10px] font-medium text-textLightGrey uppercase pb-1">Amounts</p>
                {invoice.subtotal !== invoice.totalAmount && (
                  <div className="flex items-center justify-between">
                    <Tag name="Subtotal" />
                    <div className="flex items-center gap-0.5"><NairaSymbol /><span className="text-xs text-textDarkGrey">{formatNumberWithCommas(invoice.subtotal)}</span></div>
                  </div>
                )}
                {invoice.taxEnabled && invoice.taxAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <Tag name={`${invoice.taxName ?? "Tax"} (${invoice.taxRate}%)`} />
                    <div className="flex items-center gap-0.5"><NairaSymbol /><span className="text-xs text-textDarkGrey">{formatNumberWithCommas(invoice.taxAmount)}</span></div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Tag name="Total" />
                  <div className="flex items-center gap-0.5"><NairaSymbol /><span className="text-xs font-bold text-textDarkGrey">{formatNumberWithCommas(invoice.totalAmount)}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Paid (live)" />
                  <div className="flex items-center gap-0.5"><NairaSymbol /><span className="text-xs font-semibold text-[#059669]">{formatNumberWithCommas(invoice.liveAmountPaid ?? 0)}</span></div>
                </div>
                <div className="flex items-center justify-between border-t border-strokeGreyThree pt-2 mt-1">
                  <Tag name="Balance" />
                  <div className="flex items-center gap-0.5">
                    <NairaSymbol />
                    <span className={`text-xs font-bold ${balance > 0 ? "text-errorTwo" : "text-[#059669]"}`}>
                      {formatNumberWithCommas(Math.max(0, balance))}
                    </span>
                  </div>
                </div>
              </div>
              )}

              {receiptsEnabled && tabContent === "receipt" && (
                <div className="flex flex-col p-4 gap-3 bg-white border border-strokeGreyThree rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <p className="text-[10px] font-semibold tracking-wide text-textLightGrey uppercase pb-1">Receipt</p>
                  {Array.isArray((invoice as any).receipts) && (invoice as any).receipts.length > 0 ? (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#E9EEF5] bg-[#FAFCFF]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-textDarkGrey">Latest Receipt</span>
                        <span className="text-[11px] text-textLightGrey">{(invoice as any).receipts[0].receiptNumber}</span>
                      </div>
                      {(invoice as any).receipts[0].pdfUrl ? (
                        <a
                          href={resolveApiAssetUrl((invoice as any).receipts[0].pdfUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-[11px] font-semibold rounded-full border border-strokeGreyTwo bg-white text-textDarkGrey hover:bg-[#F8FAFC]"
                        >
                          Download Receipt
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-textLightGrey">No receipt generated yet.</p>
                  )}
                  {canSendToCustomer && !isVoid && (
                    <div className="flex justify-end gap-2 flex-wrap pt-1">
                      {Array.isArray((invoice as any).receipts) && (invoice as any).receipts.length > 0 && (
                        <button
                          onClick={() => setReceiptSendConfirm("latest")}
                          disabled={receiptSendLoading}
                          className="px-4 py-2 text-xs font-semibold rounded-full border border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8] disabled:opacity-60"
                        >
                          {receiptSendLoading ? "Sending…" : "Send to Customer"}
                        </button>
                      )}
                      <button
                        onClick={() => setReceiptConfirm(true)}
                        disabled={receiptLoading || (invoice?.liveAmountPaid ?? 0) <= 0}
                        className="px-4 py-2 text-xs font-semibold rounded-full border border-[#059669] bg-[#ECFDF5] text-[#059669] disabled:opacity-60"
                      >
                        {receiptLoading ? "Generating…" : "Generate Receipt"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Line Items ── */}
              {tabContent === "items" && (
                <div className="flex flex-col p-4 gap-3 bg-white border border-strokeGreyThree rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <p className="text-[10px] font-semibold tracking-wide text-textLightGrey uppercase pb-1">Line Items</p>
                  {Array.isArray(invoice.lineItems) && invoice.lineItems.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {invoice.lineItems.map((item: any) => (
                      <div key={item.id} className="flex items-start justify-between gap-2 py-2.5 px-3 border border-[#E9EEF5] bg-[#FAFCFF] rounded-xl">
                        <div className="flex flex-col gap-0.5 flex-1">
                          <span className="text-xs font-semibold text-textDarkGrey">{item.description}</span>
                          <span className="text-[11px] text-textLightGrey">
                            {item.quantity} × ₦{formatNumberWithCommas(item.unitPrice)}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <NairaSymbol />
                          <span className="text-xs font-bold text-textDarkGrey">{formatNumberWithCommas(item.total)}</span>
                        </div>
                      </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-textLightGrey">No line items available.</p>
                  )}
                </div>
              )}

              {/* ── Sub-invoices ── */}
              {tabContent === "subInvoices" && (
                <div className="flex flex-col p-3 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[16px]">
                  <p className="text-[10px] font-medium text-textLightGrey uppercase pb-1">Sub-Invoices</p>
                  {Array.isArray(invoice.subInvoices) && invoice.subInvoices.length > 0 ? invoice.subInvoices.map((sub: any) => (
                    <div key={sub.id} className="flex flex-col gap-1.5 py-2 border-b border-strokeGreyThree last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-textDarkGrey font-semibold">{sub.invoiceNumber ?? "Sub"}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5"><NairaSymbol /><span className="text-xs text-textDarkGrey">{formatNumberWithCommas(sub.totalAmount)}</span></div>
                          <StatusBadge status={sub.status} />
                        </div>
                      </div>
                      {/* Sub-invoice PDF + Send actions */}
                      {sub.status !== "VOID" && canSendToCustomer && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {sub.pdfUrl && (
                            <button
                              type="button"
                              onClick={() => setSubDownloadConfirm(sub.id)}
                              className="px-3 py-1 text-[10px] font-semibold rounded-full bg-[#F6F8FA] border border-strokeGreyTwo text-textDarkGrey flex items-center gap-1"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                              </svg>
                              PDF
                            </button>
                          )}
                          {isTenantAdmin && (
                            <button
                              onClick={() => setSubRegenConfirm(sub.id)}
                              disabled={!!subRegenMap[sub.id]}
                              className="px-3 py-1 text-[10px] font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey disabled:opacity-60 flex items-center gap-1"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                              </svg>
                              {subRegenMap[sub.id] ? "Generating…" : "Generate PDF"}
                            </button>
                          )}
                          <button
                            onClick={() => setSubSendConfirm(sub.id)}
                            disabled={!!subSendMap[sub.id]}
                            className="px-3 py-1 text-[10px] font-semibold rounded-full border border-blue-300 text-blue-600 disabled:opacity-60 flex items-center gap-1"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                            {subSendMap[sub.id] ? "Sending…" : "Send"}
                          </button>
                        </div>
                      )}
                    </div>
                  )) : (
                    <p className="text-xs text-textLightGrey">No sub-invoices yet.</p>
                  )}
                </div>
              )}


              {/* ── Payments ── */}
              {tabContent === "payments" && (
                <div className="flex flex-col p-4 gap-3 bg-white border border-strokeGreyThree rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <p className="text-[10px] font-semibold tracking-wide text-textLightGrey uppercase pb-1">Payments Received</p>
                  {Array.isArray(invoice.payments) && invoice.payments.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {invoice.payments.map((pmt: any) => {
                        const existingReceipt = receiptByPaymentId[pmt.id];
                        const genLoading = !!receiptByPaymentLoading[pmt.id];
                        return (
                      <div key={pmt.id} className="flex flex-col gap-2 py-2.5 px-3 border border-[#E9EEF5] bg-[#FAFCFF] rounded-xl">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-0.5 flex-1">
                            <span className="text-[11px] font-semibold text-textDarkGrey">
                              {pmt.paymentMethod?.replace(/_/g, " ") ?? "Payment"}
                            </span>
                            <span className="text-[10px] text-textLightGrey">
                              {formatDateTime("datetime", pmt.paymentDate ?? pmt.createdAt)}
                              {pmt.recordedBy && (
                                <> &middot; {[pmt.recordedBy.firstname, pmt.recordedBy.lastname].filter(Boolean).join(" ")}</>
                              )}
                            </span>
                            {pmt.notes && <span className="text-[10px] text-textLightGrey italic">{pmt.notes}</span>}
                            {existingReceipt && (
                              <span className="text-[10px] font-medium text-[#059669]">
                                Receipt: {existingReceipt.receiptNumber}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <NairaSymbol />
                            <span className="text-xs font-bold text-[#059669]">{formatNumberWithCommas(pmt.amount)}</span>
                          </div>
                        </div>
                        {!isVoid && pmt.paymentStatus !== "PENDING" && (
                          <div className="flex justify-end gap-2 flex-wrap">
                            {existingReceipt?.pdfUrl ? (
                              <a
                                href={resolveApiAssetUrl(existingReceipt.pdfUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-[10px] font-semibold rounded-full border border-strokeGreyTwo bg-white text-textDarkGrey"
                              >
                                View Receipt
                              </a>
                            ) : null}
                            {canSendToCustomer && existingReceipt && (
                              <button
                                type="button"
                                onClick={() => setReceiptSendConfirm(pmt.id)}
                                disabled={!!receiptSendByPayment[pmt.id]}
                                className="px-3 py-1 text-[10px] font-semibold rounded-full border border-blue-300 bg-[#EFF6FF] text-blue-600 disabled:opacity-60"
                              >
                                {receiptSendByPayment[pmt.id] ? "Sending…" : "Send to Customer"}
                              </button>
                            )}
                            {canManageInvoice && (
                              <button
                                type="button"
                                onClick={() => setReceiptGenerateConfirm(pmt.id)}
                                disabled={genLoading}
                                className="px-3 py-1 text-[10px] font-semibold rounded-full border border-[#059669] bg-[#ECFDF5] text-[#059669] disabled:opacity-60"
                              >
                                {genLoading
                                  ? "Generating…"
                                  : existingReceipt
                                    ? "Regenerate Receipt"
                                    : "Generate Receipt"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-textLightGrey">No payments recorded yet.</p>
                  )}
                </div>
              )}

              {tabContent === "summary" && isVoid && (
                <div className="flex flex-col p-3 gap-1.5 bg-[#FEF2F2] border border-[#FECACA] rounded-[16px]">
                  <p className="text-[10px] font-medium text-[#DC2626] uppercase">Void Reason</p>
                  {invoice.voidReason && (
                    <p className="text-xs text-[#DC2626]">{invoice.voidReason}</p>
                  )}
                  {invoice.voidedByName && (
                    <p className="text-[11px] text-[#DC2626] opacity-75">
                      Voided by <span className="font-semibold">{invoice.voidedByName}</span>
                      {invoice.voidedAt && (
                        <span> &middot; {formatDateTime("datetime", invoice.voidedAt)}</span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* ── PDF ── */}
              {tabContent === "summary" && (invoice.pdfUrl || isTenantAdmin) && (
                <div className="flex gap-2 flex-wrap pt-1">
                  {invoice.pdfUrl && (
                    <button
                      type="button"
                      onClick={() => setDownloadConfirm(true)}
                      className="px-4 py-2 text-xs font-semibold rounded-full bg-[#F6F8FA] border border-strokeGreyTwo text-textDarkGrey flex items-center gap-1.5"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download PDF
                    </button>
                  )}
                  {isTenantAdmin && (
                    <button
                      onClick={() => setRegenConfirm(true)}
                      disabled={regenLoading}
                      className="px-4 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey disabled:opacity-60 flex items-center gap-1.5"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                      </svg>
                      {regenLoading ? "Generating…" : "Regenerate PDF"}
                    </button>
                  )}
                  {canSendToCustomer && !isVoid && (
                    <button
                      onClick={() => setSendConfirm(true)}
                      disabled={sendLoading}
                      className="px-4 py-2 text-xs font-semibold rounded-full border border-blue-300 text-blue-600 disabled:opacity-60 flex items-center gap-1.5"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      {sendLoading ? "Sending…" : "Send to Customer"}
                    </button>
                  )}
                </div>
              )}

              {/* ── Actions ── */}
              {tabContent === "summary" && !isVoid && canManageInvoice && (
                <div className="flex gap-2 flex-wrap pt-1">
                  {!isPaid && (
                    <button
                      onClick={() => setShowPay(true)}
                      className="px-4 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white"
                    >
                      Record Payment
                    </button>
                  )}
                  {invoice.type === "MASTER" && !isPaid &&
                    !(invoice.sale?.saleItems ?? []).some((si: any) => si.paymentMode === "INSTALLMENT") && (
                    <button
                      onClick={() => setShowSubInvoice(true)}
                      className="px-4 py-2 text-xs font-semibold rounded-full border border-primary-hex text-primary-hex"
                    >
                      Create Sub-Invoice
                    </button>
                  )}
                  <button
                    onClick={() => setVoidConfirm(true)}
                    className="px-4 py-2 text-xs font-semibold rounded-full border border-textDarkGrey text-black"
                  >
                    Void Invoice
                  </button>
                </div>
              )}
            </>
          )}
        </DataStateWrapper>
      </div>

      {showPay && invoice && (
        <PayModal
          invoice={invoice}
          saleItems={(invoice.sale?.saleItems ?? []).map((si: any) => ({
            id: si.id,
            productName: si.product?.name,
            total: si.totalPrice,
          }))}
          onClose={() => setShowPay(false)}
          onDone={() => { setShowPay(false); refresh(); }}
        />
      )}

      {/* ── Void reason modal ── */}
      {/* ── Send invoice confirm modal ── */}
      {sendConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Send Invoice to Customer</h3>
            <p className="text-xs text-textLightGrey">
              {customerEmail
                ? <>Email invoice <strong>{invoice?.invoiceNumber}</strong> to <strong>{customerEmail}</strong>?</>
                : "Customer has no email on file. Add an email on the customer profile before sending."}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setSendConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button onClick={() => void handleSend()} disabled={sendLoading || !customerEmail}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-blue-600 text-white disabled:opacity-60">
                {sendLoading ? "Sending…" : "Yes, Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send sub-invoice confirm modal ── */}
      {subSendConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Send Sub-Invoice to Customer</h3>
            <p className="text-xs text-textLightGrey">
              This will email the sub-invoice PDF directly to the customer. Continue?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setSubSendConfirm(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button
                onClick={() => void handleSubSend(subSendConfirm)}
                disabled={!!subSendMap[subSendConfirm] || !customerEmail}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-blue-600 text-white disabled:opacity-60">
                {subSendMap[subSendConfirm] ? "Sending…" : "Yes, Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Regenerate invoice PDF confirm modal ── */}
      {downloadConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Download Invoice PDF</h3>
            <p className="text-xs text-textLightGrey">
              This will open the latest invoice PDF in a new tab. Continue?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDownloadConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button
                onClick={() => { setDownloadConfirm(false); openPdf(invoice?.pdfUrl); }}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {regenConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Regenerate Invoice PDF</h3>
            <p className="text-xs text-textLightGrey">
              This will rebuild and replace the current invoice PDF. Continue?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setRegenConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button
                onClick={() => void handleRegenPdf()}
                disabled={regenLoading}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white disabled:opacity-60">
                {regenLoading ? "Generating…" : "Yes, Regenerate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Regenerate sub-invoice PDF confirm modal ── */}
      {subDownloadConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Download Sub-Invoice PDF</h3>
            <p className="text-xs text-textLightGrey">
              This will open the latest sub-invoice PDF in a new tab. Continue?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setSubDownloadConfirm(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button
                onClick={() => {
                  const subId = subDownloadConfirm;
                  const sub = invoice?.subInvoices?.find((item: any) => item.id === subId);
                  setSubDownloadConfirm(null);
                  openPdf(sub?.pdfUrl);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {subRegenConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Generate Sub-Invoice PDF</h3>
            <p className="text-xs text-textLightGrey">
              This will generate or refresh the PDF for this sub-invoice. Continue?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setSubRegenConfirm(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button
                onClick={() => { const id = subRegenConfirm; setSubRegenConfirm(null); handleSubRegen(id); }}
                disabled={!!subRegenMap[subRegenConfirm]}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white disabled:opacity-60">
                {subRegenMap[subRegenConfirm] ? "Generating…" : "Yes, Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Generate receipt (per payment) confirm modal ── */}
      {receiptGenerateConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Generate Receipt</h3>
            <p className="text-xs text-textLightGrey">
              Create a PDF receipt for this payment on invoice <strong>{invoice?.invoiceNumber}</strong>?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setReceiptGenerateConfirm(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = receiptGenerateConfirm;
                  void handleGenerateReceipt(id).finally(() => setReceiptGenerateConfirm(null));
                }}
                disabled={!!receiptByPaymentLoading[receiptGenerateConfirm]}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-[#059669] text-white disabled:opacity-60">
                {receiptByPaymentLoading[receiptGenerateConfirm] ? "Generating…" : "Yes, Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Generate receipt confirm modal ── */}
      {receiptConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Generate Receipt</h3>
            <p className="text-xs text-textLightGrey">
              This will generate a receipt for the latest completed payment on this invoice. Continue?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setReceiptConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button
                onClick={() => { setReceiptConfirm(false); handleGenerateReceipt(undefined); }}
                disabled={receiptLoading}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-[#059669] text-white disabled:opacity-60">
                {receiptLoading ? "Generating…" : "Yes, Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send receipt confirm modal ── */}
      {receiptSendConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Send Receipt to Customer</h3>
            <p className="text-xs text-textLightGrey">
              {customerEmail
                ? <>Email the receipt to <strong>{customerEmail}</strong>?</>
                : "Customer has no email on file. Add an email before sending."}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setReceiptSendConfirm(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button
                onClick={() =>
                  handleSendReceipt(
                    receiptSendConfirm === "latest" ? undefined : receiptSendConfirm,
                  )
                }
                disabled={
                  !customerEmail ||
                  (receiptSendConfirm === "latest"
                    ? receiptSendLoading
                    : !!receiptSendByPayment[receiptSendConfirm])
                }
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-[#1D4ED8] text-white disabled:opacity-60">
                {(receiptSendConfirm === "latest"
                  ? receiptSendLoading
                  : receiptSendByPayment[receiptSendConfirm])
                  ? "Sending…"
                  : "Yes, Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {voidConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Void Invoice</h3>
            <p className="text-xs text-textLightGrey">
              This action cannot be undone. Optionally provide a reason.
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-textDarkGrey">Reason (optional)</label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Duplicate invoice, customer request…"
                rows={3}
                className="px-3 py-2 text-sm border border-strokeGreyThree rounded-2xl resize-none focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setVoidConfirm(false); setVoidReason(""); }}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button onClick={handleVoid} disabled={voiding}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-[#DC2626] text-white disabled:opacity-60">
                {voiding ? "Voiding…" : "Confirm Void"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-invoice modal (inline, reused from SaleInvoices) ── */}
      {showSubInvoice && invoice && (
        <SubInvoiceModal
          masterInvoice={invoice}
          onClose={() => setShowSubInvoice(false)}
          onDone={() => { setShowSubInvoice(false); refresh(); }}
        />
      )}
    </Modal>
  );
};

export default InvoiceDetailModal;
